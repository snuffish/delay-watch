import {FORMAT, getDate} from "./Utils/date";

import stations from './resources/stations.json'

type Train = {
    trainNumber: string
    operation: string
    station: string
    transportType: string
}

type StationInfo = {
    locationId: string,
    locationName: string
    arrivalConnections: [
        Train
    ],
    departureConnections: [
        Train
    ]
}

type Station = {
    name: string
    locationCode: string
    delayed: boolean
}

type TrainStationInfo = Pick<Station, 'delayed'> & {
    currentTime: string
    originalTime: string
}

type TrainInfo = Pick<Train, 'trainNumber' | 'transportType'> & {
    stations: [
        Station & {
            departure?: TrainStationInfo
            arrival?: TrainStationInfo
        }
    ]
}

const headers = {
    'ocp-apim-subscription-key': '39296c1a13304493b44236e1bcb7f544'
}

const getTrainInfo = async (trainNumber: number) => {
    const req = await fetch(
        `https://prod-api.adp.sj.se/public/trafficinfo-api/v2/rest/train-routes?transportId=${trainNumber}&lang=sv-SE&date=2026-01-07`, {
            method: 'GET',
            headers
        }
    )
    
    const data = await req.json() as TrainInfo
    
    return {
        ...data
    }
}

const getStationInfo = async (locationCode: string) => {
    const req = await fetch(
        `https://prod-api.adp.sj.se/public/trafficinfo-api/v2/rest/connections?location=${locationCode}&date=2026-01-07&lang=sv-SE&allDay=true`, {
            method: 'GET',
            headers
        }
    )

    const data = await req.json() as StationInfo;

    return {
        trainNumbers: data.departureConnections.map(item => parseInt(item.trainNumber)),
        ...data
    }
};

;(async () => {
    const info = await getStationInfo('G')
    const trainNumbers = info.trainNumbers
    
    // console.log(trainNumbers)
    
    const trainInfo = await getTrainInfo(3427)
    const delayedStations = trainInfo.stations.filter(station => station.delayed)
    
    const times = delayedStations.map(station => ({
        station: station.name,
        originalTime: station.departure?.originalTime,
        realTime: station.departure?.currentTime
    }))

    
    console.log(times)
})()
