require('dotenv').config()

var cron = require('node-cron');

import { Scan, ScanLocation } from "./ScanLocation";
import fs from 'fs'
import { getConfigValue } from "./cli/Config";
import { sendDailyReport } from './Utils/mail'

const checkAndSendMail = async () => {
    const sendTo = 'snuffish90@gmail.com'

    //let locationCodes = getConfigValue('locationCodes')
    let locationCodes = ["JÖ", "N", "SK", "T", "THN", "G", "SMD", "BS", "VB", "V", "ÅL", "HPBG", "ÖR", "ÖB", "UV", "UÖ", "VG", "MDN", "MDÖ", "KB"]

    let promises = []
    if (locationCodes !== undefined) {
        for (const locationCode of locationCodes) {
            promises.push(ScanLocation(locationCode))
        }

        const scanResults = await Promise.all(promises)

        if (sendDailyReport(sendTo, scanResults)) {
            console.log(`Mail just sent to ${sendTo}`)
        }
    }
}

(async () => {
    console.log("WORKER STARTED!!!!!!")

    // Klckan: 11:30 varje dag
    cron.schedule('30 10 * * *', () => {
        checkAndSendMail()
    });

    // Klockan 17:30 varje dag
    cron.schedule('30 16 * * *', () => {
        checkAndSendMail()
    });

    // Klockan 22:00 varje dag
    cron.schedule('0 21 * * *', () => {
        checkAndSendMail()
    });

    /**/
})()