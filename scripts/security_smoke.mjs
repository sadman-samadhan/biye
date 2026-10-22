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

// Well-formed rows, so a refusal proves a permission check rather than a schema error
const VALID_ROW = {
  sites: () => ({ slug: `smoke-${Date.now()}` }),
  site_content: () => ({ site_id: crypto.randomUUID() }),
  messages: () => ({ name: 'smoke', message: 'smoke' }),
  rsvps: () => ({ site_id: crypto.randomUUID(), name: 'smoke', attending: true }),
}

const results = []
const record = (name, refused, detail) => results.push({ name, refused, detail })

async function probe(name, url, init = {}, { allowEmptyArray = false } = {}) {
  try {
    const res = await fetch(url, { redirect: 'manual', ...init })
    let refused = res.status >= 300
    let detail = `HTTP ${res.status}`
    if (res.status >= 400) {
      const text = await res.clone().text().catch(() => '')
      const reason = text.match(/"(?:message|error)"\s*:\s*"([^"]{0,70})/)?.[1]
      if (reason) detail += ` ${reason}`
    }
    if (!refused && allowEmptyArray) {
      const body = await res.json().catch(() => null)
      refused = Array.isArray(body) && body.length === 0
      detail += refused ? ' (empty)' : ` (${Array.isArray(body) ? body.length + ' rows' : 'data'} returned)`
    }
    record(name, refused, detail)
  } catch (err) {
    // An unreachable server proves nothing, so it fails the run
    record(name, false, `unreachable: ${err.cause?.code || err.message} (is the app running at ${BASE}? set SMOKE_BASE_URL)`)
  }
}

async function supabaseProbes() {
  if (!SUPABASE_URL || !ANON) {
    record('supabase env present', false, 'NEXT_PUBLIC_SUPABASE_URL / ANON key missing')
    return
  }
  const h = { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' }
  const rest = `${SUPABASE_URL}/rest/v1`

  for (const table of ['sites', 'site_content', 'messages', 'rsvps']) {
    await probe(`anon SELECT ${table}`, `${rest}/${table}?select=*&limit=1`, { headers: h }, { allowEmptyArray: true })
    await probe(`anon INSERT ${table}`, `${rest}/${table}`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(VALID_ROW[table]()),
    })
    await probe(`anon UPDATE ${table}`, `${rest}/${table}?id=not.is.null`, {
      method: 'PATCH',
      headers: { ...h, Prefer: 'return=representation' },
      body: JSON.stringify(table === 'messages' ? { approved: true } : { updated_at: new Date().toISOString() }),
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

  await probe('anon storage LIST site-media-private', `${SUPABASE_URL}/storage/v1/object/list/site-media-private`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ prefix: '', limit: 10 }),
  }, { allowEmptyArray: true })
  await probe('anon storage READ private object (authenticated path)', `${SUPABASE_URL}/storage/v1/object/authenticated/site-media-private/sites/x/m/y/web.webp`, { headers: h })
  await probe('anon storage READ private object (public path)', `${SUPABASE_URL}/storage/v1/object/public/site-media-private/sites/x/m/y/web.webp`)
  await probe('anon storage UPLOAD site-media-private', `${SUPABASE_URL}/storage/v1/object/site-media-private/sites/smoke/${Date.now()}.png`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'image/png' },
    body: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  })
  await probe('anon storage UPLOAD site-media', `${SUPABASE_URL}/storage/v1/object/site-media/smoke/${Date.now()}.png`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'image/png' },
    body: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  })
}

// A session whose JWT is signed with the wrong key must not be accepted
const SUPABASE_REF = SUPABASE_URL ? (new URL(SUPABASE_URL).hostname.split('.')[0] || '127') : 'x'
const FORGED_SESSION = {
  access_token: [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub: crypto.randomUUID(), role: 'authenticated', app_metadata: { role: 'admin' }, exp: 4102444800 })).toString('base64url'),
    'forged-signature',
  ].join('.'),
  refresh_token: 'forged',
  token_type: 'bearer',
  expires_at: 4102444800,
  user: { id: crypto.randomUUID(), app_metadata: { role: 'admin' } },
}

async function appProbes() {
  const json = { 'Content-Type': 'application/json' }
  const forged = [
    ['no cookie', {}],
    ['legacy amarbiye cookie', { Cookie: 'amarbiye_admin_session=authenticated' }],
    ['forged supabase session', { Cookie: `sb-${SUPABASE_REF}-auth-token=base64-${Buffer.from(JSON.stringify(FORGED_SESSION)).toString('base64url')}` }],
  ]
  for (const [label, headers] of forged) {
    await probe(`GET /api/admin/sites (${label})`, `${BASE}/api/admin/sites`, { headers })
    await probe(`POST /api/admin/sites (${label})`, `${BASE}/api/admin/sites`, { method: 'POST', headers: { ...headers, ...json }, body: '{"slug":"smoke-created"}' })
    await probe(`DELETE /api/admin/sites/x (${label})`, `${BASE}/api/admin/sites/x?permanent=true`, { method: 'DELETE', headers })
    await probe(`PATCH /api/sites/x/messages/y (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/messages/00000000-0000-0000-0000-000000000000`, { method: 'PATCH', headers: { ...headers, ...json }, body: '{"approved":true}' })
    await probe(`POST /api/sites/x/uploads (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/uploads`, { method: 'POST', headers: { ...headers, ...json }, body: '{"kind":"image","contentType":"image/jpeg","bytes":1000}' })
    await probe(`GET /api/sites/x/media (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/media`, { headers })
    await probe(`GET /api/sites/x/media/y/download (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/media/00000000-0000-0000-0000-000000000000/download`, { headers })
    await probe(`POST /api/sites/x/monogram (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/monogram`, { method: 'POST', headers: { ...headers, ...json }, body: '{}' })
    await probe(`GET /api/sites/x (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000`, { headers })
    await probe(`PATCH /api/sites/x/content (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/content`, { method: 'PATCH', headers: { ...headers, ...json }, body: '{"section":"hero","data":{}}' })
    await probe(`PATCH /api/sites/x/settings (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/settings`, { method: 'PATCH', headers: { ...headers, ...json }, body: '{"status":"live"}' })
    await probe(`POST /api/admin/sites/x/members (${label})`, `${BASE}/api/admin/sites/00000000-0000-0000-0000-000000000000/members`, { method: 'POST', headers: { ...headers, ...json }, body: '{"email":"a@b.co"}' })
    await probe(`GET /api/sites/x/access (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/access`, { headers })
    await probe(`PATCH /api/sites/x/access (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/access`, { method: 'PATCH', headers: { ...headers, ...json }, body: '{"siteAccess":"public"}' })
    await probe(`POST /api/sites/x/access/passcode (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/access/passcode`, { method: 'POST', headers: { ...headers, ...json }, body: '{"passcode":"attacker-1234"}' })
    await probe(`POST /api/sites/x/access/revoke (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/access/revoke`, { method: 'POST', headers: { ...headers, ...json }, body: '{}' })
    await probe(`GET /api/sites/x/rsvps (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/rsvps?format=csv`, { headers })
    await probe(`DELETE /api/sites/x/rsvps/y (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/rsvps/00000000-0000-0000-0000-000000000000`, { method: 'DELETE', headers })
    await probe(`POST /api/sites/x/media/download-links (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/media/download-links`, { method: 'POST', headers: { ...headers, ...json }, body: '{}' })
    await probe(`POST /api/sites/x/palette (${label})`, `${BASE}/api/sites/00000000-0000-0000-0000-000000000000/palette`, { method: 'POST', headers: { ...headers, ...json }, body: '{"media":"media:00000000-0000-0000-0000-000000000000"}' })
  }
  await probe('GET /admin redirects to login', `${BASE}/admin`)
  await probe('GET /dashboard redirects to login', `${BASE}/dashboard`)
  await probe('GET /dashboard/x redirects to login', `${BASE}/dashboard/00000000-0000-0000-0000-000000000000`)
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
