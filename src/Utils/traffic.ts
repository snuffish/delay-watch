import { readFromFile } from './file'
import TrafficInfoObject from '../Views/TrafficInfoObject'
import StationsData from '../dataStore/stations.json'

import { getDate, FORMAT, timeDifference } from './date'

export enum REQUEST_TYPE { FILE, TRAIN, STATION }

const SJ_API_KEY = '39296c1a13304493b44236e1bcb7f544'
const SJ_REST_BASE = 'https://prod-api.adp.sj.se/public/trafficinfo-api/v2/rest'
const SJ_CONNECTIONS_ENDPOINT = `${SJ_REST_BASE}/connections`
const SJ_TRAIN_ROUTES_ENDPOINT = `${SJ_REST_BASE}/train-routes`
const SJ_TRAFFIC_ENDPOINT = `${SJ_REST_BASE}/remarks/announcements`

const SJ_HEADERS = {
    'Ocp-Apim-Subscription-Key': SJ_API_KEY,
    'Accept': 'application/json',
    'x-client-name': 'sjse-start-client'
}

// Extract "HH:MM" from SJ timestamps, which come as either "YYYY-MM-DDTHH:MM:SS"
// (connections) or "YYYY-MM-DD HH:MM" (train-routes).
const extractClock = (dateTime: string | null | undefined): string => {
    if (!dateTime) return ''
    const timePart = dateTime.includes('T') ? dateTime.split('T')[1] : dateTime.split(' ')[1]
    return (timePart || '').slice(0, 5)
}

// Map an SJ train-routes response into the Stations shape the Trip view model expects.
const mapTrainRoute = (json: any, trainNumber: string): any => {
    const rawStations: any[] = Array.isArray(json?.stations) ? json.stations : []

    const Stations = rawStations.map((st: any) => {
        const toInfo = (leg: any) => leg ? {
            Time: extractClock(leg.originalTime),
            RealTime: extractClock(leg.currentTime),
            IsDelayed: !!leg.delayed,
            IsCancelled: !!leg.cancelled
        } : undefined

        const Arrival = toInfo(st.arrival)
        const Departure = toInfo(st.departure)
        const leg = Departure || Arrival
        const MinutesDelay = leg ? timeDifference(leg.Time, leg.RealTime) : 0

        return {
            LocationCode: st.locationCode || '',
            LocationName: st.name || getStationName(st.locationCode || ''),
            IsDelayed: !!st.delayed,
            IsCancelled: !!st.cancelled,
            MinutesDelay,
            Arrival,
            Departure
        }
    })

    const first = rawStations[0]
    const last = rawStations[rawStations.length - 1]

    return {
        AnnouncedTrainNumber: json?.trainNumber || trainNumber,
        trainNumber: json?.trainNumber || trainNumber,
        InformationOwner: json?.informationOwner || '',
        TransportType: json?.vehicle || json?.transportType || '',
        StartDepartureLocationCode: first?.locationCode || '',
        FinalDestinationLocationCode: last?.locationCode || '',
        Stations,
        remarks: []
    }
}

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

    const httpFetch = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch : (await import('node-fetch')).default as any

    if (requestType === REQUEST_TYPE.STATION && value) {
        try {
            const stationName = getStationName(value) || value
            const dateStr = getDate(FORMAT.DATE)
            const url = `${SJ_CONNECTIONS_ENDPOINT}?location=${encodeURIComponent(stationName)}&date=${dateStr}&lang=sv-SE`

            const response = await httpFetch(url, { headers: SJ_HEADERS })

            if (response.ok) {
                const json = await response.json()
                const departures = json?.departureConnections || json?.DepartureConnections || []
                const arrivals = json?.arrivalConnections || json?.ArrivalConnections || []
                const locId = json?.locationId || value || ''
                const locName = json?.locationName || getStationName(value) || value

                return {
                    LocationCode: value || locId,
                    LocationName: locName,
                    locationId: locId,
                    locationName: locName,
                    DepartureConnections: departures,
                    ArrivalConnections: arrivals,
                    departureConnections: departures,
                    arrivalConnections: arrivals,
                    Stations: json?.Stations || [],
                    remarks: json?.remarks || []
                }
            }
        } catch {
            // Proceed to empty result
        }
    }

    if (requestType === REQUEST_TYPE.TRAIN && value) {
        try {
            const dateStr = getDate(FORMAT.DATE)
            const url = `${SJ_TRAIN_ROUTES_ENDPOINT}?transportId=${encodeURIComponent(String(value))}&lang=sv-SE&date=${dateStr}`

            const response = await httpFetch(url, { headers: SJ_HEADERS })

            if (response.ok) {
                const json = await response.json()
                if (Array.isArray(json?.stations) && json.stations.length > 0) {
                    return mapTrainRoute(json, String(value))
                }
            }
        } catch {
            // Proceed to empty result
        }
    }

    try {
        const response = await httpFetch(`${SJ_TRAFFIC_ENDPOINT}?lang=sv`, { headers: SJ_HEADERS })

        if (response.ok) {
            const json = await response.json()
            if (json?.remarks && json.remarks.length > 0) {
                return {
                    LocationCode: value || '',
                    DepartureConnections: json.remarks,
                    ArrivalConnections: json.remarks,
                    Stations: json.remarks,
                    remarks: json.remarks
                }
            }
        }
    } catch {
        // Proceed to empty result
    }

    return { LocationCode: value || '', DepartureConnections: [], ArrivalConnections: [], Stations: [], remarks: [] }
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