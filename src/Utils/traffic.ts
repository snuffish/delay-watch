import { readFromFile } from './file'
import TrafficInfoObject from '../Views/TrafficInfoObject'
import StationsData from '../dataStore/Stations.data'

export enum REQUEST_TYPE { FILE, TRAIN, STATION }

const SJ_API_KEY = '39296c1a13304493b44236e1bcb7f544'
const SJ_TRAFFIC_ENDPOINT = 'https://prod-api.adp.sj.se/public/trafficinfo-api/v2/rest/remarks/announcements'

// Cache station lookup table for O(1) performance
const stationMap = new Map<string, string>()
for (const station of StationsData) {
    if (station.id && station.name) {
        stationMap.set(station.id.toUpperCase(), station.name)
    }
}

export const getTrafficInfo = async(requestType: REQUEST_TYPE, value: any = undefined): Promise<TrafficInfoObject | any> => {
    let data: any = undefined

    if (requestType === REQUEST_TYPE.FILE && value !== undefined) {
        data = readFromFile(value)
        return convertToJsonResponse(data)
    } 

    try {
        const httpFetch = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch : (await import('node-fetch')).default as any
        const response = await httpFetch(`${SJ_TRAFFIC_ENDPOINT}?lang=sv`, {
            headers: {
                'Ocp-Apim-Subscription-Key': SJ_API_KEY,
                'Accept': 'application/json',
                'x-client-name': 'sjse-start-client'
            }
        })

        if (!response.ok) {
            return { LocationCode: value || '', DepartureConnections: [], ArrivalConnections: [], Stations: [], remarks: [] }
        }

        const json = await response.json()
        
        return {
            LocationCode: value || '',
            DepartureConnections: json?.remarks || [],
            ArrivalConnections: json?.remarks || [],
            Stations: json?.remarks || [],
            remarks: json?.remarks || []
        }
    } catch {
        return { LocationCode: value || '', DepartureConnections: [], ArrivalConnections: [], Stations: [], remarks: [] }
    }
}

export const getStationName = (locationCode: string): string => {
    if (!locationCode) return ''
    return stationMap.get(locationCode.toUpperCase()) || locationCode
}

const convertToJsonResponse = (data: string): any => {
    if (!data) return {}
    try {
        return JSON.parse(data)
    } catch {
        return {}
    }
}