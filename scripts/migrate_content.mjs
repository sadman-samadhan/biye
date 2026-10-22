#!/usr/bin/env node
/**
 * Brings sites created before v2 up to date. Dry run by default; prints what it
 * would change. Safe to re-run.
 *
 *   node --conditions=react-server --env-file=.env.local scripts/migrate_content.mjs
 *   node --conditions=react-server --env-file=.env.local scripts/migrate_content.mjs --apply
 *   … --site=<slug>   only one site
 *
 * For each site:
 *   - theme "classic" (or none) → "cinematic"; tradition "general" → "universal"
 *   - products default to the memories site (["site"]) when unset
 *   - ceremonies: legacy `flow` → `beats`; every ceremony gets an id
 *   - a guest passcode when the site has none
 *   - reports addresses that no longer meet the slug rules (renaming is manual)
 * Photos still on the old public bucket are moved by scripts/migrate_media.mjs.
 *
 * (--conditions=react-server lets Node load the server-only passcode module.)
 */
import { createClient } from '@supabase/supabase-js'
import { encryptPasscode, newPasscode } from '../lib/server/passcode-crypto.js'
import { SLUG_PATTERN } from '../lib/slugs.js'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const onlySlug = args.find((a) => a.startsWith('--site='))?.slice(7)

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}
const db = createClient(url, key, { auth: { persistSession: false } })

const THEME_ALIASES = { classic: 'cinematic', '': 'cinematic' }
const TRADITION_ALIASES = { general: 'universal' }

function migrateCeremonies(list = []) {
  let changed = false
  const used = new Set()
  const out = list.map((c, i) => {
    const next = { ...c }
    if (!next.id) {
      const base = String(next.slug || next.title?.en || `event-${i + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `event-${i + 1}`
      let id = base
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`
      next.id = id
      changed = true
    }
    used.add(next.id)
    if (Array.isArray(next.flow) && next.flow.length && !next.beats?.length) {
      next.beats = next.flow.map((f) => ({ label: f.label || f.beat || '', title: f.title || { en: '', bn: '' }, description: f.description || { en: '', bn: '' } }))
      changed = true
    }
    if ('flow' in next) {
      delete next.flow
      changed = true
    }
    return next
  })
  return { ceremonies: out, changed }
}

let query = db.from('sites').select('id, slug, template_id, wedding_type, products')
if (onlySlug) query = query.eq('slug', onlySlug)
const { data: sites, error } = await query
if (error) {
  console.error(error.message)
  process.exit(1)
}

let touched = 0
for (const site of sites) {
  const notes = []
  const siteUpdate = {}
  const theme = THEME_ALIASES[site.template_id ?? '']
  if (theme) siteUpdate.template_id = theme
  const tradition = TRADITION_ALIASES[site.wedding_type]
  if (tradition) siteUpdate.wedding_type = tradition
  if (!site.products?.length) siteUpdate.products = ['site']
  if (Object.keys(siteUpdate).length) notes.push(`site ${JSON.stringify(siteUpdate)}`)
  if (!SLUG_PATTERN.test(site.slug)) notes.push(`address "${site.slug}" breaks the slug rules: rename it in Site settings`)

  const { data: content } = await db.from('site_content').select('ceremonies, version').eq('site_id', site.id).maybeSingle()
  const migrated = migrateCeremonies(content?.ceremonies || [])
  if (migrated.changed) notes.push('ceremonies: flow → beats / ids')

  const { data: access } = await db.from('site_access').select('passcode_enc').eq('site_id', site.id).maybeSingle()
  const needsPasscode = !access?.passcode_enc
  if (needsPasscode) notes.push('new guest passcode')

  if (!notes.length) continue
  touched++
  console.log(`${apply ? 'UPDATE' : 'would update'} ${site.slug}: ${notes.join('; ')}`)
  if (!apply) continue

  if (Object.keys(siteUpdate).length) {
    const { error: e } = await db.from('sites').update({ ...siteUpdate, updated_at: new Date().toISOString() }).eq('id', site.id)
    if (e) console.error(`  sites: ${e.message}`)
  }
  if (migrated.changed && content) {
    const { error: e } = await db
      .from('site_content')
      .update({ ceremonies: migrated.ceremonies, version: (content.version || 1) + 1, updated_at: new Date().toISOString() })
      .eq('site_id', site.id)
      .eq('version', content.version || 1)
    if (e) console.error(`  content: ${e.message}`)
  }
  if (needsPasscode) {
    const { error: e } = await db.from('site_access').upsert({ site_id: site.id, passcode_enc: encryptPasscode(newPasscode()) }, { onConflict: 'site_id' })
    if (e) console.error(`  passcode: ${e.message}`)
  }
}
console.log(`\n${sites.length} sites checked, ${touched} ${apply ? 'updated' : 'need changes (run with --apply)'}`)
