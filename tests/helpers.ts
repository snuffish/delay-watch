/**
 * Shared Test Utility & Helper Functions for Delay Watch Test Suites
 */
import CreateServer from '../src/Server'
import { Server } from 'http'
import { Page } from '@playwright/test'

export const TEST_SERVER_PORT = 3099
export const TEST_SERVER_URL = `http://localhost:${TEST_SERVER_PORT}`

let activeServer: Server | null = null

export const startTestServer = (port: number = TEST_SERVER_PORT): Server | null => {
  if (!activeServer) {
    const server = CreateServer(port)
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[helpers] Server port ${port} already bound, using active instance.`)
      } else {
        // A silent bind failure makes every downstream request fail confusingly —
        // surface the real cause instead.
        console.error(`[helpers] Test server failed to start on port ${port}:`, err)
        throw err
      }
    })
    activeServer = server
  }
  return activeServer
}

export const stopTestServer = (): void => {
  if (activeServer) {
    try {
      activeServer.close()
    } catch {}
    activeServer = null
  }
}

export const mockRouteJson = async (page: Page, urlPattern: string | RegExp, responseData: any, status: number = 200): Promise<void> => {
  await page.route(urlPattern, async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    })
  })
}
