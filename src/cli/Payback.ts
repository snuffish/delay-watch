import fs from 'fs'
import PaybackInterface from '../Google/PaybackInterface'
import chalk from 'chalk'
import { $GOOGLE_CREDENTIALS, $PAYBACK_FILE } from '../FilePaths'
import { generatePaybackData, authorize } from '../Google'
import { getJsonFie } from '../Utils/file'
import { argumentsCount } from '.'
import { CliTable } from '../Render'

const Payback = ({ sync, syncYear }: any) => {
    const googleCredentials = getJsonFie($GOOGLE_CREDENTIALS)

    if (argumentsCount(3) === 0) {
        if (!fs.existsSync($PAYBACK_FILE)) {
            console.log(`${ chalk.bold.greenBright('Payback file not found:') } ${ chalk.redBright($PAYBACK_FILE) }`)
            generatePaybackData(authorize(googleCredentials, generatePaybackData))
            return
        }

        const paybackList: PaybackInterface[] = getJsonFie($PAYBACK_FILE)

        let totalPayback: number = 0
        
        let table: CliTable = new CliTable(['Datetime', 'Case number', 'Code', 'Payback'])
        for (const payback of paybackList) {
            let { datetime, caseNumber, code, price } = payback
            if (price !== undefined) {
                totalPayback += price
            } else {
                price = 0
            }
            
            table.addRows([datetime, caseNumber, code, `${ price }kr`])
        }

        table.render()

        console.log(`${ chalk.cyanBright('Number of paybacks:') } ${ chalk.bold.cyanBright(paybackList.length) } | ${ chalk.greenBright('Total payback:') } ${ chalk.bold.greenBright(totalPayback + 'kr') }`)
    }

    if (sync) {
        generatePaybackData(authorize(googleCredentials, generatePaybackData))
    } else if (syncYear !== undefined) {
        generatePaybackData(authorize(googleCredentials, generatePaybackData), syncYear)
    }
}

export default Payback