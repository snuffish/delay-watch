import fetch from 'node-fetch'
import { readFromFile } from './file'
import TrafficInfoObject from '../Views/TrafficInfoObject'
import { getDate, FORMAT } from './date'
import StationsData from '../dataStore/Stations.data'

export enum REQUEST_TYPE { FILE, TRAIN, STATION }

// Cache station lookup table for O(1) performance
const stationMap = new Map<string, string>()
for (const station of StationsData) {
    if (station.id && station.name) {
        stationMap.set(station.id.toUpperCase(), station.name)
    }
}

export const getTrafficInfo = async(requestType: REQUEST_TYPE, value: any = undefined): Promise<TrafficInfoObject> => {
    let data: any = undefined
    if (requestType === REQUEST_TYPE.FILE && value !== undefined) {
        data = readFromFile(value)
    } else if (requestType === REQUEST_TYPE.TRAIN && value !== undefined) {
        const response = await fetch(`https://services.trafficinfo.sj.se/v4.2/traffic/TrainRoute?callback=sj.apiProxy.jsonpCallbackMiocTrainRoute&AnnouncedTrainNumber=${ value }&FilterCode=DEFAULT`)
        const buffer = await response.buffer()
        data = Buffer.from(buffer).toString()
    } else if (requestType === REQUEST_TYPE.STATION && value !== undefined) {
        const response = await fetch(`https://services.trafficinfo.sj.se/v4.2/traffic/StationConnections?callback=sj.apiProxy.jsonpCallbackMiocStationConnections&LocationCode=${ value }&DateTime=${ getDate(FORMAT.SJ) }&FilterCode=DEFAULT`)
        const buffer = await response.buffer()
        data = Buffer.from(buffer).toString()
    }

    return convertToJsonResponse(data)
}

export const getStationName = (locationCode: string): string => {
    if (!locationCode) return ''
    return stationMap.get(locationCode.toUpperCase()) || locationCode
}

const convertToJsonResponse = (data: string): any => {
    if (!data) return {}
    data = data.replace('sj.apiProxy.jsonpCallbackMiocStationConnections(', '')
        .replace('sj.apiProxy.jsonpCallbackMiocTrainRoute(', '')
        .replace(');', '')

    try {
        return JSON.parse(data)
    } catch {
        return {}
    }
}