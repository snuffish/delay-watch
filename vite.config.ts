import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import express from 'express'
import fs from 'fs'
import path from 'path'
import ScanController from './src/Server/Controllers/ScanController'
import StationController from './src/Server/Controllers/StationController'
import DefaultController from './src/Server/Controllers/DefaultController'
import { $PAYBACK_FILE } from './src/FilePaths'
import { getJsonFile } from './src/Utils/file'

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware-plugin',
    configureServer(server) {
      const app = express()
      app.use(express.json())

      app.get('/api', DefaultController)
      app.post('/api/scan', ScanController)
      app.get('/api/stations', StationController)

      app.get('/api/payback', (req, res) => {
        if (!fs.existsSync($PAYBACK_FILE)) {
          return res.json({ paybacks: [], totalPayback: 0, count: 0 })
        }
        const paybacks = getJsonFile($PAYBACK_FILE) || []
        const totalPayback = paybacks.reduce((sum: number, p: any) => sum + (p.price || 0), 0)
        res.json({ paybacks, totalPayback, count: paybacks.length })
      })

      server.middlewares.use(app)
    }
  }
}

export default defineConfig({
  root: '.',
  plugins: [react(), apiMiddlewarePlugin()],
  define: {
    global: 'window',
  },
  server: {
    port: 5173,
  },
})
