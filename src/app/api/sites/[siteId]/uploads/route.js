import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { getSiteById } from '@/lib/server/site-data'
import { rateLimitHit } from '@/lib/server/rate-limit'
import { MediaError, startUpload } from '@/lib/server/media/service'

/**
 * Start an upload. Body: { kind: 'image'|'video', contentType, bytes, name, slot, album }.
 * Returns a short-lived direct-to-storage target, so large files never pass
 * through the app server (Vercel caps request bodies at 4.5 MB).
 */
export async function POST(req, { params }) {
  const { siteId } = await params
  const { denied, user } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  if (!(await rateLimitHit(`upload:${siteId}`, { limit: 400, windowS: 3600 }))) {
    return NextResponse.json({ error: 'Too many uploads in the last hour. Try again later.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const site = await getSiteById(siteId)
  if (!body || !site) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  try {
    const result = await startUpload({
      site,
      userId: user.id,
      kind: body.kind,
      contentType: String(body.contentType || ''),
      bytes: Number(body.bytes) || 0,
      name: body.name,
      slot: body.slot,
      album: body.album,
    })
    return NextResponse.json(result)
  } catch (err) {
    const status = err instanceof MediaError ? err.status : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}
