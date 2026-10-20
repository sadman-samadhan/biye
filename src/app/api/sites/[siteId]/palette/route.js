import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { keys, storage } from '@/lib/server/storage'
import { rateLimitHit } from '@/lib/server/rate-limit'
import { palettesFromImage } from '@/lib/server/palette-ai'
import { mediaIdOf } from '@/lib/media-ref'
import { PRESET_PALETTES } from '@/lib/palettes'

/** Suggest palettes from one of the site's own photos. Body: { media: "media:<uuid>" }. */
export async function POST(req, { params }) {
  const { siteId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const { media } = await req.json().catch(() => ({}))
  const mediaId = mediaIdOf(media)
  if (!mediaId) {
    return NextResponse.json({ isAiGenerated: false, message: 'Upload a cover photo first to match its colours.', palettes: PRESET_PALETTES })
  }
  if (!(await rateLimitHit(`palette:${siteId}`, { limit: 10, windowS: 86400 }))) {
    return NextResponse.json({ error: 'You can match colours 10 times a day. Try again tomorrow.' }, { status: 429 })
  }

  const { data: row } = await serviceClient()
    .from('media')
    .select('storage_key, variants')
    .eq('id', mediaId)
    .eq('site_id', siteId)
    .eq('status', 'ready')
    .maybeSingle()
  const variant = row?.variants?.thumb ? 'thumb' : row?.variants?.web ? 'web' : null
  if (!variant) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

  const buffer = await storage().get(keys.variant(row.storage_key, variant, row.variants[variant].ext))
  if (!buffer) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  const ext = row.variants[variant].ext
  return NextResponse.json(await palettesFromImage(buffer, ext === 'jpg' ? 'image/jpeg' : `image/${ext}`))
}
