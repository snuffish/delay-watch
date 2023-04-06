interface IStation {
    id: string
    country: 'SE'
    isForPresentation: Readonly<boolean>
    lon: string
    lat: string
}

export type Stations = Array<IStation>