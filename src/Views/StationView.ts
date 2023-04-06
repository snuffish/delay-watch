import StationInfoView from "./StationInfoView"

const { JsonView, JsonProperty } = require('typescript-json-object-mapper')

class StationView extends JsonView {
    @JsonProperty
    LocationCode: string | undefined

    @JsonProperty
    LocationName?: string | undefined

    @JsonProperty
    MinutesDelay?: number | undefined

    @JsonProperty
    IsDelayed: Boolean | undefined
    
    @JsonProperty
    IsCancelled: Boolean | undefined
    
    @JsonProperty
    Arrival: StationInfoView[] | undefined
    
    @JsonProperty
    Departure: StationInfoView[] | undefined
}

export default StationView