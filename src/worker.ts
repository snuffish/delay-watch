import 'dotenv/config'
import cron from 'node-cron'
import { ScanLocation } from './ScanLocation'
import { getConfigValue } from './cli/Config'
import { sendDailyReport } from './Utils/mail'

const checkAndSendMail = async () => {
    const sendTo: string | undefined = getConfigValue('email')
    if (!sendTo) {
        console.log(`No 'email' set in the config file — skipping daily report.`)
        return
    }

    const locationCodes: string[] = getConfigValue('locationCodes') || []
    if (locationCodes.length === 0) {
        console.log(`No 'locationCodes' set in the config file — skipping daily report.`)
        return
    }

    const scanResults = await Promise.all(locationCodes.map(code => ScanLocation(code)))

    if (await sendDailyReport(sendTo, scanResults)) {
        console.log(`Daily report sent to ${sendTo}`)
    } else {
        console.log(`Daily report to ${sendTo} was NOT sent`)
    }
}

const runJob = () => {
    checkAndSendMail().catch(error => console.error('Scheduled scan failed:', error))
}

console.log('Delay Watch worker started')

// Schedules are in the server's local time zone.
cron.schedule('30 10 * * *', runJob) // 10:30 every day
cron.schedule('30 16 * * *', runJob) // 16:30 every day
cron.schedule('0 21 * * *', runJob)  // 21:00 every day
