import chalk from 'chalk'
import cliProgress from 'cli-progress'
import { getStationName } from './traffic'
import { getConfigValue } from '../cli/Config'

export const createLocationProgressBar = (locationCode: string, max: number) => {
    const progressBar = new cliProgress.SingleBar({
        format: `LocationCode ${ chalk.bold(`[${ locationCode }]`) } - ${ getStationName(locationCode)  } | ${ chalk.cyan('{bar}') } | {percentage}% || {value}/{total} Trains || ${ chalk.greenBright('Time {duration}s') } | ${ chalk.gray('ETA {eta}s') }`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    })

    progressBar.start(max, 0)

    return progressBar
}

export const createPaybackSyncProgressBar = (max: number) => {
    const progressBar = new cliProgress.SingleBar({
        format: `Syncing email ${ chalk.bold(`[${ getConfigValue('email') }]`) } - ${ chalk.cyan('{bar}') } | {percentage}% || {value}/{total} Mails || ${ chalk.greenBright('Time {duration}s') } | ${ chalk.gray('ETA {eta}s') }`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    })

    progressBar.start(max, 0)

    return progressBar
}

export const createBar = (max: number) => {
    const progressBar = new cliProgress.SingleBar({
        format: `LocationCode {LocactionCode} | ${ chalk.cyan('{bar}') } | {percentage}% || {value}/{total} Trains || ${ chalk.greenBright('Time {duration}s') } | ${ chalk.gray('ETA {eta}s') }`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    })

    return progressBar
}