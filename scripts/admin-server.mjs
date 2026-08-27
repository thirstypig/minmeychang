#!/usr/bin/env node
// A local-only editor for src/data/archive.ts — captions, categories,
// decades, ordering, deletion. `npm run admin`, then open the URL it prints.
//
// WHY LOCAL ONLY. This site is a static export with no server in
// production, so there is nowhere for a hosted editor to safely write a
// change back to — that would mean a write-capable page on the public
// internet, secured only by an unlisted URL and a token sitting in a
// browser. This runs on 127.0.0.1 only, writes straight to the file on
// disk, and leaves committing/pushing/PR-ing that change to the normal git
// workflow, same as any other edit to this repo.
//
// WHAT THIS DOES NOT DO. It does not add new photos. A new photograph still
// needs `npm run photos` (EXIF/GPS strip) and a human looking for a home
// address, a phone number or an unconsented face before it can be
// referenced from archive.ts — see scripts/ingest-photos.mjs. This tool
// only edits entries that already cleared that gate.

import { createServer } from 'node:http'
import { readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { loadArchive, saveArchive } from './admin/archive-io.mjs'

const PORT = 4170
const HOST = '127.0.0.1'
const ADMIN_DIR = new URL('./admin', import.meta.url).pathname
const PUBLIC_ARCHIVE_DIR = 'public/archive'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
}

async function sendFile(res, path) {
  const body = await readFile(path)
  res.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' })
  res.end(body)
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(body)
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : null
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)

    if (req.method === 'GET' && url.pathname === '/') {
      return sendFile(res, join(ADMIN_DIR, 'index.html'))
    }
    if (req.method === 'GET' && url.pathname === '/admin.js') {
      return sendFile(res, join(ADMIN_DIR, 'admin.js'))
    }

    if (req.method === 'GET' && url.pathname.startsWith('/archive-images/')) {
      const name = normalize(url.pathname.replace('/archive-images/', ''))
      if (name.startsWith('..') || name.includes('/')) {
        res.writeHead(400).end('bad path')
        return
      }
      const path = join(PUBLIC_ARCHIVE_DIR, name)
      if (!existsSync(path)) {
        res.writeHead(404).end('not found')
        return
      }
      return sendFile(res, path)
    }

    if (req.method === 'GET' && url.pathname === '/api/archive') {
      const { items, categoryOrder, categoryLabels } = await loadArchive()
      return sendJson(res, 200, { items, categoryOrder, categoryLabels })
    }

    if (req.method === 'POST' && url.pathname === '/api/save') {
      const body = await readBody(req)
      if (!Array.isArray(body?.items)) return sendJson(res, 400, { error: 'expected { items: [...] }' })
      await saveArchive(body.items)

      // Deleting an entry from the array doesn't delete its image — that's
      // a separate, explicit choice, made per-item in the UI, so a mistaken
      // entry-delete never silently destroys a photo nobody meant to lose.
      for (const name of body.deleteAssets ?? []) {
        const safe = normalize(name)
        if (safe.startsWith('..') || safe.includes('/')) continue
        const path = join(PUBLIC_ARCHIVE_DIR, safe)
        if (existsSync(path)) await rm(path)
      }

      return sendJson(res, 200, { ok: true })
    }

    res.writeHead(404).end('not found')
  } catch (error) {
    console.error(error)
    sendJson(res, 500, { error: error.message })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`\nArchive editor running at http://${HOST}:${PORT}/`)
  console.log('Local only — writes straight to src/data/archive.ts on disk.')
  console.log('Review with `git diff` and commit/PR as usual when you\'re done.\n')
})
