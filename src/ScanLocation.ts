import { getTrafficInfo, REQUEST_TYPE, getStationName } from './Utils/traffic'
import { getDate, FORMAT, timeDifference } from './Utils/date'
import cliProgress from 'cli-progress'
import StationView from './Views/StationView'
import StationInfoView from './Views/StationInfoView'
import chalk from 'chalk'

type MultiBar = cliProgress.MultiBar | undefined
interface ProgressBar extends cliProgress.SingleBar { value?: number }

export const getStationUrl = (stationName: string, date: string = getDate(FORMAT.DATE)): string => {
    const encodedName = encodeURIComponent(stationName)
    const queryName = encodedName.replace(/%20/g, '+')
    return `https://www.sj.se/trafikinformation/station/${encodedName}?station=${queryName}&date=${date}`
}

export const getTrainUrl = (trainNumber: string, date: string = getDate(FORMAT.DATE)): string => {
    return `https://www.sj.se/trafikinformation/tag/${trainNumber}?date=${date}`
}

export class Trip {
    AnnouncedTrainNumber: string
    Operator: string
    StartLocationCode: string
    StartLocationName: string
    FinalLocationCode: string
    FinalLocationName: string
    url: string
    Stations: StationView[] = []
    MinutesDelay: number = 0

    // Detailed Hit Properties
    OriginalTime: string = ''
    EstimatedTime: string = ''
    Track: string = ''
    TransportType: string = ''
    Remarks: { id?: string; level?: number; information?: string }[] = []
    XodRemarks: { header?: string; content?: string }[] = []
    IsCancelled: boolean = false
    DepartureDate: string = ''

    constructor(data: any = {}, currentStationName: string = '') {
        this.AnnouncedTrainNumber = data.AnnouncedTrainNumber || data.trainNumber || ''
        this.StartLocationCode = data.StartDepartureLocationCode || data.startLocationCode || ''
        this.FinalLocationCode = data.FinalDestinationLocationCode || data.finalLocationCode || ''
        this.Operator = data.InformationOwner || data.operator || data.transportType || ''

        this.StartLocationName = data.StartLocationName || (this.StartLocationCode ? getStationName(this.StartLocationCode) : (currentStationName || ''))
        this.FinalLocationName = data.FinalLocationName || (this.FinalLocationCode ? getStationName(this.FinalLocationCode) : (data.station || ''))

        this.url = getTrainUrl(this.AnnouncedTrainNumber)
        this.Track = data.currentTrack || data.track || data.Track || ''
        this.TransportType = data.transportType || data.TransportType || ''
        this.IsCancelled = !!data.cancelled || !!data.IsCancelled
        this.DepartureDate = data.departureDate || ''

        if (Array.isArray(data.remarks)) {
            this.Remarks = data.remarks
        }
        if (Array.isArray(data.xodRemarks)) {
            this.XodRemarks = data.xodRemarks
        }

        if (data.originalDateTime && data.currentDateTime) {
            this.OriginalTime = data.originalDateTime.includes('T') ? data.originalDateTime.split('T')[1].slice(0, 5) : data.originalDateTime
            this.EstimatedTime = data.currentDateTime.includes('T') ? data.currentDateTime.split('T')[1].slice(0, 5) : data.currentDateTime
            const delay = timeDifference(this.OriginalTime, this.EstimatedTime)
            if (delay > 0) {
                this.MinutesDelay = delay
            }
        }

        if (Array.isArray(data.Stations) && data.Stations.length > 0) {
            this.addStations(data.Stations)
        }
        // else: no real station data available — leave Stations empty (no synthetic route)
    }

    private addStations(stations: any[]): void {
        for (const station of stations) {
            const arrival = station.Arrival ? new StationInfoView(station.Arrival) : undefined
            const departure = station.Departure ? new StationInfoView(station.Departure) : undefined
            const departureTime = departure ? (departure.Time || '') : ''
            const departureRealTime = departure ? (departure.RealTime || '') : ''

            let stationData = new StationView({
                LocationCode: station.LocationCode,
                IsDelayed: station.IsDelayed,
                IsCancelled: station.IsCancelled,
                Arrival: arrival,
                Departure: departure
            })

            if (station.LocationCode) {
                stationData.LocationName = getStationName(station.LocationCode)
            }

            const minutesDelay = station.MinutesDelay !== undefined ? station.MinutesDelay : timeDifference(departureTime, departureRealTime)
            stationData.MinutesDelay = minutesDelay

            this.Stations.push(stationData)
        }
    }

    setMinutesDelay = (minutes: number) => this.MinutesDelay = minutes
}

export interface Scan {
    LocationCode: string
    LocationName: string
    Trips: Trip[]
}

// Delay of a train at the scanned station, from the connection board's full timestamps.
// Using the complete datetimes (not just HH:MM) yields a correct signed delay across
// midnight and reports early trains as negative rather than a ~24h wraparound.
const connectionDelay = (conn: any): number => {
    if (!conn?.originalDateTime || !conn?.currentDateTime) return 0
    const orig = new Date(conn.originalDateTime).getTime()
    const curr = new Date(conn.currentDateTime).getTime()
    if (isNaN(orig) || isNaN(curr)) return 0
    return Math.round((curr - orig) / 60000)
}

// Largest delay across a train's route, considering both arrival and departure legs.
const routeDelay = (trip: Trip): number => {
    let max = 0
    for (const station of trip.Stations) {
        for (const leg of [station.Arrival, station.Departure]) {
            if (leg?.Time && leg?.RealTime) {
                max = Math.max(max, timeDifference(leg.Time, leg.RealTime))
            }
        }
    }
    return max
}

export const ScanLocation = async (locationCode: string, delayMinutes: number = 20, multiBar: MultiBar = undefined): Promise<Scan | undefined> => {
    locationCode = locationCode.toUpperCase()
    let stationTrafficData = await getTrafficInfo(REQUEST_TYPE.STATION, locationCode)
    
    const departureConnections = stationTrafficData?.DepartureConnections || stationTrafficData?.departureConnections || []
    const arrivalConnections = stationTrafficData?.ArrivalConnections || stationTrafficData?.arrivalConnections || []

    // A delayed train at this station may be an arrival OR a departure; a through-train
    // appears in both boards, so merge and de-duplicate by train number.
    const seenConnTrains = new Set<string>()
    const allConnections = [...departureConnections, ...arrivalConnections].filter((c: any) => {
        const tn = c.AnnouncedTrainNumber || c.trainNumber
        if (!tn || seenConnTrains.has(tn)) return false
        seenConnTrains.add(tn)
        return true
    })
    let announcedTrainNumbers = allConnections.map((train: any) => train.AnnouncedTrainNumber || train.trainNumber).filter(Boolean)

    let trips: Trip[] = []

    let progressBar: ProgressBar | undefined
    if (multiBar !== undefined && announcedTrainNumbers.length > 0) {
        progressBar = multiBar.create(announcedTrainNumbers.length, 0, {
            StatusText: chalk.red('Scanning'),
            LocationCode: locationCode,
            LocationName: getStationName(locationCode)
        })
    }

    for (const conn of allConnections) {
        const trainNumber = conn.AnnouncedTrainNumber || conn.trainNumber
        if (!trainNumber) continue

        const trainTrafficData = await getTrafficInfo(REQUEST_TYPE.TRAIN, trainNumber)
        const hasRoute = trainTrafficData && Array.isArray(trainTrafficData.Stations) && trainTrafficData.Stations.length > 0
        const trip = hasRoute ? new Trip(trainTrafficData) : new Trip(conn, getStationName(locationCode))

        // The delay that matters is the train's delay AT this station, which the connection
        // board reports directly. Only fall back to the route's largest delay when the
        // connection carries no timestamps at all (e.g. sparse payloads) — not when the
        // train is genuinely on time.
        const hasConnTimes = !!(conn?.originalDateTime && conn?.currentDateTime)
        let minutesDelay = connectionDelay(conn)
        if (!hasConnTimes) minutesDelay = routeDelay(trip)

        if (minutesDelay >= delayMinutes) {
            trip.setMinutesDelay(minutesDelay)
            if (!trips.some(t => t.AnnouncedTrainNumber === trip.AnnouncedTrainNumber)) {
                trips.push(trip)
            }
        }

        if (progressBar !== undefined) progressBar.increment()
    }

    if (progressBar !== undefined) {
        progressBar.stop()
        progressBar.update(progressBar.value!, { StatusText: 'Complete' })
    }

    const scanResult: Scan = {
        LocationCode: locationCode,
        LocationName: stationTrafficData?.LocationName || stationTrafficData?.locationName || getStationName(locationCode),
        Trips: trips
    }

    return scanResult
}
