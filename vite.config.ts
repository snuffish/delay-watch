import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createApp } from './src/Server'

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware-plugin',
    configureServer(server) {
      const app = createApp()
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
