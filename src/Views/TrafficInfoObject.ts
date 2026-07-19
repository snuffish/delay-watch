export interface TrafficInfoObject {
    LocationCode: string
    LocationName?: string
    locationId?: string
    locationName?: string
    DepartureConnections: any[]
    ArrivalConnections: any[]
    departureConnections?: any[]
    arrivalConnections?: any[]
    Stations?: any[]
    remarks?: any[]
}

export type TrafficInfiObject = TrafficInfoObject
export default TrafficInfoObject