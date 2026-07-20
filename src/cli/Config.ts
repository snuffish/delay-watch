import 'dotenv/config'
import { getJsonFile } from '../Utils/file'
import chalk from 'chalk'
import { getStationName } from '../Utils/traffic'
import { $CONFIG_FILE } from '../FilePaths'
import { CliTable } from '../Render'

const configFilePath = process.env.CONFIG_FILE || $CONFIG_FILE
const getConfigData = () => getJsonFile(configFilePath) || {}

export const Config = ({ get }: any) => {
    const config = getConfigData()
    console.log(`${chalk.bold.greenBright('Config file is located at:')} ${chalk.redBright(configFilePath)}`)
    
    if (get) {
        const configValue = config[get]
        if (configValue !== undefined) {
            console.log(typeof configValue === 'object' ? JSON.stringify(configValue, null, 2) : configValue)
        } else {
            console.log("No config value found")
        }
        return
    }

    let table = new CliTable(['Key', 'Value'])

    for (const key of Object.keys(config)) {
        let value = config[key]
        if (key === 'locationCodes' && Array.isArray(config[key])) {
            let str = ''
            for (const locationCode of config[key]) {
                str += `${chalk.bold(`[${locationCode}]`)} ${chalk.bold.blueBright(getStationName(locationCode))}\n`
            }
            value = str.trim()
        } else if (typeof value === 'object') {
            value = JSON.stringify(value)
        }

        table.addRows([`${chalk.bold(key)}`, value])
    }

    table.render()
}

export const getConfigValue = (key: string): any => {
    const config = getConfigData()
    return config[key]
}
