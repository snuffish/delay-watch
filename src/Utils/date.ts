import moment from 'moment'

export enum FORMAT {
    SJ = 'YYYY-MM-DD+hh:mm',
    DATE = 'YYYY-MM-DD',
    DATETIME = "YYYY-MM-DD HH:mm:ss"
}

export const getDate = (format: FORMAT): string => {
    let date = moment().format(format)
    
    if (format === FORMAT.SJ) date = date.replace(':', '%3A')
    
    return date
}

export const convertDate = (dateString: string, format: FORMAT): string => {
    return moment(dateString).format(format)
}

export const timeDifference = (startTime: string, stopTime: string): number => {
    if (!startTime || !stopTime) return 0
    
    const today = getDate(FORMAT.DATE)
    const start = moment(`${ today } ${ startTime }`, `${ FORMAT.DATE } HH:mm`, true)
    const stop = moment(`${ today } ${ stopTime }`, `${ FORMAT.DATE } HH:mm`, true)
    
    if (!start.isValid() || !stop.isValid()) return 0

    let diffMinutes = stop.diff(start, 'minutes')
    // Handle overnight trips (e.g. 23:55 to 00:15)
    if (diffMinutes < 0) {
        diffMinutes += 24 * 60
    }

    return diffMinutes
}