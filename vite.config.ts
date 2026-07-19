import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createApp } from './src/Server'

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware-plugin',
    configureServer(server) {
      // Dev only: mount API routes but never the static dist build, so Vite's
      // source pipeline + HMR (and the devtools) aren't shadowed.
      const app = createApp({ serveStatic: false })
      server.middlewares.use(app)
    }
  }
}

export default defineConfig({
  root: '.',
  plugins: [react(), apiMiddlewarePlugin()],
  define: {
    global: 'window',
  },
  server: {
    port: 5173,
  },
})
