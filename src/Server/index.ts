import express from 'express'
import path from 'path'
import fs from 'fs'
import ScanController from './Controllers/ScanController'
import StationController from './Controllers/StationController'
import DefaultController from './Controllers/DefaultController'
import { $PAYBACK_FILE } from '../FilePaths'
import { getJsonFile } from '../Utils/file'

const CreateServer = (port: number = 3000) => {
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
    
    app.get('/api/payback', (req, res) => {
        if (!fs.existsSync($PAYBACK_FILE)) {
            return res.json({ paybacks: [], totalPayback: 0, count: 0 })
        }
        const paybacks = getJsonFile($PAYBACK_FILE) || []
        const totalPayback = paybacks.reduce((sum: number, p: any) => sum + (p.price || 0), 0)
        res.json({ paybacks, totalPayback, count: paybacks.length })
    })

    // Serve static frontend build if dist folder exists
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

    const server = app.listen(port, () => console.log(`Server running on http://localhost:${ port }`))
    return server
}

export default CreateServer

if (require.main === module) {
    const port = Number(process.env.PORT) || 3000
    CreateServer(port)
}