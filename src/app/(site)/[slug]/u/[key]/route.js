import { NextResponse } from 'next/server'
import { getSiteForRequest } from '@/lib/server/site-view'
import { setGuestSession, unlockKeyValid } from '@/lib/server/guest-access'

/**
 * One-tap unlock link: /{slug}/u/{key}. Valid until the couple rotates the
 * passcode. Always ends on /{slug} so the key never stays in the address bar
 * (or gets shared further from there).
 */
export async function GET(request, { params }) {
  const { slug, key } = await params
  const found = await getSiteForRequest(slug)
  if (!found) return new NextResponse('Not found', { status: 404 })

  const { site, access } = found
  if (access && unlockKeyValid(site.id, access.passcode_version, key)) {
    await setGuestSession({ siteId: site.id, passcodeVersion: access.passcode_version })
  }

  const response = NextResponse.redirect(new URL(`/${site.slug}`, request.url), 303)
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
