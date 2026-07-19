import React from 'react'
import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router'
import { ScannerRoute } from './routes/ScannerRoute'
import { StationsRoute } from './routes/StationsRoute'
import { PaybackRoute } from './routes/PaybackRoute'

const rootRoute = createRootRoute({
  component: () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Navigation */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-black text-2xl tracking-wider">
            DW
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Delay Watch <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">v1.7.9</span>
            </h1>
            <p className="text-sm text-slate-400">Swedish Train Delay Monitor & Payback Manager</p>
          </div>
        </div>

        {/* TanStack Router Links */}
        <nav className="flex space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <Link
            to="/"
            activeProps={{ className: 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold' }}
            inactiveProps={{ className: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          >
            ⚡ Live Scanner
          </Link>
          <Link
            to="/stations"
            activeProps={{ className: 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold' }}
            inactiveProps={{ className: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          >
            🚉 Station Explorer
          </Link>
          <Link
            to="/payback"
            activeProps={{ className: 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold' }}
            inactiveProps={{ className: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          >
            💰 Paybacks
          </Link>
        </nav>
      </header>

      {/* Route Outlet */}
      <main>
        <Outlet />
      </main>
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ScannerRoute,
})

const stationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stations',
  component: StationsRoute,
})

const paybackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payback',
  component: PaybackRoute,
})

const routeTree = rootRoute.addChildren([indexRoute, stationsRoute, paybackRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
