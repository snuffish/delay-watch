require('dotenv').config()

// Set a higher limit of allowed listeners
process.setMaxListeners(100)

import commander from 'commander'
const program = new commander.Command()
import { Config } from './Config'
import Payback from './Payback'
import Scan from './Scan'
import Server from './Server'

const collect = (value: any, previous: any) => previous.concat([value])

export const cli = () => {
    program
        .version(program.opts().version)
        .name(`delay-watch`)
        .description(`Version: ${ program.opts().version }`)

    program 
        .command('scan')
        .alias('s')
        .description('Start the scanner')
        .option('-d, --delay [minutes]', 'Trains that have a higher than delay time', 20)
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
        .action(Payback)

    program
        .command('server')
        .description('Start a server')
        .option('-p, --port [port]', 'Specify a port for the server', process.env.PORT)
        .action(Server)

    program.parse(process.argv)

    if (argumentsCount(2) === 0) {
        program.help()
    }
}

export const argumentsCount = (removeArgs: number): number => process.argv.splice(removeArgs).length