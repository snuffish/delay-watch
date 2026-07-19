import { CliTable } from "../Render"
import StationsData from "../dataStore/stations.json"

export const Stations = () => {
    let table = new CliTable(['LocationCode', 'Station Name', 'Country'])

    for (const station of StationsData) {
        table.addRows([station.id, station.name, station.country || 'SE'])
    }

    table.render()
}