#!/usr/bin/env node

import fs from 'fs'
import { $DELAY_WATCH_DIR, $CONFIG_FILE } from '../src/FilePaths'

const setupEnvironment = () => {
    if (!fs.existsSync($DELAY_WATCH_DIR)) {
        fs.mkdirSync($DELAY_WATCH_DIR)
        console.log(`Created directory: '${ $DELAY_WATCH_DIR }'`)
    }

    if (!fs.existsSync($CONFIG_FILE)) {
        const configJson = { ticketNumber: "", email: "",  phoneNumber: "",  locationCodes: [] }
        fs.writeFileSync($CONFIG_FILE, JSON.stringify(configJson))
        console.log(`Created config file: '${ $CONFIG_FILE }'`)
    }
}

setupEnvironment()

require = require('esm')(module /*, options */)
require('../src/cli').cli(process.argv)