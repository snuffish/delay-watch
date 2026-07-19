import { test, expect } from '@playwright/test'
import { getTrafficInfo, REQUEST_TYPE } from '../../src/Utils/traffic'

const SJ_API_KEY = '39296c1a13304493b44236e1bcb7f544'
const SJ_TRAFFIC_ENDPOINT = 'https://prod-api.adp.sj.se/public/trafficinfo-api/v2/rest/remarks/announcements'

test.describe('Live SJ.se Traffic API Integration Tests', () => {

  test('should query active SJ Traffic Info API (prod-api.adp.sj.se) and return HTTP 200 with valid remarks payload', async ({ request }) => {
    const response = await request.get(`${SJ_TRAFFIC_ENDPOINT}?lang=sv`, {
      headers: {
        'Ocp-Apim-Subscription-Key': SJ_API_KEY,
        'Accept': 'application/json',
        'x-client-name': 'sjse-start-client'
      }
    })

    expect(response.status()).toBe(200)

    const json = await response.json()
    expect(json).toBeDefined()
    expect(json).toHaveProperty('remarks')
    expect(Array.isArray(json.remarks)).toBe(true)
  })

  test('should execute getTrafficInfo against active SJ API endpoint', async () => {
    const data = await getTrafficInfo(REQUEST_TYPE.STATION, 'Sk')
    expect(data).toBeDefined()
    expect(data.LocationCode).toBe('Sk')
    expect(data).toHaveProperty('DepartureConnections')
    expect(data).toHaveProperty('ArrivalConnections')
  })
})
