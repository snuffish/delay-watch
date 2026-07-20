import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import StationsData from '../../dataStore/stations.json'
import { StationItem } from '../../dataStore/types'
import { getStationUrl } from '../../Utils/sjLinks'
import { useSelectedStations } from '../hooks/useSelectedStations'

const calcMinutesDiff = (t1?: string, t2?: string): number | null => {
  if (!t1 || !t2) return null
  const [h1, m1] = t1.split(':').map(Number)
  const [h2, m2] = t2.split(':').map(Number)
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null
  let min1 = h1 * 60 + m1
  let min2 = h2 * 60 + m2
  if (min2 < min1) min2 += 24 * 60
  return min2 - min1
}

interface TripData {
  AnnouncedTrainNumber: string
  Operator: string
  StartLocationCode: string
  StartLocationName: string
  FinalLocationCode: string
  FinalLocationName: string
  url: string
  MinutesDelay: number
  OriginalTime?: string
  EstimatedTime?: string
  Track?: string
  TransportType?: string
  Remarks?: { id?: string; level?: number; information?: string }[]
  XodRemarks?: { header?: string; content?: string }[]
  IsCancelled?: boolean
  DepartureDate?: string
  Stations?: any[]
}

interface ScanData {
  LocationCode: string
  LocationName: string
  Trips: TripData[]
}

const allStations = StationsData as StationItem[]

export function ScannerRoute() {
  const { selectedStations, isSelected, addStation, removeStation, clearStations } = useSelectedStations()
  const [delayMinutes, setDelayMinutes] = useState<number>(20)
  const [newCodeInput, setNewCodeInput] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0)
  const [expandedTrips, setExpandedTrips] = useState<Record<string, boolean>>({})

  const containerRef = useRef<HTMLDivElement>(null)

  const toggleExpandTrip = (key: string) => {
    setExpandedTrips(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const matchingSuggestions = useMemo(() => {
    const query = newCodeInput.trim().toLowerCase()
    if (!query) return []
    return allStations.filter(
      s => s.id.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
    ).slice(0, 8)
  }, [newCodeInput])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const scanMutation = useMutation<ScanData[], Error, { locationCodes: string[]; delay: number }>({
    mutationFn: async ({ locationCodes, delay }) => {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationCodes, delay })
      })
      if (!res.ok) throw new Error(`Server returned status ${res.status}`)
      return res.json()
    }
  })

  const addStationByCode = (codeToAdd: string) => {
    const normalized = codeToAdd.trim().toUpperCase()
    const validStation = allStations.find(s => s.id.toUpperCase() === normalized)

    if (validStation && !isSelected(validStation.id)) {
      addStation(validStation.id)
      setNewCodeInput('')
      setIsDropdownOpen(false)
      setHighlightedIndex(0)
    }
  }

  const handleSelectSuggestion = (station: StationItem) => {
    addStationByCode(station.id)
  }

  const handleRemoveStation = (code: string) => {
    removeStation(code)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (matchingSuggestions.length > 0) {
        setIsDropdownOpen(true)
        setHighlightedIndex(prev => (prev + 1) % matchingSuggestions.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (matchingSuggestions.length > 0) {
        setIsDropdownOpen(true)
        setHighlightedIndex(prev => (prev - 1 + matchingSuggestions.length) % matchingSuggestions.length)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (isDropdownOpen && matchingSuggestions.length > 0 && matchingSuggestions[highlightedIndex]) {
        handleSelectSuggestion(matchingSuggestions[highlightedIndex])
      } else if (newCodeInput.trim()) {
        addStationByCode(newCodeInput)
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false)
    }
  }

  const handleRunScan = () => {
    if (selectedStations.length === 0) return
    scanMutation.mutate({ locationCodes: selectedStations, delay: delayMinutes })
  }

  const results = scanMutation.data || []
  const totalDelayedTrips = results.reduce((acc, r) => acc + (r.Trips ? r.Trips.length : 0), 0)

  return (
    <div className="space-y-6">
      {/* Scan Setup Controls */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-2xl shadow-xl space-y-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/70 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span> Station Scanner Setup
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Select station codes to scan for delayed train connections.</p>
          </div>

          <button
            onClick={handleRunScan}
            disabled={scanMutation.isPending || selectedStations.length === 0}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
          >
            {scanMutation.isPending ? (
              <>
                <svg className="animate-spin w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Start Scan
              </>
            )}
          </button>
        </div>

        {/* Selected Badges */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Selected Stations ({selectedStations.length}):</span>
            {selectedStations.length > 0 && (
              <button onClick={() => clearStations()} className="text-slate-500 hover:text-slate-300 transition">Clear all</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            {selectedStations.length === 0 ? (
              <span className="text-xs text-slate-500 p-1">No stations selected. Search and add station codes below.</span>
            ) : (
              selectedStations.map(code => {
                const station = allStations.find(s => s.id.toUpperCase() === code)
                const name = station ? station.name : code
                return (
                  <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 shadow-sm">
                    <span className="font-mono font-bold text-cyan-400">[{code}]</span>
                    <span>{name}</span>
                    <button onClick={() => handleRemoveStation(code)} aria-label={`Remove ${name} from selection`} className="ml-1 text-slate-400 hover:text-rose-400 transition font-bold">&times;</button>
                  </span>
                )
              })
            )}
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Add Station Input */}
          <div className="space-y-2 relative" ref={containerRef}>
            <label className="text-xs font-semibold text-slate-300">Add Station (Type name or station code):</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newCodeInput}
                  onChange={e => {
                    setNewCodeInput(e.target.value)
                    setIsDropdownOpen(true)
                    setHighlightedIndex(0)
                  }}
                  onFocus={() => newCodeInput.trim() && setIsDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Skövde or SK..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-cyan-500 shadow-inner"
                />

                {isDropdownOpen && matchingSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl divide-y divide-slate-800">
                    {matchingSuggestions.map((station, index) => (
                      <div
                        key={station.id}
                        onClick={() => handleSelectSuggestion(station)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`px-4 py-2.5 flex items-center justify-between cursor-pointer text-xs transition ${
                          index === highlightedIndex ? 'bg-cyan-500/20 text-cyan-200 font-medium' : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="font-semibold text-slate-100">{station.name}</span>
                        <span className="font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">[{station.id}]</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => addStationByCode(newCodeInput)}
                disabled={!newCodeInput.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition disabled:opacity-50 border border-slate-700/60"
              >
                Add
              </button>
            </div>
          </div>

          {/* Delay Threshold Control */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Delay Threshold:</span>
              <span className="text-cyan-400 font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">{delayMinutes} minutes</span>
            </div>
            
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={delayMinutes}
              onChange={e => setDelayMinutes(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer border border-slate-800"
            />

            <div className="flex gap-1.5 pt-0.5">
              {[5, 15, 30, 45, 60].map(m => (
                <button
                  key={m}
                  onClick={() => setDelayMinutes(m)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold font-mono transition ${
                    delayMinutes === m ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {scanMutation.isError && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>Failed to scan: {scanMutation.error?.message || 'API request failed'}.</span>
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-5">
        {scanMutation.isIdle && (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-10 text-center space-y-3">
            <div className="text-3xl">🚆</div>
            <h3 className="text-base font-semibold text-slate-300">Ready to Scan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Click "Start Scan" above to scan live train connections for delays exceeding your threshold.</p>
          </div>
        )}

        {scanMutation.isSuccess && totalDelayedTrips === 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
            <div className="text-3xl text-emerald-400">✨</div>
            <h3 className="text-base font-semibold text-slate-200">No Delayed Trains Found</h3>
            <p className="text-xs text-slate-400">All scanned stations are currently operating on schedule or within your {delayMinutes}-minute delay threshold.</p>
          </div>
        )}

        {scanMutation.isSuccess && totalDelayedTrips > 0 && (
          results.map(scan => (
            scan.Trips && scan.Trips.length > 0 && (
              <div key={scan.LocationCode} className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">[{scan.LocationCode}]</span>
                    <a href={getStationUrl(scan.LocationName)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-100 hover:text-cyan-400 transition flex items-center gap-1.5">
                      {scan.LocationName}
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                    {scan.Trips.length} Delayed Train(s)
                  </span>
                </div>

                <div className="space-y-3">
                  {scan.Trips.map((trip, idx) => {
                    const tripKey = `${scan.LocationCode}-${trip.AnnouncedTrainNumber}-${idx}`
                    const isExpanded = !!expandedTrips[tripKey]

                    return (
                      <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm transition hover:border-slate-700/80">
                        {/* Summary Header */}
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold font-mono bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700/50">Train #{trip.AnnouncedTrainNumber}</span>
                              <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800">{trip.Operator || 'SJ'}</span>
                              {trip.Track && (
                                <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">Spår {trip.Track}</span>
                              )}
                              {trip.IsCancelled && (
                                <span className="text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded">Inställt / Cancelled</span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-slate-200 flex flex-wrap items-center gap-2">
                              <span>{trip.StartLocationName || trip.StartLocationCode}</span>
                              <span className="text-cyan-400 font-bold">&rarr;</span>
                              <span>{trip.FinalLocationName || trip.FinalLocationCode}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total Delay</div>
                              <div className="text-base font-black text-rose-400 font-mono tracking-tight">+{trip.MinutesDelay} min</div>
                            </div>

                            <button
                              onClick={() => toggleExpandTrip(tripKey)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                                isExpanded
                                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                              }`}
                            >
                              <span>{isExpanded ? 'Hide Details' : 'Details'}</span>
                              <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>

                            {trip.url && (
                              <a href={trip.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1">
                                Train SJ Info
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Detailed Expandable Panel */}
                        {isExpanded && (
                          <div className="border-t border-slate-800/80 bg-slate-900/60 p-4 space-y-4 text-xs divide-y divide-slate-800/60">
                            {/* Grid Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Scheduled Time</span>
                                <div className="text-slate-200 font-mono font-bold mt-0.5">{trip.OriginalTime || 'Scheduled'}</div>
                              </div>
                              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Estimated Time</span>
                                <div className="text-rose-400 font-mono font-bold mt-0.5">{trip.EstimatedTime || `+${trip.MinutesDelay}m`}</div>
                              </div>
                              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Track / Platform</span>
                                <div className="text-cyan-400 font-mono font-bold mt-0.5">{trip.Track ? `Spår ${trip.Track}` : 'Standard'}</div>
                              </div>
                              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Transport Type</span>
                                <div className="text-slate-300 font-semibold mt-0.5">{trip.TransportType || trip.Operator || 'Train'}</div>
                              </div>
                            </div>

                            {/* Disruption Remarks */}
                            {trip.Remarks && trip.Remarks.length > 0 && (
                              <div className="pt-3 space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Traffic & Disruption Remarks:</span>
                                <div className="flex flex-wrap gap-2">
                                  {trip.Remarks.map((rem, rIdx) => (
                                    <span key={rIdx} className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 ${
                                      rem.level === 0 ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-200 border-slate-700'
                                    }`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                      {rem.information || rem.id}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* XOD Bus / Service Notices */}
                            {trip.XodRemarks && trip.XodRemarks.length > 0 && (
                              <div className="pt-3 space-y-2">
                                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Replacement Bus & Service Announcements:</span>
                                {trip.XodRemarks.map((xod, xIdx) => (
                                  <div key={xIdx} className="bg-slate-950 p-3 rounded-lg border border-amber-500/30 space-y-1 text-slate-300">
                                    {xod.header && <h4 className="font-bold text-amber-300 text-xs">{xod.header}</h4>}
                                    {xod.content && <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">{xod.content}</p>}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Route Stop Stations Stepper Timeline */}
                            {trip.Stations && trip.Stations.length > 0 && (
                              <div className="pt-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Train Route Stations & Stops:</span>
                                  <span className="text-[10px] font-mono text-slate-500">{trip.Stations.length} station stops</span>
                                </div>

                                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                                  {trip.Stations.map((st: any, sIdx: number) => {
                                    const prevStop = sIdx > 0 ? trip.Stations![sIdx - 1] : null
                                    
                                    // Calculate inter-station leg duration & delay delta
                                    let legSchedMin: number | null = null
                                    let legRealMin: number | null = null
                                    let legDelayDelta: number | null = null

                                    if (prevStop) {
                                      const prevDepSched = prevStop.Departure?.Time || prevStop.Arrival?.Time
                                      const prevDepReal = prevStop.Departure?.RealTime || prevStop.Arrival?.RealTime || prevDepSched
                                      const currArrSched = st.Arrival?.Time || st.Departure?.Time
                                      const currArrReal = st.Arrival?.RealTime || st.Departure?.RealTime || currArrSched

                                      legSchedMin = calcMinutesDiff(prevDepSched, currArrSched)
                                      legRealMin = calcMinutesDiff(prevDepReal, currArrReal)

                                      if (legRealMin !== null && legSchedMin !== null) {
                                        legDelayDelta = legRealMin - legSchedMin
                                      }
                                    }

                                    const arrSched = st.Arrival?.Time
                                    const arrReal = st.Arrival?.RealTime || arrSched
                                    const depSched = st.Departure?.Time
                                    const depReal = st.Departure?.RealTime || depSched

                                    const stopDelay = st.MinutesDelay || 0
                                    const isCancelled = !!st.IsCancelled
                                    const stationCode = (st.LocationCode || '').toUpperCase()

                                    return (
                                      <div key={sIdx} className="relative space-y-2">
                                        {/* Inter-Station Leg Travel Badge */}
                                        {prevStop && (
                                          <div className="-mt-1 mb-2 pl-3 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                                            <span className="text-slate-600">&ndash;&gt;</span>
                                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                                              Leg travel: <strong className="text-slate-200">{legRealMin ?? legSchedMin ?? '--'}m</strong>
                                              {legSchedMin !== null && legRealMin !== legSchedMin && (
                                                <span className="text-slate-500 ml-1">(Sched: {legSchedMin}m)</span>
                                              )}
                                            </span>

                                            {legDelayDelta !== null && legDelayDelta !== 0 && (
                                              <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${
                                                legDelayDelta > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                              }`}>
                                                {legDelayDelta > 0 ? `+${legDelayDelta}m delay gained on leg` : `${legDelayDelta}m recovered on leg`}
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        {/* Station Node Badge & Header with StationCode */}
                                        <div className="flex items-center gap-3">
                                          <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold font-mono z-10 ${
                                            isCancelled
                                              ? 'bg-rose-950 text-rose-400 border-rose-800'
                                              : stopDelay > 0
                                                ? 'bg-rose-950 text-rose-300 border-rose-600'
                                                : 'bg-slate-900 text-slate-300 border-slate-700'
                                          }`}>
                                            {sIdx + 1}
                                          </span>

                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-100">{st.LocationName || stationCode}</span>
                                            {stationCode && (
                                              <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                                                [{stationCode}]
                                              </span>
                                            )}

                                            {isCancelled ? (
                                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Inställt</span>
                                            ) : stopDelay > 0 ? (
                                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                                                +{stopDelay}m delay
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                On time
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Arrival & Departure Comparison Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                                          {/* Arrival Column */}
                                          <div className="flex items-center justify-between px-1">
                                            <span className="text-slate-500 font-medium">Arrival:</span>
                                            {arrSched ? (
                                              arrReal !== arrSched ? (
                                                <div className="font-mono flex items-center gap-1.5">
                                                  <span className="text-slate-400 line-through">{arrSched}</span>
                                                  <span className="text-cyan-400 font-bold">&rarr;</span>
                                                  <span className="text-rose-400 font-bold">{arrReal}</span>
                                                </div>
                                              ) : (
                                                <span className="font-mono text-slate-200">{arrSched}</span>
                                              )
                                            ) : (
                                              <span className="text-slate-600 font-mono">Origin Station</span>
                                            )}
                                          </div>

                                          {/* Departure Column */}
                                          <div className="flex items-center justify-between px-1">
                                            <span className="text-slate-500 font-medium">Departure:</span>
                                            {depSched ? (
                                              depReal !== depSched ? (
                                                <div className="font-mono flex items-center gap-1.5">
                                                  <span className="text-slate-400 line-through">{depSched}</span>
                                                  <span className="text-cyan-400 font-bold">&rarr;</span>
                                                  <span className="text-rose-400 font-bold">{depReal}</span>
                                                </div>
                                              ) : (
                                                <span className="font-mono text-slate-200">{depSched}</span>
                                              )
                                            ) : (
                                              <span className="text-slate-600 font-mono">Final Station</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  )
}
