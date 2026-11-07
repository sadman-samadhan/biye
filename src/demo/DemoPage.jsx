import { notFound } from 'next/navigation'
import SiteRenderer from '@/site/SiteRenderer'
import InviteRenderer from '@/site/invite/InviteRenderer'
import DemoBar from './DemoBar'
import { demoSite, isDemo } from './packs'
import { ceremoniesForList, guestListFor } from '@/lib/invitation'

/** A theme × tradition demo, as the full site or the invitation (optionally for one sample guest list). */
export default async function DemoPage({ params, view = 'site' }) {
  const { theme: themeId, tradition: traditionId, list: listId = null } = await params
  if (!isDemo(themeId, traditionId)) notFound()
  const { site, content, theme, tradition } = demoSite(themeId, traditionId)
  const list = listId ? guestListFor(content.invitation, listId) : null
  if (listId && !list) notFound()
  const lists = view === 'invite' ? content.invitation.guestLists.map((l) => ({ id: l.id, name: l.name })) : []
  const banner = <DemoBar themeId={themeId} traditionId={traditionId} view={view} lists={lists} listId={list?.id || null} />
  const common = { site, content, theme, tradition, paletteId: site.theme_settings.paletteId, viewerName: null, banner }

  if (view !== 'invite') return <SiteRenderer {...common} />
  // Demos are static pages: use the public address rather than the request's
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://shubhobiye.com').replace(/\/$/, '')
  const invite = list ? { ...common, content: { ...content, ceremonies: ceremoniesForList(content.ceremonies, list) } } : common
  return <InviteRenderer {...invite} mode="invite" origin={origin} listId={list?.id || null} demo />
}

export function demoMetadata(themeId, traditionId, view) {
  if (!isDemo(themeId, traditionId)) return {}
  const { theme, tradition } = demoSite(themeId, traditionId)
  return {
    title: `${theme.name.en} · ${tradition.label?.en} ${view === 'invite' ? 'invitation' : 'site'} demo | ShubhoBiye`,
    description: theme.description.en,
    robots: { index: true, follow: true },
  }
}
