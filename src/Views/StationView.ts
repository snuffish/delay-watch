import StationInfoView from "./StationInfoView"

export default class StationView {
    LocationCode?: string
    LocationName?: string
    MinutesDelay?: number
    IsDelayed?: boolean
    IsCancelled?: boolean
    Arrival?: StationInfoView
    Departure?: StationInfoView

    constructor(data: any = {}) {
        this.LocationCode = data.LocationCode || ''
        this.LocationName = data.LocationName || ''
        this.MinutesDelay = data.MinutesDelay || 0
        this.IsDelayed = Boolean(data.IsDelayed)
        this.IsCancelled = Boolean(data.IsCancelled)
        this.Arrival = data.Arrival ? new StationInfoView(data.Arrival) : undefined
        this.Departure = data.Departure ? new StationInfoView(data.Departure) : undefined
    }
}