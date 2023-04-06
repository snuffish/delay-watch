import express from 'express'
const bodyParser = require('body-parser')
import ScanController from './Controllers/ScanController'
import StationController from './Controllers/StationController'
import DefaultController from './Controllers/DefaultController'

const CreateServer = (port: number) => {
    const app: express.Express = express()
    app.use(bodyParser.json())

    app.get('/', DefaultController)
    app.post('/scan', ScanController)
    app.get('/stations', StationController)
    
    app.listen(port, () => console.log(`Server started on port ${ port }!`))
}

export default CreateServer