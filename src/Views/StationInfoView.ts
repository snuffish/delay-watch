const { JsonView, JsonProperty } = require('typescript-json-object-mapper')

class StationInfoView extends JsonView {
    @JsonProperty
    Date: String | undefined

    @JsonProperty
    Time: String | undefined

    @JsonProperty
    RealDate: String | undefined

    @JsonProperty
    RealTime: String | undefined

    @JsonProperty
    IsDelayed: Boolean | undefined

    @JsonProperty
    IsCancelled: Boolean | undefined
}

export default StationInfoView