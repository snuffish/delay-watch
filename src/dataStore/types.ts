// Shape of the entries in stations.json — the canonical station type for
// both the web UI and the Node-side code.
export interface StationItem {
    id: string
    name: string
    country?: string
    isForPresentation?: boolean
    lon?: string
    lat?: string
}

export type Stations = StationItem[]
