import 'dotenv/config'
import express from 'express'
import path from 'path'
import fs from 'fs'
import ScanController from './Controllers/ScanController'
import StationController from './Controllers/StationController'
import DefaultController from './Controllers/DefaultController'
import { $PAYBACK_FILE } from '../FilePaths'
import { getJsonFile } from '../Utils/file'

interface CreateAppOptions {
    // Serve the built frontend from dist/. Disable when mounted inside the Vite
    // dev server, otherwise the static build shadows Vite's source pipeline/HMR.
    serveStatic?: boolean
}

export const createApp = ({ serveStatic = true }: CreateAppOptions = {}): express.Express => {
    const app: express.Express = express()
    
    app.use(express.json())
    
    // Enable CORS for development with Vite
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200)
        }
        next()
    })

    // API Routes
    app.get('/api', DefaultController)
    app.post('/api/scan', ScanController)
    app.post('/scan', ScanController) // legacy endpoint support
    app.get('/api/stations', StationController)
    app.get('/stations', StationController) // legacy endpoint support
    
    app.get('/api/payback', (_req, res) => {
        // getJsonFile returns null for a missing or malformed file; anything that
        // isn't an array is treated as "no paybacks" rather than a 500.
        const fileData = getJsonFile($PAYBACK_FILE)
        const paybacks = Array.isArray(fileData) ? fileData : []
        const totalPayback = paybacks.reduce((sum: number, p: any) => sum + (p.price || 0), 0)
        res.json({ paybacks, totalPayback, count: paybacks.length })
    })

    // Frontend serving is for production/standalone only. When mounted inside the
    // Vite dev server (serveStatic: false) we register no '/' or catch-all handler,
    // so requests fall through to Vite's source pipeline + HMR.
    if (serveStatic) {
        const distPath = path.resolve(__dirname, '../../dist')
        if (fs.existsSync(distPath)) {
            app.use(express.static(distPath))
            app.get('*', (req, res, next) => {
                if (req.path.startsWith('/api')) return next()
                res.sendFile(path.join(distPath, 'index.html'))
            })
        } else {
            app.get('/', DefaultController)
        }
    }

    return app
}

const CreateServer = (port: number = 3000) => {
    const app = createApp()
    const server = app.listen(port, () => console.log(`Server running on http://localhost:${ port }`))
    return server
}

export default CreateServer

if (require.main === module) {
    const port = Number(process.env.PORT) || 3000
    CreateServer(port)
}