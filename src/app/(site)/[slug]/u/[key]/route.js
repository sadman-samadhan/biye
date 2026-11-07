import { NextResponse } from 'next/server'
import { getSiteForRequest } from '@/lib/server/site-view'
import { getSiteContent } from '@/lib/server/site-data'
import { listUnlockKeyValid, setGuestSession, unlockKeyValid } from '@/lib/server/guest-access'
import { guestListFor } from '@/lib/invitation'

/**
 * One-tap unlock link: /{slug}/u/{key}. Valid until the couple rotates the
 * passcode. A guest list's link (?list={id}) carries that list's own key, and
 * the guest stays limited to that list's events. Always ends on /{slug} (or
 * /{slug}/i/{list}) so the key never stays in the address bar or gets shared further.
 */
export async function GET(request, { params }) {
  const { slug, key } = await params
  const found = await getSiteForRequest(slug)
  if (!found) return new NextResponse('Not found', { status: 404 })

  const { site, access } = found
  const listId = new URL(request.url).searchParams.get('list')
  // A guest list's one-tap link has its own key and only opens that list's events
  const list = listId ? guestListFor((await getSiteContent(site.id)).invitation, listId) : null
  if (access && list && listUnlockKeyValid(site.id, access.passcode_version, list, key)) {
    await setGuestSession({ siteId: site.id, passcodeVersion: access.passcode_version, list: list.id })
  } else if (access && !listId && unlockKeyValid(site.id, access.passcode_version, key)) {
    await setGuestSession({ siteId: site.id, passcodeVersion: access.passcode_version })
  }

  const target = list ? `/${site.slug}/i/${list.id}` : `/${site.slug}`
  const response = NextResponse.redirect(new URL(target, request.url), 303)
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
