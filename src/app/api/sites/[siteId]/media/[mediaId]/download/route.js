import { NextResponse } from 'next/server'
import { authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { keys, storage } from '@/lib/server/storage'

/**
 * The couple (and operators) can download the full-size copy of their own
 * photos. Redirects to a 5-minute signed URL; guests never get this variant.
 */
export async function GET(req, { params }) {
  const { siteId, mediaId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied

  const { data: row } = await serviceClient()
    .from('media')
    .select('id, kind, storage_key, variants, original_name')
    .eq('id', mediaId)
    .eq('site_id', siteId)
    .eq('status', 'ready')
    .maybeSingle()
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const name = row.kind === 'video' ? 'video' : row.variants.master ? 'master' : 'web'
  const variant = row.variants[name]
  const key = keys.variant(row.storage_key, name, variant.ext)
  const base = (row.original_name || 'photo').replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '_').slice(0, 60) || 'photo'
  const signed = await storage().signGet([key], { ttl: 300, download: `${base}.${variant.ext}` })
  const url = signed.get(key)
  if (!url) return NextResponse.json({ error: 'File is missing' }, { status: 404 })

  const response = NextResponse.redirect(url, 302)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
