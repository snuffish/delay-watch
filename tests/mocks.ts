/**
 * Centralized Mock Data Payloads for Delay Watch Test Suites
 */

export const mockStationTrafficPayload = {
  LocationCode: 'SK',
  DepartureConnections: [{ AnnouncedTrainNumber: '421' }],
  ArrivalConnections: [],
  Stations: []
}

export const mockTrainTrafficPayload = {
  AnnouncedTrainNumber: '421',
  StartDepartureLocationCode: 'G',
  FinalDestinationLocationCode: 'Cst',
  InformationOwner: 'SJ',
  Stations: [
    {
      LocationCode: 'SK',
      IsDelayed: true,
      IsCancelled: false,
      Arrival: { Time: '10:00', RealTime: '10:25' },
      Departure: { Time: '10:05', RealTime: '10:30' }
    }
  ]
}

export const mockScanResultPayload = [
  {
    LocationCode: 'SK',
    LocationName: 'Skövde C',
    Trips: [
      {
        AnnouncedTrainNumber: '421',
        Operator: 'SJ',
        StartLocationCode: 'G',
        StartLocationName: 'Göteborg C',
        FinalLocationCode: 'Cst',
        FinalLocationName: 'Stockholm Central',
        MinutesDelay: 25,
        url: 'https://www.sj.se/trafikinformation/tag/421?date=2026-07-19'
      }
    ]
  }
]

export const mockPaybackResponse = {
  paybacks: [
    { datetime: '2026-07-19 14:00:00', caseNumber: 'V-10023', code: 'VAL100', price: 250 }
  ],
  totalPayback: 250,
  count: 1
}
