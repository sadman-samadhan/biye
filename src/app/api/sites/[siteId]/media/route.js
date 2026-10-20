import { NextResponse } from 'next/server'
import { authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { getSiteById } from '@/lib/server/site-data'
import { signMedia } from '@/lib/server/media/resolve'
import { toMediaToken } from '@/lib/media-ref'
import { planLimits } from '@/lib/plans'

/** Media library for the editor: every ready item with signed thumbnails, plus usage. */
export async function GET(req, { params }) {
  const { siteId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied

  const slot = req.nextUrl.searchParams.get('slot')
  let query = serviceClient()
    .from('media')
    .select('id, kind, slot, album, storage_key, variants, width, height, lqip, is_public, bytes_total, created_at')
    .eq('site_id', siteId)
    .eq('status', 'ready')
    .order('created_at', { ascending: true })
    .limit(1000)
  if (slot) query = query.eq('slot', slot)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const urls = await signMedia(data || [], { variants: ['thumb', 'web'] })
  const site = await getSiteById(siteId)
  const limits = planLimits(site)

  return NextResponse.json(
    {
      media: (data || []).map((row) => ({
        id: row.id,
        token: toMediaToken(row.id),
        kind: row.kind,
        slot: row.slot,
        album: row.album,
        width: row.width,
        height: row.height,
        isPublic: row.is_public,
        bytes: Number(row.bytes_total || 0),
        thumb: urls[row.id]?.thumb || urls[row.id]?.web || urls[row.id]?.video || null,
        web: urls[row.id]?.web || urls[row.id]?.video || null,
      })),
      usage: {
        bytes: Number(site?.storage_used_bytes || 0),
        quotaBytes: limits.storageBytes,
        photos: (data || []).filter((r) => r.kind === 'image' && r.slot !== 'monogram').length,
        photoLimit: limits.photos,
      },
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}
