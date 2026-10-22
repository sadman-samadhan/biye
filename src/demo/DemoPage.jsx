import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import SiteRenderer from '@/site/SiteRenderer'
import InviteRenderer from '@/site/invite/InviteRenderer'
import DemoBar from './DemoBar'
import { demoSite, isDemo } from './packs'

/** A theme × tradition demo, as the full site or the invitation. */
export default async function DemoPage({ params, view = 'site' }) {
  const { theme: themeId, tradition: traditionId } = await params
  if (!isDemo(themeId, traditionId)) notFound()
  const { site, content, theme, tradition } = demoSite(themeId, traditionId)
  const banner = <DemoBar themeId={themeId} traditionId={traditionId} view={view} />
  const common = { site, content, theme, tradition, paletteId: site.theme_settings.paletteId, viewerName: null, banner }

  if (view !== 'invite') return <SiteRenderer {...common} />
  // Demos are static pages: use the public address rather than the request's
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://shubhobiye.com').replace(/\/$/, '')
  const qr = await QRCode.toString(`${origin}/${site.slug}/invite`, { type: 'svg', margin: 1 })
    .then((svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
    .catch(() => null)
  return <InviteRenderer {...common} mode="invite" origin={origin} qr={qr} demo />
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
