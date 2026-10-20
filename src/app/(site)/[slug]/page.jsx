import { notFound } from 'next/navigation'
import { getSiteContent } from '@/lib/server/site-data'
import { getSiteForRequest } from '@/lib/server/site-view'
import { resolveContentMedia } from '@/lib/server/media/resolve'
import { getTheme, THEMES } from '@/themes/registry'
import { getTradition } from '@/traditions'
import SiteRenderer from '@/site/SiteRenderer'
import ThemeRoot from '@/site/ThemeRoot'
import PreviewBar from '@/site/PreviewBar'
import PasscodeGate from '@/components/PasscodeGate'

/**
 * /{slug} — one link for the whole celebration. What it shows depends on the
 * phase (invitation → live → memories) and on who is looking.
 */
export default async function WeddingSitePage({ params, searchParams }) {
  const { slug } = await params
  const query = await searchParams

  const found = await getSiteForRequest(slug)
  if (!found) notFound()
  const { site, status, viewer, guest, scope, canView, publicOnlyMedia } = found

  // The couple and operators can preview another theme/palette with ?theme=&palette=
  const previewTheme = viewer.canPreview && typeof query?.theme === 'string' && THEMES[query.theme] ? query.theme : null
  const previewPalette = viewer.canPreview && typeof query?.palette === 'string' ? query.palette.slice(0, 64) : null
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

  const content = await resolveContentMedia(site.id, await getSiteContent(site.id), { publicOnly: publicOnlyMedia })
  const tradition = getTradition(site.wedding_type || content.content?.wedding_type, site.tradition_variant)

  const banner =
    viewer.canPreview && (status !== 'live' || previewTheme || previewPalette) ? (
      <PreviewBar
        siteId={site.id}
        slug={site.slug}
        status={status}
        isAdmin={viewer.isAdmin}
        themeId={theme.id}
        savedThemeId={getTheme(site.template_id).id}
        paletteId={paletteId}
        previewing={Boolean(previewTheme || previewPalette)}
      />
    ) : null

  return (
    <SiteRenderer
      site={site}
      content={content}
      theme={theme}
      tradition={tradition}
      paletteId={paletteId}
      viewerName={guest?.name || null}
      banner={banner}
    />
  )
}
