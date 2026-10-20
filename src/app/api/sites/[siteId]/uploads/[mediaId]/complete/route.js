import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { getSiteById } from '@/lib/server/site-data'
import { MediaError, completeUpload } from '@/lib/server/media/service'

export const maxDuration = 60

/** Finish an upload: resize into variants, enforce the storage quota, mark ready. */
export async function POST(req, { params }) {
  const { siteId, mediaId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const site = await getSiteById(siteId)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    return NextResponse.json({ media: await completeUpload({ site, mediaId }) })
  } catch (err) {
    const status = err instanceof MediaError ? err.status : 500
    if (status === 500) console.error('[upload complete]', err)
    return NextResponse.json({ error: err.message }, { status })
  }
}
