import { describe, it, expect } from 'vitest'
import { getTrafficInfo, REQUEST_TYPE } from '../../src/Utils/traffic'
import { ScanLocation } from '../../src/ScanLocation'

describe('Live SJ.se Traffic API Integration Tests', () => {
    
    it('should fetch live station connections from real SJ API for Skövde (Sk)', async () => {
        const trafficInfo = await getTrafficInfo(REQUEST_TYPE.STATION, 'Sk')

        expect(trafficInfo).toBeDefined()
        expect(trafficInfo.LocationCode).toBe('Sk')
        expect(Array.isArray(trafficInfo.DepartureConnections)).toBe(true)
        expect(trafficInfo.DepartureConnections.length).toBeGreaterThan(0)
        
        const firstTrain = trafficInfo.DepartureConnections[0]
        expect(firstTrain).toHaveProperty('AnnouncedTrainNumber')
    }, 15000)

    it('should fetch live train route from real SJ API for an active train', async () => {
        const stationInfo = await getTrafficInfo(REQUEST_TYPE.STATION, 'Sk')
        expect(stationInfo.DepartureConnections.length).toBeGreaterThan(0)

        const trainNumber = stationInfo.DepartureConnections[0].AnnouncedTrainNumber
        expect(trainNumber).toBeDefined()

        const trainRoute = await getTrafficInfo(REQUEST_TYPE.TRAIN, trainNumber)
        expect(trainRoute).toBeDefined()
        expect(Array.isArray(trainRoute.Stations)).toBe(true)
        expect(trainRoute.Stations.length).toBeGreaterThan(0)
    }, 15000)

    it('should run ScanLocation against real live SJ API for station Skövde (Sk)', async () => {
        const scanResult = await ScanLocation('Sk', 0) // delay threshold 0 mins to catch any scheduled trip

        expect(scanResult).toBeDefined()
        expect(scanResult?.LocationCode).toBe('SK')
        expect(scanResult?.LocationName).toBe('Skövde C')
        expect(Array.isArray(scanResult?.Trips)).toBe(true)
    }, 20000)
})
