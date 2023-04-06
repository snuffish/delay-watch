import { Request, Response } from 'express'
import StationsData from '../../dataStore/Stations.data'

const locationsData = StationsData.map(({ id, name, country }: any) => {
    return { id, name, country }
})

const StationController = async (req: Request, res: Response) => {
    res.send(locationsData)
}

export default StationController