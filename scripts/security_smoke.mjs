#!/usr/bin/env node
/**
 * Security smoke test. Every probe below MUST be refused.
 *
 *   npm run smoke:security                     (uses .env.local, app at http://localhost:3000)
 *   SMOKE_BASE_URL=https://staging.example npm run smoke:security
 *
 * Probes the database/storage directly with the public anon key, and the app's
 * operator APIs without a session (and with forged cookies).
 */

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const results = []
const record = (name, refused, detail) => results.push({ name, refused, detail })

async function probe(name, url, init = {}, { allowEmptyArray = false } = {}) {
  try {
    const res = await fetch(url, { redirect: 'manual', ...init })
    let refused = res.status >= 300
    let detail = `HTTP ${res.status}`
    if (!refused && allowEmptyArray) {
      const body = await res.json().catch(() => null)
      refused = Array.isArray(body) && body.length === 0
      detail += refused ? ' (empty)' : ` (${Array.isArray(body) ? body.length + ' rows' : 'data'} returned)`
    }
    record(name, refused, detail)
  } catch (err) {
    record(name, true, `unreachable: ${err.cause?.code || err.message}`)
  }
}

async function supabaseProbes() {
  if (!SUPABASE_URL || !ANON) {
    record('supabase env present', false, 'NEXT_PUBLIC_SUPABASE_URL / ANON key missing')
    return
  }
  const h = { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' }
  const rest = `${SUPABASE_URL}/rest/v1`

  for (const table of ['sites', 'site_content', 'messages']) {
    await probe(`anon SELECT ${table}`, `${rest}/${table}?select=*&limit=1`, { headers: h }, { allowEmptyArray: true })
    await probe(`anon INSERT ${table}`, `${rest}/${table}`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(table === 'sites' ? { slug: `smoke-${Date.now()}` } : { name: 'x', message: 'x' }),
    })
    await probe(`anon UPDATE ${table}`, `${rest}/${table}?id=not.is.null`, {
      method: 'PATCH',
      headers: { ...h, Prefer: 'return=representation' },
      body: JSON.stringify({ updated_at: new Date().toISOString() }),
    }, { allowEmptyArray: true })
    await probe(`anon DELETE ${table}`, `${rest}/${table}?id=not.is.null`, {
      method: 'DELETE',
      headers: { ...h, Prefer: 'return=representation' },
    }, { allowEmptyArray: true })
  }

  await probe('anon storage LIST site-media', `${SUPABASE_URL}/storage/v1/object/list/site-media`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ prefix: '', limit: 10 }),
  }, { allowEmptyArray: true })

  await probe('anon storage UPLOAD site-media', `${SUPABASE_URL}/storage/v1/object/site-media/smoke/${Date.now()}.txt`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'text/plain' },
    body: 'smoke',
  })
}

async function appProbes() {
  const json = { 'Content-Type': 'application/json' }
  const forged = [
    ['no cookie', {}],
    ['forged shb_admin', { Cookie: 'shb_admin=authenticated' }],
    ['legacy amarbiye cookie', { Cookie: 'amarbiye_admin_session=authenticated' }],
  ]
  for (const [label, headers] of forged) {
    await probe(`GET /api/admin/sites (${label})`, `${BASE}/api/admin/sites`, { headers })
    await probe(`PUT /api/admin/sites/x (${label})`, `${BASE}/api/admin/sites/x`, { method: 'PUT', headers: { ...headers, ...json }, body: '{}' })
    await probe(`DELETE /api/admin/sites/x (${label})`, `${BASE}/api/admin/sites/x?permanent=true`, { method: 'DELETE', headers })
    await probe(`PUT /api/admin/messages/x (${label})`, `${BASE}/api/admin/messages/x`, { method: 'PUT', headers: { ...headers, ...json }, body: '{"approved":true}' })
    await probe(`POST /api/upload (${label})`, `${BASE}/api/upload`, { method: 'POST', headers, body: new FormData() })
    await probe(`POST /api/monogram (${label})`, `${BASE}/api/monogram`, { method: 'POST', headers: { ...headers, ...json }, body: '{}' })
    await probe(`POST /api/palette (${label})`, `${BASE}/api/palette`, { method: 'POST', headers: { ...headers, ...json }, body: '{"imageUrl":"/../.env.local"}' })
  }
  await probe('GET /admin redirects to login', `${BASE}/admin`)
}

await supabaseProbes()
await appProbes()

const width = Math.max(...results.map((r) => r.name.length))
let failures = 0
for (const r of results) {
  if (!r.refused) failures++
  console.log(`${r.refused ? 'PASS' : 'FAIL'}  ${r.name.padEnd(width)}  ${r.detail}`)
}
console.log(`\n${results.length - failures}/${results.length} probes refused`)
process.exit(failures ? 1 : 0)
