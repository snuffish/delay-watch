import { ScanLocation, Scan } from './ScanLocation'
import cliProgress from 'cli-progress'
import chalk from 'chalk'
import RenderScanResult from './Render/RenderScanResult'

export async function runScan({ delay = 20, location = ['Sk'] }: { delay?: number, location?: string[] }) {
    let locationCodes = location
    if (!locationCodes || locationCodes.length === 0) locationCodes = ['Sk']

    const multiBar = new cliProgress.MultiBar({
        format: `{StatusText} [${chalk.underline.bold.greenBright(`{percentage}%`)}] - ${chalk.bold.cyan('{bar}')} | ${chalk.bold(`[{LocationCode}]`)} - ${chalk.bold.blueBright(`{LocationName}`)} || {value}/{total} Trains || ${chalk.greenBright('Time {duration}s')} | ${chalk.gray('ETA {eta}s')}`,
        barCompleteChar: '\u2588', barIncompleteChar: '\u2591',
        hideCursor: true, clearOnComplete: true
    })

    let found = false
    let promises: Promise<Scan | undefined>[] = []

    for (const locationCode of locationCodes) {
        const scanPromise = ScanLocation(locationCode, delay, multiBar)
        if (scanPromise) promises.push(scanPromise)
    }

    if (promises.length > 0) {
        const scanResults = await Promise.all(promises)
        multiBar.stop()

        for (const scan of scanResults) {
            if (scan && scan.Trips.length !== 0) {
                found = true
                RenderScanResult(scan)
            }
        }
    }

    if (!found) {
        console.log(chalk.bold.redBright(`No delayed trains found!`))
    }
}

export { ScanLocation }
export default runScan
