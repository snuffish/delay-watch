import { getTrafficInfo, REQUEST_TYPE, getStationName } from './Utils/traffic'
const { JsonObjectMapper } = require('typescript-json-object-mapper')
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

    constructor(data: any) {
        this.AnnouncedTrainNumber = data.AnnouncedTrainNumber
        this.StartLocationCode = data.StartDepartureLocationCode
        this.FinalLocationCode = data.FinalDestinationLocationCode
        this.Operator = data.InformationOwner

        this.StartLocationName = getStationName(this.StartLocationCode)
        this.FinalLocationName = getStationName(this.FinalLocationCode)

        this.url = `https://www2.sj.se/sv/trafikinfo/trafiken-idag.html/search/${this.AnnouncedTrainNumber}/Date/${getDate(FORMAT.DATE)}`

        this.addStations(data.Stations)
    }

    private addStations(stations: StationView[]): void {
        for (const station of stations) {
            const arrivalJson = getJson(station.Arrival, StationInfoView)
            const departureJson = getJson(station.Departure, StationInfoView)
            let { Time, RealTime } = <any>station.Departure

            let stationData: StationView = {
                LocationCode: station.LocationCode,
                IsDelayed: station.IsDelayed,
                IsCancelled: station.IsCancelled,
                Arrival: arrivalJson,
                Departure: departureJson
            }

            if (station.LocationCode !== undefined) {
                stationData.LocationName = getStationName(station.LocationCode)
            }

            const minutesDelay = timeDifference(Time, RealTime)
            stationData.MinutesDelay = minutesDelay

            this.Stations.push(stationData)
        }
    }

    setMinutesDelay = (minutes: number) => this.MinutesDelay = minutes
}

const getJson = <T>(json: any, ViewClass: T): StationInfoView[] => {
    const serialized = JsonObjectMapper.serialize(json, ViewClass).toString()
    return JSON.parse(serialized)
}

export interface Scan {
    LocationCode: string
    LocationName: string
    Trips: Trip[]
}

export const ScanLocation = async (locationCode: string, delayMinutes: number = 20, multiBar: MultiBar = undefined): Promise<Scan | undefined> => {
    locationCode = locationCode.toUpperCase()
    let stationTrafficData = await getTrafficInfo(REQUEST_TYPE.STATION, locationCode)
    let announcedTrainNumbers = stationTrafficData.DepartureConnections.map(train => train.AnnouncedTrainNumber)

    let trips: Trip[] = []

    let progressBar!: ProgressBar
    if (multiBar !== undefined) {
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
                let { Time, RealTime } = <any>station.Departure

                const minutesDelay = timeDifference(Time, RealTime)
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
