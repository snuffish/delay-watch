import { test, expect } from '@playwright/test'
import { Trip, ScanLocation, getStationUrl, getTrainUrl } from '../../src/ScanLocation'
import * as trafficUtils from '../../src/Utils/traffic'
import { mockStationTrafficPayload, mockTrainTrafficPayload } from '../mocks'

test.describe('Scanner Hit & Delay Detection Unit Tests', () => {

  test('should create a Trip object and calculate station delay minutes correctly', () => {
    const trip = new Trip(mockTrainTrafficPayload)

    expect(trip.AnnouncedTrainNumber).toBe('421')
    expect(trip.Operator).toBe('SJ')
    expect(trip.StartLocationCode).toBe('G')
    expect(trip.StartLocationName).toBe('Göteborg C')
    expect(trip.FinalLocationCode).toBe('Cst')
    expect(trip.FinalLocationName).toBe('Stockholm Central')
    expect(trip.Stations.length).toBe(3)
    expect(trip.Stations[1].MinutesDelay).toBe(25)
  })

  test('should generate modern SJ train and station URLs', () => {
    const trainUrl = getTrainUrl('10183', '2026-07-19')
    expect(trainUrl).toBe('https://www.sj.se/trafikinformation/tag/10183?date=2026-07-19')

    const stationUrl = getStationUrl('Skövde C', '2026-07-19')
    expect(stationUrl).toBe('https://www.sj.se/trafikinformation/station/Sk%C3%B6vde%20C?station=Sk%C3%B6vde+C&date=2026-07-19')
  })

  test('should capture scan hits when train delays exceed threshold (delay >= 20 mins)', async () => {
    const originalGetTrafficInfo = trafficUtils.getTrafficInfo
    try {
      (trafficUtils as any).getTrafficInfo = async (type: any, val: any) => {
        if (type === trafficUtils.REQUEST_TYPE.STATION) return mockStationTrafficPayload as any
        if (type === trafficUtils.REQUEST_TYPE.TRAIN) return mockTrainTrafficPayload as any
        return {} as any
      }

      const scanResult = await ScanLocation('SK', 20)

      expect(scanResult).toBeDefined()
      expect(scanResult?.LocationCode).toBe('SK')
      expect(scanResult?.LocationName).toBe('Skövde C')
      expect(scanResult?.Trips.length).toBe(1)

      const hit = scanResult?.Trips[0]
      expect(hit?.AnnouncedTrainNumber).toBe('421')
      expect(hit?.MinutesDelay).toBe(25)
      expect(hit?.url).toContain('https://www.sj.se/trafikinformation/tag/421?date=')
    } finally {
      (trafficUtils as any).getTrafficInfo = originalGetTrafficInfo
    }
  })

  test('should filter out delayed trains when delay is below threshold', async () => {
    const originalGetTrafficInfo = trafficUtils.getTrafficInfo
    try {
      (trafficUtils as any).getTrafficInfo = async (type: any, val: any) => {
        if (type === trafficUtils.REQUEST_TYPE.STATION) return mockStationTrafficPayload as any
        if (type === trafficUtils.REQUEST_TYPE.TRAIN) return mockTrainTrafficPayload as any
        return {} as any
      }

      const scanResult = await ScanLocation('SK', 30)

      expect(scanResult).toBeDefined()
      expect(scanResult?.Trips.length).toBe(0)
    } finally {
      (trafficUtils as any).getTrafficInfo = originalGetTrafficInfo
    }
  })

  test('should process nextconnections/location SJ API payload structure correctly', async () => {
    const nextConnectionsPayload = {
      locationId: 'SK',
      locationName: 'Skövde C',
      arrivalConnections: [
        {
          trainNumber: '430',
          operator: 'SJ',
          currentDateTime: '2026-07-19T12:07:00',
          originalDateTime: '2026-07-19T11:28:00',
          departureDate: '2026-07-19',
          station: 'Göteborg C',
          transportType: 'SJ Snabbtåg',
          delayed: true
        }
      ],
      departureConnections: []
    }

    const originalGetTrafficInfo = trafficUtils.getTrafficInfo
    try {
      (trafficUtils as any).getTrafficInfo = async (type: any, val: any) => {
        if (type === trafficUtils.REQUEST_TYPE.STATION) return nextConnectionsPayload as any
        return {} as any
      }

      const scanResult = await ScanLocation('SK', 20)

      expect(scanResult).toBeDefined()
      expect(scanResult?.LocationCode).toBe('SK')
      expect(scanResult?.LocationName).toBe('Skövde C')
      expect(scanResult?.Trips.length).toBe(1)

      const trip = scanResult?.Trips[0]
      expect(trip?.AnnouncedTrainNumber).toBe('430')
      expect(trip?.MinutesDelay).toBe(39)
      expect(trip?.Operator).toBe('SJ')
    } finally {
      (trafficUtils as any).getTrafficInfo = originalGetTrafficInfo
    }
  })
})
