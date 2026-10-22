import { getSiteContent } from '@/lib/server/site-data'
import { getSiteForRequest } from '@/lib/server/site-view'
import { loadMedia, signMedia } from '@/lib/server/media/resolve'
import { renderShareCard } from '@/lib/server/og-card'
import { mediaIdOf } from '@/lib/media-ref'
import { resolvePalette } from '@/lib/color'
import { formatEventDay } from '@/lib/dates'
import { headlineEvent } from '@/lib/invitation'
import { isAnchorCeremony } from '@/traditions'
import { getTheme } from '@/themes/registry'

/**
 * Link preview image. Chat apps fetch it without the guest's cookie, so it only
 * shows what is safe for anyone holding the link: names always; the date only
 * when the invitation is public; the cover photo only when the couple turned
 * that on and the photo itself is public.
 */
export async function GET(req, { params }) {
  const { slug } = await params
  const found = await getSiteForRequest(slug)
  if (!found) return new Response('Not found', { status: 404 })
  const { site, access, status } = found

  const { content, ceremonies, invitation } = await getSiteContent(site.id)
  const hero = content?.hero || {}
  const invitePublic = !access || access.invite_access === 'public' || !access.passcode_enc

  const main = headlineEvent(invitation, ceremonies, new Date(), isAnchorCeremony)
  const date = invitePublic ? (hero.date?.en || hero.date?.bn ? hero.date : formatEventDay(main?.startsAt)) : null

  let photo = null
  const coverId = mediaIdOf(invitation?.cover) || mediaIdOf(hero.posterPath)
  if (invitePublic && invitation?.shareCardPhoto && coverId) {
    const rows = await loadMedia(site.id, new Set([coverId]))
    const urls = await signMedia([...rows.values()], { publicOnly: true, variants: ['web'] })
    const signed = urls[coverId]?.web
    if (signed) {
      const res = await fetch(signed).catch(() => null)
      if (res?.ok) photo = Buffer.from(await res.arrayBuffer())
    }
  }

  const theme = getTheme(site.template_id)
  const roles = resolvePalette(theme, { sitePalette: site.palette, paletteId: site.theme_settings?.paletteId })
  const image = await renderShareCard({
    names: hero.coupleNames || { en: site.owner_name || '' },
    date,
    eyebrow: 'You are invited · সাদর আমন্ত্রণ',
    roles,
    photo,
  })

  return new Response(image, {
    headers: {
      'Content-Type': 'image/jpeg',
      // The URL carries the content version (?v=), so a changed card gets a new URL
      'Cache-Control': status === 'live' ? 'public, max-age=86400, immutable' : 'private, no-store',
    },
  })
}
