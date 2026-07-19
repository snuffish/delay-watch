import React, { Suspense } from 'react'
import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router'
import { ScannerRoute } from './routes/ScannerRoute'
import { StationsRoute } from './routes/StationsRoute'
import { PaybackRoute } from './routes/PaybackRoute'

// Router DevTools — lazy-loaded in development only, so it's excluded from production builds.
const TanStackRouterDevtools = process.env.NODE_ENV === 'production'
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((m) => ({ default: m.TanStackRouterDevtools }))
    )

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        {/* Top Header Navigation */}
        <header className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          {/* Ambient Glow Effects */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-black text-lg tracking-wider shrink-0">
              DW
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Delay Watch <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">v1.7.9</span>
              </h1>
              <p className="text-xs text-slate-400">Swedish Train Delay Monitor & Payback Manager</p>
            </div>
          </div>

          {/* TanStack Router Links */}
          <nav className="flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 relative z-10">
            <Link
              to="/"
              activeProps={{ className: 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20' }}
              inactiveProps={{ className: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            >
              ⚡ Live Scanner
            </Link>
            <Link
              to="/stations"
              activeProps={{ className: 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20' }}
              inactiveProps={{ className: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            >
              🚉 Station Explorer
            </Link>
            <Link
              to="/payback"
              activeProps={{ className: 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20' }}
              inactiveProps={{ className: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            >
              💰 Paybacks
            </Link>
          </nav>
        </header>

        {/* Main Content Container */}
        <main className="w-full">
          <Outlet />
        </main>
      </div>

      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
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
