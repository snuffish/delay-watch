import moment from 'moment'

export enum FORMAT {
    SJ = 'YYYY-MM-DD+HH:mm',
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
    // With only HH:mm to go on, a negative diff is ambiguous: an overnight span
    // (23:55 → 00:15) lands near -1440, while a train running early lands near 0.
    // Wrap only the former; clamp early running to 0 instead of a ~24h "delay".
    if (diffMinutes < -720) {
        diffMinutes += 24 * 60
    } else if (diffMinutes < 0) {
        diffMinutes = 0
    }

    return diffMinutes
}