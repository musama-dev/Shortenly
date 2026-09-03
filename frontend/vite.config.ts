import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

/**
 * Dev-server backend so short links work exactly like production even in
 * `npm run dev`: GET /api/links, POST /api/links and clean /<alias> redirects,
 * all backed by the same data/links.json the node server uses.
 */
function shortenlyBackend(): Plugin {
  const resolveLinks = async () => import('../backend/server/store.mjs')
  return {
    name: 'shortenly-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
        const pathname = url.pathname
        const isApi = pathname.startsWith('/api/')
        const isShortLink = !isApi && pathname !== '/' && !pathname.includes('.')
        if (!isApi && !isShortLink) return next()

        try {
          const { readLinks, writeLinks, makeAlias } = await resolveLinks()

          if (pathname === '/api/links' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(await readLinks()))
            return
          }
          if (pathname === '/api/links' && req.method === 'POST') {
            let body = ''
            for await (const chunk of req) body += chunk
            let parsed: any
            try { parsed = JSON.parse(body) } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
              return
            }
            const link = {
              id: parsed.id || `link-${Date.now()}`,
              alias: parsed.alias || makeAlias(),
              title: parsed.title || String(parsed.destination || '').replace(/^https?:\/\//, '').split('/')[0],
              destination: parsed.destination,
              clicks: 0,
              status: 'active' as const,
            }
            const links = await readLinks()
            if (!link.destination || links.some((l: any) => l.alias === link.alias)) {
              res.statusCode = link.destination ? 409 : 400
              res.end(JSON.stringify({ error: link.destination ? 'Alias already in use' : 'Missing destination' }))
              return
            }
            links.unshift(link)
            await writeLinks(links)
            res.statusCode = 201
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(link))
            return
          }

          if (isShortLink) {
            const alias = decodeURIComponent(pathname.slice(1))
            const link = (await readLinks()).find((l: any) => l.alias === alias)
            if (link && link.status !== 'disabled') {
              res.statusCode = 302
              res.setHeader('Location', link.destination)
              res.setHeader('Cache-Control', 'no-store')
              res.end()
              return
            }
          }
        } catch {
          // fall through to the SPA on any backend error
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Build to repo-root/dist so the Node server and Vercel both find it easily.
  build: { outDir: resolve(import.meta.dirname, '../dist'), emptyOutDir: true },
  plugins: [react(), shortenlyBackend()],
})
