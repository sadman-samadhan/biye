import { notFound, redirect } from 'next/navigation'
import { getSiteContent } from '@/lib/server/site-data'
import { getSiteForRequest } from '@/lib/server/site-view'
import { pageOrigin } from '@/lib/server/site-access'
import { ceremoniesForList, guestListFor } from '@/lib/invitation'
import { resolveContentMedia } from '@/lib/server/media/resolve'
import { getTheme, THEMES } from '@/themes/registry'
import { getTradition } from '@/traditions'
import SiteRenderer from './SiteRenderer'
import InviteRenderer from './invite/InviteRenderer'
import ThemeRoot from './ThemeRoot'
import PreviewBar from './PreviewBar'
import PasscodeGate from '@/components/PasscodeGate'

/**
 * Everything behind /{slug}, /{slug}/invite and /{slug}/memories.
 *   view 'auto'     — follows the phase: invitation → live → memories
 *   view 'invite'   — always the invitation
 *   view 'memories' — always the full site (once published, or for the couple)
 * listId: a guest list (/{slug}/i/{id}); the invitation then shows only that list's events.
 */
export default async function SitePage({ slug, query = {}, view = 'auto', listId = null }) {
  const found = await getSiteForRequest(slug)
  if (!found) notFound()
  const { site, status, viewer, guest, phase, canView, publicOnlyMedia } = found
  const products = site.products || ['site']

  if (view === 'invite' && !products.includes('invite') && !viewer.canPreview) notFound()
  if (view === 'memories') {
    if (!products.includes('site') && !viewer.canPreview) notFound()
    if (!site.memories_published && phase !== 'memories' && !viewer.canPreview) redirect(`/${site.slug}`)
  }

  const shown = view === 'invite' ? (phase === 'live' ? 'live' : 'invitation') : view === 'memories' ? 'memories' : phase
  const scope = shown === 'memories' ? 'site' : 'invite'

  // The couple and operators can preview another theme/palette with ?theme=&palette=
  const previewTheme = viewer.canPreview && typeof query.theme === 'string' && THEMES[query.theme] ? query.theme : null
  const previewPalette = viewer.canPreview && typeof query.palette === 'string' ? query.palette.slice(0, 64) : null
  const theme = getTheme(previewTheme || site.template_id)
  const paletteId = previewPalette || (previewTheme ? theme.palettes[0]?.id : site.theme_settings?.paletteId)

  if (!canView(scope)) {
    const { content } = await getSiteContent(site.id)
    return (
      <ThemeRoot theme={theme} sitePalette={site.palette} paletteId={paletteId}>
        <PasscodeGate slug={site.slug} coupleNames={content?.hero?.coupleNames} date={content?.hero?.date} />
      </ThemeRoot>
    )
  }

  const stored = await getSiteContent(site.id)
  // A deleted list's link falls back to the couple's main link
  const list = listId ? guestListFor(stored.invitation, listId) : null
  if (listId && !list) redirect(`/${site.slug}`)
  const content = await resolveContentMedia(site.id, stored, { publicOnly: publicOnlyMedia })
  const tradition = getTradition(site.wedding_type || content.content?.wedding_type, site.tradition_variant)

  const banner = viewer.canPreview ? (
    <PreviewBar
      siteId={site.id}
      slug={site.slug}
      status={status}
      isAdmin={viewer.isAdmin}
      themeId={theme.id}
      savedThemeId={getTheme(site.template_id).id}
      paletteId={paletteId}
      previewing={Boolean(previewTheme || previewPalette)}
      views={products.includes('invite') ? { current: shown === 'memories' ? 'memories' : 'invite', phase } : null}
    />
  ) : null

  const common = { site, content, theme, tradition, paletteId, viewerName: guest?.name || null, banner }

  if (shown === 'memories') return <SiteRenderer {...common} />

  const origin = await pageOrigin()
  const invite = list ? { ...common, content: { ...content, ceremonies: ceremoniesForList(content.ceremonies, list) } } : common
  return <InviteRenderer {...invite} mode={shown === 'live' ? 'live' : 'invite'} origin={origin} listId={list?.id || null} />
}
