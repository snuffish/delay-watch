import { getTrafficInfo, REQUEST_TYPE, getStationName } from './Utils/traffic'
import { getDate, FORMAT, timeDifference } from './Utils/date'
import cliProgress from 'cli-progress'
import StationView from './Views/StationView'
import StationInfoView from './Views/StationInfoView'
import chalk from 'chalk'

type MultiBar = cliProgress.MultiBar | undefined
interface ProgressBar extends cliProgress.SingleBar { value?: number }

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

    constructor(data: any = {}) {
        this.AnnouncedTrainNumber = data.AnnouncedTrainNumber || ''
        this.StartLocationCode = data.StartDepartureLocationCode || ''
        this.FinalLocationCode = data.FinalDestinationLocationCode || ''
        this.Operator = data.InformationOwner || ''

        this.StartLocationName = getStationName(this.StartLocationCode)
        this.FinalLocationName = getStationName(this.FinalLocationCode)

        this.url = `https://www2.sj.se/sv/trafikinfo/trafiken-idag.html/search/${this.AnnouncedTrainNumber}/Date/${getDate(FORMAT.DATE)}`

        if (Array.isArray(data.Stations)) {
            this.addStations(data.Stations)
        }
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

            const minutesDelay = timeDifference(departureTime, departureRealTime)
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

export const ScanLocation = async (locationCode: string, delayMinutes: number = 20, multiBar: MultiBar = undefined): Promise<Scan | undefined> => {
    locationCode = locationCode.toUpperCase()
    let stationTrafficData = await getTrafficInfo(REQUEST_TYPE.STATION, locationCode)
    
    const departureConnections = stationTrafficData?.DepartureConnections || []
    let announcedTrainNumbers = departureConnections.map((train: any) => train.AnnouncedTrainNumber).filter(Boolean)

    let trips: Trip[] = []

    let progressBar: ProgressBar | undefined
    if (multiBar !== undefined && announcedTrainNumbers.length > 0) {
        progressBar = multiBar.create(announcedTrainNumbers.length, 0, {
            StatusText: chalk.red('Scanning'),
            LocationCode: locationCode,
            LocationName: getStationName(locationCode)
        })
    }

    for (const trainNumber of announcedTrainNumbers) {
        let trainTrafficData = await getTrafficInfo(REQUEST_TYPE.TRAIN, trainNumber)
        let trip = new Trip(trainTrafficData)

        for (const station of trip.Stations) {
            if (station.IsDelayed && !trips.includes(trip)) {
                const dep = station.Departure
                const departureTime = dep ? (dep.Time || '') : ''
                const departureRealTime = dep ? (dep.RealTime || '') : ''

                const minutesDelay = timeDifference(departureTime, departureRealTime)
                if (minutesDelay >= delayMinutes) {
                    trip.setMinutesDelay(minutesDelay)
                    trips.push(trip)
                    break
                }
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
        LocationName: getStationName(locationCode),
        Trips: trips
    }

    return scanResult
}
