import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import StationsData from '../../dataStore/Stations.data'

const getStationUrl = (stationName: string): string => {
  const encodedName = encodeURIComponent(stationName)
  const queryName = encodedName.replace(/%20/g, '+')
  const dateStr = new Date().toISOString().split('T')[0]
  return `https://www.sj.se/trafikinformation/station/${encodedName}?station=${queryName}&date=${dateStr}`
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
}

interface ScanData {
  LocationCode: string
  LocationName: string
  Trips: TripData[]
}

interface StationItem {
  id: string
  name: string
  country?: string
}

const allStations = StationsData as StationItem[]

export function ScannerRoute() {
  const [selectedStations, setSelectedStations] = useState<string[]>(['SK', 'G', 'T', 'N', 'JÖ', 'THN'])
  const [delayMinutes, setDelayMinutes] = useState<number>(20)
  const [newCodeInput, setNewCodeInput] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0)
  
  const containerRef = useRef<HTMLDivElement>(null)

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
    
    if (validStation && !selectedStations.includes(validStation.id.toUpperCase())) {
      setSelectedStations([...selectedStations, validStation.id.toUpperCase()])
      setNewCodeInput('')
      setIsDropdownOpen(false)
      setHighlightedIndex(0)
    }
  }

  const handleSelectSuggestion = (station: StationItem) => {
    addStationByCode(station.id)
  }

  const handleRemoveStation = (code: string) => {
    setSelectedStations(selectedStations.filter(s => s !== code))
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
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Station Scanner Setup
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Select station codes to scan for delayed trains.</p>
          </div>

          <button
            onClick={handleRunScan}
            disabled={scanMutation.isPending || selectedStations.length === 0}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50"
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
          <label className="text-xs font-medium text-slate-400">Selected Stations ({selectedStations.length}):</label>
          <div className="flex flex-wrap gap-2 min-h-[38px] p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            {selectedStations.length === 0 ? (
              <span className="text-xs text-slate-500 p-1">No stations selected. Search and add station codes below.</span>
            ) : (
              selectedStations.map(code => {
                const station = allStations.find(s => s.id.toUpperCase() === code)
                const name = station ? station.name : code
                return (
                  <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200">
                    <span className="font-mono font-bold text-cyan-400">[{code}]</span>
                    <span>{name}</span>
                    <button onClick={() => handleRemoveStation(code)} className="ml-1 text-slate-400 hover:text-rose-400 transition">&times;</button>
                  </span>
                )
              })
            )}
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/60">
          <div className="space-y-2 relative" ref={containerRef}>
            <label className="text-xs font-medium text-slate-300">Add Station (Type name or station code):</label>
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
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />

                {isDropdownOpen && matchingSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl divide-y divide-slate-800">
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Delay Threshold:</span>
              <span className="text-cyan-400 font-bold">{delayMinutes} minutes</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={delayMinutes}
              onChange={e => setDelayMinutes(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Error State */}
      {scanMutation.isError && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm">
          Failed to scan: {scanMutation.error?.message || 'API request failed'}. Ensure Express server is running on port 3000.
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-4">
        {scanMutation.isIdle && (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center space-y-3">
            <div className="text-4xl">🚆</div>
            <h3 className="text-lg font-medium text-slate-300">Ready to Scan</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Click "Start Scan" above to scan live train connections for delays exceeding your threshold.</p>
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
              <div key={scan.LocationCode} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">[{scan.LocationCode}]</span>
                    <a href={getStationUrl(scan.LocationName)} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-slate-100 hover:text-cyan-400 transition flex items-center gap-1.5">
                      {scan.LocationName}
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {scan.Trips.length} Delayed Train(s)
                  </span>
                </div>

                <div className="space-y-3">
                  {scan.Trips.map((trip, idx) => (
                    <div key={idx} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono bg-slate-800 text-slate-200 px-2 py-0.5 rounded">Train #{trip.AnnouncedTrainNumber}</span>
                          <span className="text-xs text-slate-400 font-medium">{trip.Operator || 'SJ'}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-200 flex flex-wrap items-center gap-2">
                          <span>{trip.StartLocationName || trip.StartLocationCode}</span>
                          <span className="text-slate-500">&rarr;</span>
                          <span>{trip.FinalLocationName || trip.FinalLocationCode}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Total Delay</div>
                          <div className="text-lg font-bold text-rose-400 font-mono">+{trip.MinutesDelay} min</div>
                        </div>

                        {trip.url && (
                          <a href={trip.url} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition flex items-center gap-1">
                            Train SJ Info
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  )
}
