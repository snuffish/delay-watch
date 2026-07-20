import fs from 'fs'
import PaybackInterface from '../Google/PaybackInterface'
import chalk from 'chalk'
import { $GOOGLE_CREDENTIALS, $PAYBACK_FILE } from '../FilePaths'
import { generatePaybackData, authorize } from '../Google'
import { getJsonFile } from '../Utils/file'
import { argumentsCount } from '.'
import { CliTable } from '../Render'

const Payback = ({ sync, syncYear }: any) => {
    const googleCredentials = getJsonFile($GOOGLE_CREDENTIALS)

    if (sync || syncYear !== undefined) {
        authorize(googleCredentials, (authClient: any) => {
            generatePaybackData(authClient, syncYear)
        })
        return
    }

    if (!fs.existsSync($PAYBACK_FILE)) {
        console.log(`${ chalk.bold.yellow('Payback file not found:') } ${ chalk.redBright($PAYBACK_FILE) }`)
        console.log(`${ chalk.cyan('Run with --sync to fetch paybacks from Gmail:') } ${ chalk.bold('delay-watch payback --sync') }\n`)
        authorize(googleCredentials, (authClient: any) => {
            generatePaybackData(authClient, syncYear)
        })
        return
    }

    const paybackList: PaybackInterface[] = getJsonFile($PAYBACK_FILE) || []

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

export default Payback