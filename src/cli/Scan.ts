import { ScanLocation, Scan } from "../ScanLocation"
import cliPRogress from 'cli-progress'
import { getConfigValue } from "./Config"
import chalk from "chalk"
import RenderScanResult from '../Render/RenderScanResult';

const Scan = async ({ delay, location }: any) => {
    console.clear()

    let locationCodes = location
    if (locationCodes.length === 0) locationCodes = getConfigValue('locationCodes')

    const multiBar = new cliPRogress.MultiBar({
        format: `{StatusText} [${ chalk.underline.bold.greenBright(`{percentage}%`) }] - ${ chalk.bold.cyan('{bar}') } | ${ chalk.bold(`[{LocationCode}]`) } - ${ chalk.bold.blueBright(`{LocationName}`) } || {value}/{total} Trains || ${ chalk.greenBright('Time {duration}s') } | ${ chalk.gray('ETA {eta}s') }`,
        barCompleteChar: '\u2588', barIncompleteChar: '\u2591',
        hideCursor: true, clearOnComplete: true
    })

    let found = false
    let promises: Promise<Scan>[] = []
    
    if (locationCodes !== undefined) {
        for (const locationCode of locationCodes) {
          const scanLocation: Promise<Scan | any> = ScanLocation(locationCode, delay, multiBar)
          if (scanLocation !== undefined) {promises.push(scanLocation)
        }
    }

    if (promises.length > 0) {
      const scanResult: Scan[] = await Promise.all(promises)
      multiBar.stop()
      
      for (const scan of scanResult) {
        if (scan.Trips.length !== 0) {
          found = true
        }

        RenderScanResult(scan)
      }
    }

    if (!found) console.log(chalk.bold.bold.redBright(`No delayed trains found!`))
  }
}

export default Scan