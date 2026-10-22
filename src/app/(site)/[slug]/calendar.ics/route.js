import { getSiteContent } from '@/lib/server/site-data'
import { getSiteForRequest } from '@/lib/server/site-view'
import { siteOrigin } from '@/lib/server/site-access'
import { buildIcs } from '@/lib/calendar'
import { inviteEvents } from '@/lib/invitation'

/** The invitation's events as a calendar file (?event=<id> for just one). */
export async function GET(req, { params }) {
  const { slug } = await params
  const found = await getSiteForRequest(slug)
  if (!found) return new Response('Not found', { status: 404 })
  if (!found.canView('invite')) return new Response('Passcode required', { status: 401 })

  const { site } = found
  const { content, ceremonies } = await getSiteContent(site.id)
  const names = content?.hero?.coupleNames?.en || site.owner_name || ''
  const only = new URL(req.url).searchParams.get('event')
  const events = inviteEvents(ceremonies)
    .filter((c) => c.startsAt && (!only || c.id === only))
    .map((c) => ({
      id: `${c.id}.${site.id}`,
      title: [c.title?.en || c.title?.bn || 'Wedding', names].filter(Boolean).join(' · '),
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      location: [c.venue?.en, c.venue?.address?.en].filter(Boolean).join(', '),
    }))
  if (!events.length) return new Response('Not found', { status: 404 })

  const ics = buildIcs({ calendarName: names || 'Wedding', url: `${siteOrigin(req)}/${site.slug}`, events })
  const file = only ? `${site.slug}-${only}` : site.slug
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${file.replace(/[^a-z0-9-]/gi, '')}.ics"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
