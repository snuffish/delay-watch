export default class StationInfoView {
    Date?: string
    Time?: string
    RealDate?: string
    RealTime?: string
    IsDelayed?: boolean
    IsCancelled?: boolean

    constructor(data: any = {}) {
        this.Date = data.Date || ''
        this.Time = data.Time || ''
        this.RealDate = data.RealDate || ''
        this.RealTime = data.RealTime || ''
        this.IsDelayed = Boolean(data.IsDelayed)
        this.IsCancelled = Boolean(data.IsCancelled)
    }
}