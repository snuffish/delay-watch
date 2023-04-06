import { CliTable } from "../Render"

export const Stations = () => {
    let table: any = new CliTable(['LoctionCode', 'Station name'])
    
    // TODO: FIX CORRECT DATA LATER FROM CONFIG
    table.addRows(
        ['xxx', 'xx'],
        ['yyy', 'yy']
    )
    
    table.render()
}