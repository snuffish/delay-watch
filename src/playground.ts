import { Trip } from "./ScanLocation";
import { getTrafficInfo, REQUEST_TYPE } from "./Utils/traffic"

    ; (async () => {
        const data = await getTrafficInfo(REQUEST_TYPE.TRAIN, 81039)
        const trip = new Trip(data)
        console.log(trip)
    })()