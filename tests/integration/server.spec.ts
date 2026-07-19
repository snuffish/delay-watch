import { test, expect } from '@playwright/test'
import { startTestServer, stopTestServer, TEST_SERVER_URL } from '../helpers'

test.describe.configure({ mode: 'serial' })

test.describe('Express Server API Integration Tests', () => {

  test.beforeAll(() => {
    startTestServer()
  })

  test.afterAll(() => {
    stopTestServer()
  })

  test('GET /api/stations should return list of station locations', async ({ request }) => {
    const res = await request.get(`${TEST_SERVER_URL}/api/stations`)
    expect(res.status()).toBe(200)

    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(100)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
  })

  test('GET /api/payback should return payback summary structure', async ({ request }) => {
    const res = await request.get(`${TEST_SERVER_URL}/api/payback`)
    expect(res.status()).toBe(200)

    const data = await res.json()
    expect(data).toHaveProperty('totalPayback')
    expect(data).toHaveProperty('count')
    expect(data).toHaveProperty('paybacks')
    expect(Array.isArray(data.paybacks)).toBe(true)
  })

  test('POST /api/scan with empty locationCodes should return 400 Bad Request', async ({ request }) => {
    const res = await request.post(`${TEST_SERVER_URL}/api/scan`, {
      data: { locationCodes: [], delay: 20 }
    })

    expect(res.status()).toBe(400)
    const data = await res.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('locationCodes')
  })
})
