import { Request, Response} from 'express'
import { ScanLocation, Scan } from "../../ScanLocation"

const ScanController = async (req: Request, res: Response) => {
    const { locationCodes, delay = 20 } = req.body

    if (locationCodes !== undefined) {
        let promises: Promise<Scan>[] = []

        for (const locationCode of locationCodes) {
            const scanLocation: Promise<Scan | any> = ScanLocation(locationCode, delay)
            if (scanLocation !== undefined) promises.push(scanLocation)
        }

        const scanResults: Scan[] = await Promise.all(promises)

        for (const scan of scanResults) {
            if (scan.Trips.length !== 0) {
                res.send(scanResults)
                break
            }
        }
    }

    res.sendStatus(204)
}

export default ScanController