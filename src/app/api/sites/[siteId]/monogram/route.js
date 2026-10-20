import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { getSiteById } from '@/lib/server/site-data'
import { rateLimitHit } from '@/lib/server/rate-limit'
import { generateMonogram } from '@/lib/monogramGenerator'
import { MediaError, storeGeneratedImage } from '@/lib/server/media/service'

export const maxDuration = 30

const clip = (value, max) => (typeof value === 'string' ? value.slice(0, max) : undefined)

/** Render a monogram from the couple's names and store it as site media. */
export async function POST(req, { params }) {
  const { siteId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin
  if (!(await rateLimitHit(`monogram:${siteId}`, { limit: 20, windowS: 86400 }))) {
    return NextResponse.json({ error: 'Monogram limit reached for today. Try again tomorrow.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const site = await getSiteById(siteId)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const buffer = await generateMonogram({
      name1: clip(body.name1, 40) || 'Bride',
      name2: clip(body.name2, 40) || 'Groom',
      blessingText: clip(body.blessingText, 160),
      verseSnippet: clip(body.verseSnippet, 80),
      venue: clip(body.venue, 80),
      weddingType: site.wedding_type === 'hindu' ? 'hindu' : 'muslim',
    })
    const media = await storeGeneratedImage({ site, buffer, contentType: 'image/png', slot: 'monogram' })
    return NextResponse.json({ media })
  } catch (err) {
    const status = err instanceof MediaError ? err.status : 500
    if (status === 500) console.error('[monogram]', err)
    return NextResponse.json({ error: status === 500 ? 'Could not generate the monogram' : err.message }, { status })
  }
}
