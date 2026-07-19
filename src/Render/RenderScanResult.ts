import { CliTable } from "."
import chalk from "chalk"
import { Scan, getStationUrl } from '../ScanLocation'

const RenderScanResult = (data: Scan | undefined) => {
    if (data === undefined) return

    const { LocationCode, LocationName, Trips } = data
        
    if (Trips.length > 0) {
        const stationLink = getStationUrl(LocationName)
        console.log(`LocationCode ${ chalk.bold(`[${ LocationCode }]`) } - ${ chalk.bold.blueBright(LocationName) } (${ chalk.gray(stationLink) })`)
        let table = new CliTable(['# Train number', 'TRAIN', 'FROM', 'TO', 'DELAY', 'SJ LINK'])
        for (const trip of Trips) {
            let departureTime = ''
            let departureRealTime = ''
            let arrivalTime = ''
            let arrivalRealTime = ''

            if (trip.Stations.length > 0) {
                const firstStation = trip.Stations[0]
                const lastStation = trip.Stations[trip.Stations.length - 1]
                if (firstStation.Departure) {
                    departureTime = firstStation.Departure.Time || ''
                    departureRealTime = firstStation.Departure.RealTime || departureTime
                }
                if (lastStation.Arrival) {
                    arrivalTime = lastStation.Arrival.Time || ''
                    arrivalRealTime = lastStation.Arrival.RealTime || arrivalTime
                }
            }

            table.addRows([
                trip.AnnouncedTrainNumber, trip.Operator,
                `${ chalk.gray(departureTime) } ${ chalk.underline(departureRealTime) } - ${ chalk.bold(`[${ trip.StartLocationCode }]`) } ${ trip.StartLocationName }`,
                `${ chalk.gray(arrivalTime) } ${ chalk.underline(arrivalRealTime) } - ${ chalk.bold(`[${ trip.FinalLocationCode }]`) } ${ trip.FinalLocationName }`,
                `${ trip.MinutesDelay }m`,
                trip.url
            ])
        }

        table.render()
        console.log(chalk.bold.underline.greenBright(`Found ${ Trips.length } delayed train(s)!\n`))
    }
}

export default RenderScanResult