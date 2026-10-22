import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { keys, storage } from '@/lib/server/storage'
import { rateLimitHit } from '@/lib/server/rate-limit'

const LIMIT = { limit: 30, windowS: 10 * 60 }

const safeName = (value) => (value || 'photo').replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '_').slice(0, 60) || 'photo'

/**
 * Five-minute links to the full-size copy of every photo and video, so the
 * couple can save them all (the dashboard zips them in the browser).
 * Body: { ids?: string[] } — omit for everything.
 */
export async function POST(req, { params }) {
  const { siteId } = await params
  const { denied, user } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin
  if (!(await rateLimitHit(`dl:${siteId}:${user.id}`, LIMIT))) {
    return NextResponse.json({ error: 'Too many downloads at once. Please wait a few minutes.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === 'string').slice(0, 1000) : null

  let query = serviceClient()
    .from('media')
    .select('id, kind, slot, storage_key, variants, original_name, bytes_total, created_at')
    .eq('site_id', siteId)
    .eq('status', 'ready')
    .neq('slot', 'monogram')
    .order('created_at', { ascending: true })
    .limit(1000)
  if (ids) query = query.in('id', ids)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Could not list photos' }, { status: 500 })

  const items = (data || [])
    .map((row) => {
      const name = row.kind === 'video' ? 'video' : row.variants?.master ? 'master' : 'web'
      const variant = row.variants?.[name]
      return variant ? { row, key: keys.variant(row.storage_key, name, variant.ext), ext: variant.ext, bytes: variant.bytes } : null
    })
    .filter(Boolean)
  const signed = await storage().signGet(
    items.map((i) => i.key),
    { ttl: 300 }
  )

  const used = new Set()
  const files = items
    .filter((i) => signed.get(i.key))
    .map((i, n) => {
      let name = `${String(n + 1).padStart(3, '0')}-${safeName(i.row.original_name)}.${i.ext}`
      while (used.has(name)) name = `x${name}`
      used.add(name)
      return { id: i.row.id, name, url: signed.get(i.key), bytes: Number(i.bytes || 0) }
    })

  return NextResponse.json({ files }, { headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } })
}
