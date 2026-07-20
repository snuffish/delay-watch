import chalk from 'chalk'
import { getConfigValue } from './Config'
import { runScan } from '../index'

const Scan = async ({ delay, location }: any) => {
    console.clear()

    let locationCodes: string[] = location
    if (!locationCodes || locationCodes.length === 0) {
        locationCodes = getConfigValue('locationCodes') || []
    }

    if (locationCodes.length === 0) {
        console.log(chalk.bold.yellowBright(`No stations to scan — pass --location or set 'locationCodes' in the config.`))
        return
    }

    await runScan({ delay: Number(delay), location: locationCodes })
}

export default Scan
