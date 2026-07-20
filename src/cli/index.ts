import 'dotenv/config'

// Set a higher limit of allowed listeners
process.setMaxListeners(100)

import commander from 'commander'
const program = new commander.Command()
import { Config } from './Config'
import Payback from './Payback'
import Scan from './Scan'
import Server from './Server'
import { Stations } from './Stations'

const collect = (value: any, previous: any) => previous.concat([value])

export const cli = () => {
    program
        .version('1.7.9')
        .name(`delay-watch`)
        .description(`Scan and manage train delays & paybacks`)

    program 
        .command('scan')
        .alias('s')
        .description('Start the scanner')
        .option('-d, --delay [minutes]', 'Trains with delay higher than limit', 20)
        .option('-l, --location <code>', 'Scan from a specific locationCode', collect, [])
        .action(Scan)

    program
        .command('config')
        .alias('cfg')
        .description('Configuration for the application')
        .option('--get <key>', 'Get config value')
        .action(Config)

    program
        .command('payback')
        .description('The paybacks from the train company')
        .option('--sync', 'Sync the paybacks from the mail inbox')
        .option('--sync-year <year>', 'Only sync paybacks received since this year')
        .action(Payback)

    program
        .command('stations')
        .alias('st')
        .description('List available stations')
        .action(Stations)

    program
        .command('server')
        .description('Start a server')
        .option('-p, --port [port]', 'Specify a port for the server', process.env.PORT || '3000')
        .action(Server)

    program.parse(process.argv)

    if (argumentsCount(2) === 0) {
        program.help()
    }
}

export const argumentsCount = (removeArgs: number): number => Math.max(0, process.argv.length - removeArgs)