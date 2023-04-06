import { ScanLocation, Scan } from '../src/ScanLocation'
import cliProgress from 'cli-progress'
import { getConfigValue } from '../src/cli/Config'
import chalk from 'chalk'
import RenderScanResult from './Render/RenderScanResult'

async function _Scan({ delay, location }: any) {
    console.clear()

    let locationCodes = location
    if (locationCodes.length === 0) locationCodes = ['Sk']

    const multiBar = new cliProgress.MultiBar({
        format: `{StatusText} [${chalk.underline.bold.greenBright(`{percentage}%`)}] - ${chalk.bold.cyan('{bar}')} | ${chalk.bold(`[{LocationCode}]`)} - ${chalk.bold.blueBright(`{LocationName}`)} || {value}/{total} Trains || ${chalk.greenBright('Time {duration}s')} | ${chalk.gray('ETA {eta}s')}`,
        barCompleteChar: '\u2588', barIncompleteChar: '\u2591',
        hideCursor: true, clearOnComplete: true
    })

    let found = false
    let promises: Promise<Scan>[] = []

    if (locationCodes !== undefined) {
        for (const locationCode of locationCodes) {
            const scanLocation: Promise<Scan | any> = ScanLocation(locationCode, delay, multiBar)
            if (scanLocation !== undefined) promises.push(scanLocation)
        }
    }

    if (promises.length > 0) {
        const scanResult: Scan[] = await Promise.all(promises)
        multiBar.stop()

        for (const scan of scanResult) {
            if (scan.Trips.length !== 0) found = true

            RenderScanResult(scan)
        }
    }

    if (!found) console.log(chalk.bold.bold.redBright(`No delayed trains found!`))
}

export default _Scan

_Scan({
    delay: 20,
    // location: ['SK', 'T', 'G', 'N']
    location: ['JÖ', 'N', 'SK', 'T', 'THN', 'G', 'SMD', 'BS', 'VB', 'V', 'ÅL', 'HPBG', 'ÖR', 'ÖB', 'UV', 'UÖ', 'VG', 'MDN', 'MDÖ', 'KB']
})
