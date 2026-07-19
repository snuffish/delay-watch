import StationsData from '../dataStore/stations.json'

interface StationItem {
  id: string
  name: string
  country?: string
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
  Stations: Array<{
    LocationCode: string
    LocationName?: string
    IsDelayed?: boolean
    IsCancelled?: boolean
    Arrival?: any
    Departure?: any
    MinutesDelay?: number
  }>
}

interface ScanData {
  LocationCode: string
  LocationName: string
  Trips: TripData[]
}

// Default selected stations
let selectedStations: string[] = ['SK', 'G', 'T', 'N', 'JÖ', 'THN']
let delayMinutes: number = 20
let allStations: StationItem[] = StationsData as StationItem[]

document.addEventListener('DOMContentLoaded', () => {
  setupTabs()
  setupScannerControls()
  setupStationsExplorer()
  fetchPaybacks()
  renderSelectedStationBadges()
})

// Navigation Tab Logic
function setupTabs() {
  const tabs = [
    { btnId: 'tab-scanner', secId: 'section-scanner' },
    { btnId: 'tab-stations', secId: 'section-stations' },
    { btnId: 'tab-paybacks', secId: 'section-paybacks' }
  ]

  tabs.forEach(tab => {
    const btn = document.getElementById(tab.btnId)
    btn?.addEventListener('click', () => {
      tabs.forEach(t => {
        const b = document.getElementById(t.btnId)
        const s = document.getElementById(t.secId)
        if (t.btnId === tab.btnId) {
          b?.classList.add('bg-cyan-500', 'text-slate-950', 'shadow-md', 'shadow-cyan-500/20')
          b?.classList.remove('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/50')
          s?.classList.remove('hidden')
        } else {
          b?.classList.remove('bg-cyan-500', 'text-slate-950', 'shadow-md', 'shadow-cyan-500/20')
          b?.classList.add('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/50')
          s?.classList.add('hidden')
        }
      })
    })
  })
}

// Scanner Controls
function setupScannerControls() {
  const slider = document.getElementById('slider-delay') as HTMLInputElement
  const label = document.getElementById('delay-val-label')
  const addBtn = document.getElementById('btn-add-station')
  const inputCode = document.getElementById('input-station-code') as HTMLInputElement
  const runBtn = document.getElementById('btn-run-scan')

  slider?.addEventListener('input', (e) => {
    delayMinutes = Number((e.target as HTMLInputElement).value)
    if (label) label.textContent = `${delayMinutes} minutes`
  })

  addBtn?.addEventListener('click', () => {
    const val = inputCode?.value.trim().toUpperCase()
    if (val && !selectedStations.includes(val)) {
      selectedStations.push(val)
      renderSelectedStationBadges()
      inputCode.value = ''
    }
  })

  inputCode?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addBtn?.click()
    }
  })

  runBtn?.addEventListener('click', executeScan)
}

function renderSelectedStationBadges() {
  const container = document.getElementById('selected-stations-container')
  if (!container) return

  if (selectedStations.length === 0) {
    container.innerHTML = `<span class="text-xs text-slate-500 p-1">No stations selected. Add station codes above.</span>`
    return
  }

  container.innerHTML = selectedStations.map(code => {
    const station = allStations.find(s => s.id.toUpperCase() === code)
    const name = station ? station.name : code
    return `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200">
        <span class="font-mono font-bold text-cyan-400">[${code}]</span>
        <span>${name}</span>
        <button data-code="${code}" class="btn-remove-badge ml-1 text-slate-400 hover:text-rose-400 transition">&times;</button>
      </span>
    `
  }).join('')

  document.querySelectorAll('.btn-remove-badge').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const code = (e.currentTarget as HTMLElement).getAttribute('data-code')
      if (code) {
        selectedStations = selectedStations.filter(s => s !== code)
        renderSelectedStationBadges()
      }
    })
  })
}

// Execute Live Scan
async function executeScan() {
  const statusEl = document.getElementById('scan-status')
  const statusText = document.getElementById('scan-status-text')
  const cardsContainer = document.getElementById('scan-cards-container')
  const runBtn = document.getElementById('btn-run-scan') as HTMLButtonElement

  if (selectedStations.length === 0) {
    alert('Please add at least one station code to scan.')
    return
  }

  if (runBtn) runBtn.disabled = true
  if (statusEl) statusEl.classList.remove('hidden')
  if (statusText) {
    statusText.innerHTML = `
      <svg class="animate-spin w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
      Scanning ${selectedStations.length} station(s) for delays &ge; ${delayMinutes} mins...
    `
  }

  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationCodes: selectedStations,
        delay: delayMinutes
      })
    })

    if (!res.ok) throw new Error(`Server status: ${res.status}`)

    const data: ScanData[] = await res.json()
    renderScanResults(data)

    if (statusEl) statusEl.classList.add('hidden')
  } catch (err: any) {
    console.error('Scan error:', err)
    if (statusText) {
      statusText.innerHTML = `<span class="text-rose-400 font-medium">Scan error: ${err.message || 'API request failed'}. (Make sure Express server is running on port 3000)</span>`
    }
  } finally {
    if (runBtn) runBtn.disabled = false
  }
}

function renderScanResults(results: ScanData[]) {
  const cardsContainer = document.getElementById('scan-cards-container')
  if (!cardsContainer) return

  const delayedTripsCount = results.reduce((acc, r) => acc + (r.Trips ? r.Trips.length : 0), 0)

  if (delayedTripsCount === 0) {
    cardsContainer.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
        <div class="text-3xl text-emerald-400">✨</div>
        <h3 class="text-base font-semibold text-slate-200">No Delayed Trains Found</h3>
        <p class="text-xs text-slate-400">All scanned stations are currently operating on schedule or within your ${delayMinutes}-minute delay threshold.</p>
      </div>
    `
    return
  }

  let html = ''
  results.forEach(scan => {
    if (!scan.Trips || scan.Trips.length === 0) return

    html += `
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-sm text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">[${scan.LocationCode}]</span>
            <h3 class="text-base font-bold text-slate-100">${scan.LocationName}</h3>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ${scan.Trips.length} Delayed Train(s)
          </span>
        </div>

        <div class="space-y-3">
          ${scan.Trips.map(trip => {
            return `
              <div class="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold font-mono bg-slate-800 text-slate-200 px-2 py-0.5 rounded">Train #${trip.AnnouncedTrainNumber}</span>
                    <span class="text-xs text-slate-400 font-medium">${trip.Operator || 'SJ'}</span>
                  </div>
                  <div class="text-sm font-medium text-slate-200 flex flex-wrap items-center gap-2">
                    <span>${trip.StartLocationName || trip.StartLocationCode}</span>
                    <span class="text-slate-500">&rarr;</span>
                    <span>${trip.FinalLocationName || trip.FinalLocationCode}</span>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <div class="text-xs text-slate-400">Total Delay</div>
                    <div class="text-lg font-bold text-rose-400 font-mono">+${trip.MinutesDelay} min</div>
                  </div>

                  ${trip.url ? `
                    <a href="${trip.url}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition flex items-center gap-1">
                      View SJ Details
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  ` : ''}
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    `
  })

  cardsContainer.innerHTML = html
}

// Station Explorer
function setupStationsExplorer() {
  const container = document.getElementById('stations-list-container')
  const searchInput = document.getElementById('input-search-stations') as HTMLInputElement

  function render(query: string = '') {
    if (!container) return
    const q = query.toLowerCase().trim()
    const filtered = allStations.filter(s => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))

    if (filtered.length === 0) {
      container.innerHTML = `<div class="col-span-full text-center text-slate-500 py-8 text-sm">No stations match "${query}".</div>`
      return
    }

    container.innerHTML = filtered.slice(0, 150).map(s => `
      <div class="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition">
        <div>
          <div class="text-sm font-semibold text-slate-200">${s.name}</div>
          <div class="text-xs font-mono text-cyan-400 font-bold">${s.id}</div>
        </div>
        <button data-code="${s.id}" class="btn-quick-add text-xs px-2.5 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-medium rounded-lg transition">
          + Add
        </button>
      </div>
    `).join('')

    document.querySelectorAll('.btn-quick-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = (e.currentTarget as HTMLElement).getAttribute('data-code')
        if (code && !selectedStations.includes(code)) {
          selectedStations.push(code)
          renderSelectedStationBadges()
        }
      })
    })
  }

  render()
  searchInput?.addEventListener('input', (e) => render((e.target as HTMLInputElement).value))
}

// Fetch Payback metrics
async function fetchPaybacks() {
  try {
    const res = await fetch('/api/payback')
    if (!res.ok) return
    const data = await res.json()

    const totalEl = document.getElementById('metric-total-payback')
    const countEl = document.getElementById('metric-total-count')
    const tableContainer = document.getElementById('payback-table-container')

    if (totalEl) totalEl.textContent = `${data.totalPayback || 0} kr`
    if (countEl) countEl.textContent = `${data.count || 0}`

    if (tableContainer && Array.isArray(data.paybacks) && data.paybacks.length > 0) {
      tableContainer.innerHTML = `
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th class="p-3">Date</th>
              <th class="p-3">Case Number</th>
              <th class="p-3">Värdekod</th>
              <th class="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${data.paybacks.map((p: any) => `
              <tr class="hover:bg-slate-800/30">
                <td class="p-3 font-mono text-xs">${p.datetime || '-'}</td>
                <td class="p-3 font-mono text-xs text-cyan-400">${p.caseNumber || '-'}</td>
                <td class="p-3 font-mono text-xs">${p.code || '-'}</td>
                <td class="p-3 text-right font-bold text-emerald-400 font-mono">${p.price ? p.price + ' kr' : 'Pending'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    } else if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="text-center text-slate-500 py-8 text-sm">
          No payback claims synced yet. Run <code>npx delay-watch payback --sync</code> to sync from Gmail.
        </div>
      `
    }
  } catch (err) {
    console.error('Payback error:', err)
  }
}
