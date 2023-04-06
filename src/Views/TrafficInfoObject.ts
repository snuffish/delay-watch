interface TrafficInfiObject {
    /**
     * Departure station
     * @returns {LocationCode} LocationCode
     */
    LocationCode: string

    /**
     * Departure connections
     * @returns {Train[]} Train[]
     */
    DepartureConnections: any[]

    /**
     * Arrival connections
     * @returns {Train[]} Train[]
     */
    ArrivalConnections: any[]

    /**
     * Stations between Start and End location
     * @returns {Station[]} Station[]
     */
    Stations: any[]
}

export default TrafficInfiObject