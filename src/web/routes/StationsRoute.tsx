import React, { useState, useMemo } from 'react'
import StationsData from '../../dataStore/Stations.data'

interface StationItem {
  id: string
  name: string
  country?: string
}

const allStations = StationsData as StationItem[]

export function StationsRoute() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return allStations.slice(0, 150)
    return allStations.filter(s => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)).slice(0, 150)
  }, [searchQuery])

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Swedish Railway Stations</h2>
          <p className="text-xs text-slate-400">Search station codes and names across Sweden.</p>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search station name or code..."
          className="w-full sm:w-72 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[550px] overflow-y-auto pr-1">
        {filteredStations.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-8 text-sm">No stations match "{searchQuery}".</div>
        ) : (
          filteredStations.map(s => (
            <div key={s.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition">
              <div>
                <div className="text-sm font-semibold text-slate-200">{s.name}</div>
                <div className="text-xs font-mono text-cyan-400 font-bold">{s.id}</div>
              </div>
              <span className="text-xs text-slate-500 font-mono">{s.country || 'SE'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
