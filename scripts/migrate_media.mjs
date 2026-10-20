#!/usr/bin/env node
/**
 * Moves photos that still live in the legacy PUBLIC bucket (`site-media`) into
 * the private media pipeline, and rewrites site content to "media:<id>" tokens.
 *
 *   node --env-file=.env.local scripts/migrate_media.mjs                 # dry run, all sites
 *   node --env-file=.env.local scripts/migrate_media.mjs --apply         # do it
 *   node --env-file=.env.local scripts/migrate_media.mjs --site=slug --apply
 *
 * Uses the Supabase storage driver (STORAGE_DRIVER=r2 is not supported here yet).
 * Safe to re-run: already-migrated content has no legacy URLs left.
 * After every site is migrated, empty the old bucket and set it private.
 */
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { processImage, variantMime } from '../lib/server/media/process.js'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const onlySlug = args.find((a) => a.startsWith('--site='))?.slice(7)
const PRIVATE_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'site-media-private'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}
if ((process.env.STORAGE_DRIVER || 'supabase') !== 'supabase') {
  console.error('This script writes to Supabase storage; unset STORAGE_DRIVER or run before switching to R2.')
  process.exit(1)
}
const supabase = createClient(url, key, { auth: { persistSession: false } })
const LEGACY = /\/storage\/v1\/object\/public\/site-media\//

function collectLegacyUrls(value, found = new Set()) {
  if (typeof value === 'string') {
    if (LEGACY.test(value)) found.add(value)
  } else if (Array.isArray(value)) value.forEach((v) => collectLegacyUrls(v, found))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectLegacyUrls(v, found))
  return found
}

function replaceUrls(value, map) {
  if (typeof value === 'string') return map.get(value) ?? value
  if (Array.isArray(value)) return value.map((v) => replaceUrls(v, map))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceUrls(v, map)]))
  return value
}

async function migrateOne(site, sourceUrl) {
  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const isVideo = /\.(mp4|webm)$/i.test(new URL(sourceUrl).pathname)
  const id = randomUUID()
  const base = `sites/${site.id}/m/${id}`
  let row

  if (isVideo) {
    const ext = sourceUrl.toLowerCase().endsWith('.webm') ? 'webm' : 'mp4'
    if (apply) {
      const { error } = await supabase.storage.from(PRIVATE_BUCKET).upload(`${base}/video.${ext}`, buffer, { contentType: `video/${ext}` })
      if (error) throw error
    }
    row = { kind: 'video', slot: 'video', variants: { video: { ext, bytes: buffer.length } }, bytes_total: buffer.length }
  } else {
    const processed = await processImage(buffer)
    if (apply) {
      for (const [name, v] of Object.entries(processed.variants)) {
        const { error } = await supabase.storage.from(PRIVATE_BUCKET).upload(`${base}/${name}.${v.ext}`, v.buffer, { contentType: variantMime(v.format), upsert: true })
        if (error) throw error
      }
    }
    const total = Object.values(processed.variants).reduce((s, v) => s + v.bytes, 0)
    row = {
      kind: 'image',
      slot: 'gallery',
      variants: Object.fromEntries(Object.entries(processed.variants).map(([n, v]) => [n, { w: v.w, h: v.h, bytes: v.bytes, ext: v.ext }])),
      width: processed.width,
      height: processed.height,
      lqip: processed.lqip,
      sha256: processed.sha256,
      bytes_total: total,
    }
  }

  if (apply) {
    const { error } = await supabase.from('media').insert({ id, site_id: site.id, status: 'ready', storage_key: base, original_name: decodeURIComponent(sourceUrl.split('/').pop()), ...row })
    if (error) throw error
    await supabase.rpc('add_storage_usage', { p_site: site.id, p_delta: row.bytes_total, p_quota: null })
  }
  return { token: `media:${id}`, bytes: row.bytes_total }
}

let query = supabase.from('sites').select('id, slug')
if (onlySlug) query = query.eq('slug', onlySlug)
const { data: sites, error } = await query
if (error) throw error

let totalFiles = 0
let failed = 0
for (const site of sites) {
  const { data: content } = await supabase.from('site_content').select('content, ceremonies, duas, gallery, invitation, version').eq('site_id', site.id).maybeSingle()
  if (!content) continue
  const urls = collectLegacyUrls({ content: content.content, ceremonies: content.ceremonies, duas: content.duas, gallery: content.gallery, invitation: content.invitation })
  if (!urls.size) continue

  console.log(`${site.slug}: ${urls.size} legacy file(s)`)
  const map = new Map()
  for (const sourceUrl of urls) {
    try {
      const { token, bytes } = await migrateOne(site, sourceUrl)
      map.set(sourceUrl, token)
      totalFiles++
      console.log(`  ✓ ${sourceUrl.split('/').pop()} → ${apply ? token : '(dry run)'} ${Math.round(bytes / 1024)} KB`)
    } catch (err) {
      failed++
      console.warn(`  ✗ ${sourceUrl}: ${err.message}`)
    }
  }

  if (apply && map.size) {
    const update = {
      content: replaceUrls(content.content, map),
      ceremonies: replaceUrls(content.ceremonies, map),
      duas: replaceUrls(content.duas, map),
      gallery: replaceUrls(content.gallery, map),
      invitation: replaceUrls(content.invitation, map),
      version: (content.version || 1) + 1,
      updated_at: new Date().toISOString(),
    }
    const { error: writeError } = await supabase.from('site_content').update(update).eq('site_id', site.id).eq('version', content.version)
    if (writeError) console.warn(`  ! could not update content for ${site.slug}: ${writeError.message}`)
  }
}

console.log(`\n${apply ? 'Migrated' : 'Would migrate'} ${totalFiles} file(s)${failed ? `, ${failed} failed` : ''}.`)
if (!apply && totalFiles) console.log('Re-run with --apply to perform the migration.')
process.exit(failed ? 1 : 0)
