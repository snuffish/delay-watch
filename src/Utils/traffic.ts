import fetch from 'node-fetch'
import { readFromFile } from './file'
import TrafficInfiObject from '../Views/TrafficInfoObject'
import { getDate, FORMAT } from './date'
import StationsData from '../dataStore/Stations.data'

export enum REQUEST_TYPE { FILE, TRAIN, STATION }

export const getTrafficInfo = async(requestType: REQUEST_TYPE, value: any = undefined): Promise<TrafficInfiObject> => {
    let data: any = undefined
    if (requestType === REQUEST_TYPE.FILE && value !== undefined) {
        data = readFromFile(value)
    } else if (requestType === REQUEST_TYPE.TRAIN && value !== undefined) {
        data = await fetch(`https://services.trafficinfo.sj.se/v4.2/traffic/TrainRoute?callback=sj.apiProxy.jsonpCallbackMiocTrainRoute&AnnouncedTrainNumber=${ value }&FilterCode=DEFAULT`)
        .then(res => res.buffer())
        .then(buffer => Buffer.from(buffer).toString())
    } else if (requestType === REQUEST_TYPE.STATION && value !== undefined) {
        data = await fetch(`https://services.trafficinfo.sj.se/v4.2/traffic/StationConnections?callback=sj.apiProxy.jsonpCallbackMiocStationConnections&LocationCode=${ value }&DateTime=${ getDate(FORMAT.SJ) }&FilterCode=DEFAULT`)
        .then(res => res.buffer())
        .then(buffer => Buffer.from(buffer).toString())
    }

    return convertToJsonResponse(data)
}

export const getStationName = (locationCode: string): string => {
    for (const location of StationsData) {
        if (location.id === locationCode) {
            return location.name
        }
    }

    return ''
}

const convertToJsonResponse = (data: string): any => {
    data = data.replace('sj.apiProxy.jsonpCallbackMiocStationConnections(', '')
    .replace('sj.apiProxy.jsonpCallbackMiocTrainRoute(', '')
    .replace(');', '')

    return JSON.parse(data)
}