import React from 'react'
import { useQuery } from '@tanstack/react-query'

interface PaybackItem {
  datetime?: string
  caseNumber?: string
  code?: string
  price?: number
}

interface PaybackResponse {
  paybacks: PaybackItem[]
  totalPayback: number
  count: number
}

export function PaybackRoute() {
  const { data, isLoading, error } = useQuery<PaybackResponse>({
    queryKey: ['paybacks'],
    queryFn: async () => {
      const res = await fetch('/api/payback')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    }
  })

  const totalPayback = data?.totalPayback || 0
  const count = data?.count || 0
  const paybacks = data?.paybacks || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-1">
          <p className="text-xs text-slate-400 font-medium">Total Payback Received</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{isLoading ? '...' : `${totalPayback} kr`}</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-1">
          <p className="text-xs text-slate-400 font-medium">Total Claims Syncing</p>
          <p className="text-2xl font-bold text-cyan-400 font-mono">{isLoading ? '...' : count}</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-1">
          <p className="text-xs text-slate-400 font-medium">Status</p>
          <p className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Active
          </p>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">Payback Claim Records</h2>

        {isLoading && (
          <div className="text-center text-slate-400 py-8 text-sm flex justify-center items-center gap-2">
            <svg className="animate-spin w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            Loading payback records...
          </div>
        )}

        {error && (
          <div className="text-rose-400 py-4 text-sm">Failed to load payback data. Make sure Express server is running on port 3000.</div>
        )}

        {!isLoading && !error && paybacks.length === 0 && (
          <div className="text-center text-slate-500 py-8 text-sm">
            No payback claims synced yet. Run <code className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">npx delay-watch payback --sync</code> to sync from Gmail.
          </div>
        )}

        {!isLoading && !error && paybacks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Case Number</th>
                  <th className="p-3">Värdekod</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paybacks.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-xs">{p.datetime || '-'}</td>
                    <td className="p-3 font-mono text-xs text-cyan-400">{p.caseNumber || '-'}</td>
                    <td className="p-3 font-mono text-xs">{p.code || '-'}</td>
                    <td className="p-3 text-right font-bold text-emerald-400 font-mono">{p.price ? `${p.price} kr` : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
