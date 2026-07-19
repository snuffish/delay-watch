import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import CreateServer from '../../src/Server'
import http from 'http'

describe('Express Server API Integration', () => {
    let server: http.Server
    const port = 3099

    beforeAll(() => {
        server = CreateServer(port)
    })

    afterAll((done) => {
        if (server) {
            server.close()
        }
    })

    it('GET /api/stations should return list of station locations', async () => {
        const res = await fetch(`http://localhost:${port}/api/stations`)
        expect(res.status).toBe(200)

        const data = await res.json()
        expect(Array.isArray(data)).toBe(true)
        expect(data.length).toBeGreaterThan(0)
        expect(data[0]).toHaveProperty('id')
        expect(data[0]).toHaveProperty('name')
    })

    it('GET /api/payback should return payback summary structure', async () => {
        const res = await fetch(`http://localhost:${port}/api/payback`)
        expect(res.status).toBe(200)

        const data = await res.json()
        expect(data).toHaveProperty('paybacks')
        expect(data).toHaveProperty('totalPayback')
        expect(data).toHaveProperty('count')
    })

    it('POST /api/scan with empty locationCodes should return 400 Bad Request', async () => {
        const res = await fetch(`http://localhost:${port}/api/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locationCodes: [] })
        })
        expect(res.status).toBe(400)
    })
})
