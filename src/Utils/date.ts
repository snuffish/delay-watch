import moment from 'moment'

export enum FORMAT {
    SJ = 'YYYY-MM-DD+hh:mm',
    DATE = 'YYYY-MM-DD',
    DATETIME = "YYYY-MM-DD hh:mm:ss"
}

export const getDate = (format: FORMAT) => {
    let date = moment().format(format)
    
    if (format === FORMAT.SJ) date = date.replace(':', '%3A')
    
    return date
}

export const convertDate = (dateString: string, format: FORMAT) => {
    return moment(dateString).format(format)
}

export const timeDifference = (startTime: string, stopTime: string): number => {
    if (startTime === '' || stopTime === '') return 0
    
    const start = moment(`${ getDate(FORMAT.DATE) } ${ startTime }`)
    const stop = moment(`${ getDate(FORMAT.DATE) } ${ stopTime }`)
    const msDiff: any = stop.diff(start).toFixed()
    
    return msDiff / 60000
}