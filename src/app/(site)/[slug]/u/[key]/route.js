import { NextResponse } from 'next/server'
import { getSiteForRequest } from '@/lib/server/site-view'
import { setGuestSession, unlockKeyValid } from '@/lib/server/guest-access'
import { GUEST_LIST_ID } from '@/lib/invitation'

/**
 * One-tap unlock link: /{slug}/u/{key}. Valid until the couple rotates the
 * passcode. Always ends on /{slug} (or a guest list's /{slug}/i/{list} with
 * ?list=) so the key never stays in the address bar or gets shared further.
 */
export async function GET(request, { params }) {
  const { slug, key } = await params
  const found = await getSiteForRequest(slug)
  if (!found) return new NextResponse('Not found', { status: 404 })

  const { site, access } = found
  if (access && unlockKeyValid(site.id, access.passcode_version, key)) {
    await setGuestSession({ siteId: site.id, passcodeVersion: access.passcode_version })
  }

  const list = new URL(request.url).searchParams.get('list')
  const target = list && GUEST_LIST_ID.test(list) ? `/${site.slug}/i/${list}` : `/${site.slug}`
  const response = NextResponse.redirect(new URL(target, request.url), 303)
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
