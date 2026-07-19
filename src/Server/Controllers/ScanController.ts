import { Request, Response } from 'express'
import { ScanLocation, Scan } from "../../ScanLocation"

const ScanController = async (req: Request, res: Response) => {
    const { locationCodes = ['Sk'], delay = 20 } = req.body || {}

    if (!Array.isArray(locationCodes) || locationCodes.length === 0) {
        return res.status(400).json({ error: 'locationCodes must be a non-empty array' })
    }

    try {
        const promises: Promise<Scan | undefined>[] = locationCodes.map(code => ScanLocation(code, Number(delay)))
        const scanResults = await Promise.all(promises)
        const validResults = scanResults.filter((s): s is Scan => s !== undefined)

        return res.json(validResults)
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Scan failed' })
    }
}

export default ScanController