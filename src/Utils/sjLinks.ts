// Builders for public sj.se traffic-info links. Browser-safe: keep this module
// free of Node-only imports so the web bundle can use it too.
const todayIso = (): string => new Date().toISOString().slice(0, 10)

export const getStationUrl = (stationName: string, date: string = todayIso()): string => {
    const encodedName = encodeURIComponent(stationName)
    const queryName = encodedName.replace(/%20/g, '+')
    return `https://www.sj.se/trafikinformation/station/${encodedName}?station=${queryName}&date=${date}`
}

export const getTrainUrl = (trainNumber: string, date: string = todayIso()): string => {
    return `https://www.sj.se/trafikinformation/tag/${trainNumber}?date=${date}`
}
