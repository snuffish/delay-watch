import { test, expect } from '@playwright/test'
import { getTrafficInfo, REQUEST_TYPE } from '../../src/Utils/traffic'

const SJ_API_KEY = '39296c1a13304493b44236e1bcb7f544'
const SJ_REST_BASE = 'https://prod-api.adp.sj.se/public/trafficinfo-api/v2/rest'
const SJ_HEADERS = {
  'Ocp-Apim-Subscription-Key': SJ_API_KEY,
  'Accept': 'application/json',
  'x-client-name': 'sjse-start-client'
}

test.describe('Live SJ.se Traffic API Integration Tests', () => {

  test('should query the announcements endpoint and return HTTP 200 with a remarks payload', async ({ request }) => {
    const response = await request.get(`${SJ_REST_BASE}/remarks/announcements?lang=sv`, { headers: SJ_HEADERS })

    expect(response.status()).toBe(200)

    const json = await response.json()
    expect(json).toHaveProperty('remarks')
    expect(Array.isArray(json.remarks)).toBe(true)
  })

  test('should query the connections endpoint and return a station departure/arrival board', async ({ request }) => {
    const date = new Date().toISOString().slice(0, 10)
    const response = await request.get(
      `${SJ_REST_BASE}/connections?location=${encodeURIComponent('Skövde C')}&date=${date}&lang=sv-SE`,
      { headers: SJ_HEADERS }
    )

    expect(response.status()).toBe(200)

    const json = await response.json()
    expect(json.locationId).toBe('SK')
    expect(Array.isArray(json.departureConnections)).toBe(true)
    expect(Array.isArray(json.arrivalConnections)).toBe(true)
  })

  test('should execute getTrafficInfo(STATION) against the live connections endpoint', async () => {
    const data = await getTrafficInfo(REQUEST_TYPE.STATION, 'Sk')
    expect(data).toBeDefined()
    expect(data.LocationCode).toBe('Sk')
    expect(data).toHaveProperty('DepartureConnections')
    expect(data).toHaveProperty('ArrivalConnections')
  })

  test('should execute getTrafficInfo(TRAIN) and return a mapped route with Stations', async () => {
    // Derive a real, currently-running train number from the station board so the
    // test is not tied to a specific day's timetable.
    const station = await getTrafficInfo(REQUEST_TYPE.STATION, 'Sk')
    const connections = [...(station.DepartureConnections || []), ...(station.ArrivalConnections || [])]
    const trainNumber = connections.map((c: any) => c.trainNumber || c.AnnouncedTrainNumber).find(Boolean)

    test.skip(!trainNumber, 'No live connections at this station right now')

    const train = await getTrafficInfo(REQUEST_TYPE.TRAIN, trainNumber)
    expect(Array.isArray(train.Stations)).toBe(true)
    expect(train.Stations.length).toBeGreaterThan(0)
    expect(train.AnnouncedTrainNumber).toBe(String(trainNumber))
    // First/last stops give real origin/destination codes
    expect(train.StartDepartureLocationCode).toBeTruthy()
    expect(train.FinalDestinationLocationCode).toBeTruthy()
  })
})
