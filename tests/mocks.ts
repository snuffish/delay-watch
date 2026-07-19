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
      LocationCode: 'G',
      LocationName: 'Göteborg C',
      IsDelayed: false,
      IsCancelled: false,
      MinutesDelay: 0,
      Arrival: { Time: '09:00', RealTime: '09:00' },
      Departure: { Time: '09:05', RealTime: '09:05' }
    },
    {
      LocationCode: 'SK',
      LocationName: 'Skövde C',
      IsDelayed: true,
      IsCancelled: false,
      MinutesDelay: 25,
      Arrival: { Time: '10:00', RealTime: '10:25' },
      Departure: { Time: '10:05', RealTime: '10:30' }
    },
    {
      LocationCode: 'CST',
      LocationName: 'Stockholm Central',
      IsDelayed: true,
      IsCancelled: false,
      MinutesDelay: 25,
      Arrival: { Time: '12:00', RealTime: '12:25' },
      Departure: { Time: '12:05', RealTime: '12:25' }
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
        url: 'https://www.sj.se/trafikinformation/tag/421?date=2026-07-19',
        Stations: mockTrainTrafficPayload.Stations
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
