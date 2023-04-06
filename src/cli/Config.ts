require('dotenv').config()
import { getJsonFie } from '../Utils/file'
import chalk from 'chalk'
import { getStationName } from '../Utils/traffic'

import { CliTable } from '../Render'
import { exec, execSync } from 'child_process'
import { execPath } from 'process'
import { argumentsCount } from '.'

const configFilePath = String(execSync(`echo ${process.env.CONFIG_FILE}`))
const config = getJsonFie(configFilePath)

export const Config = ({ set, get }: any, value: string) => {
    console.log(`${chalk.bold.greenBright('Config file is located at:')} ${chalk.redBright(configFilePath)}`)
    if (argumentsCount(3) === 0) {

        let table = new CliTable(['Key', 'Value'])

        for (const key of Object.keys(config)) {
            let value = config[key]
            if (key === 'locationCodes') {
                let str = ''
                for (const locationCode of config[key]) {
                    str += `${chalk.bold(`[${locationCode}]`)} ${chalk.bold.blueBright(getStationName(locationCode))}\n`
                }
                value = str
            }

            table.addRows([`${chalk.bold(key)}`, value])
        }

        table.render()
    }

    if (get) {
        const configValue = config[get]
        if (configValue !== undefined) {
            console.log(configValue)
        } else {
            console.log("No config value found")
        }
    } else if (set) {
        console.log("SET DATA")
    }
}

export const getConfigValue = (key: string): string | undefined => {
    for (const configKey of Object.keys(config)) {
        if (key === configKey) {
            const value = config[key]
            return value
        }
    }

    return undefined
}
