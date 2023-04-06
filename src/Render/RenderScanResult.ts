import { CliTable } from "."
import chalk = require("chalk")
import { Scan } from '../ScanLocation'

const RenderScanResult = (data: Scan | undefined) => {
    if (data === undefined) return

    const { LocationCode, LocationName, Trips } = data
        
    if (Trips.length > 0) {
        console.log(`LocationCode ${ chalk.bold(`[${ LocationCode }]`) } - ${ chalk.bold.blueBright(LocationName) }`)
        let table = new CliTable(['# Train number', 'TRAIN', 'FROM', 'TO', 'DELAY', 'SJ URL'])
        for (const trip of Trips) {
        let { Time: DepartureTime, RealTime: DepartureRealTime } = <any>trip.Stations[0].Departure
        let { Time: ArrivalTime, RealTime: ArrivalRealTime } = <any>trip.Stations[trip.Stations.length - 1].Arrival

        if (DepartureRealTime === '') DepartureRealTime = DepartureTime
        if (ArrivalRealTime === '') ArrivalRealTime = ArrivalTime

        table.addRows(<any>[
            trip.AnnouncedTrainNumber, trip.Operator,
            `${ chalk.gray(DepartureTime) } ${ chalk.underline(DepartureRealTime) } - ${ chalk.bold(`[${ trip.StartLocationCode }]`) } ${ trip.StartLocationName }`,
            `${ chalk.gray(ArrivalTime) } ${ chalk.underline(ArrivalRealTime) } - ${ chalk.bold(`[${ trip.FinalLocationCode }]`) } ${ trip.FinalLocationName }`,
            `${ trip.MinutesDelay }m`,
            trip.url
        ])
        }

        table.render()
        console.log(chalk.bold.bold.underline.greenBright(`Found ${ Trips.length } delayed trains!\n`))
    }
}

export default RenderScanResult