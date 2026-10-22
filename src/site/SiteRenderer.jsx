import ThemeRoot from './ThemeRoot'
import Hero from './sections/Hero'
import Story from './sections/Story'
import Spotlight from './sections/Spotlight'
import Monogram from './sections/Monogram'
import Ceremony from './sections/Ceremony'
import Gallery from './sections/Gallery'
import Blessings from './sections/Blessings'
import Guestbook from './sections/Guestbook'
import Footer from './sections/Footer'
import Nav from './sections/Nav'
import ScrollTools from './sections/ScrollTools'
import { initialsOf } from './primitives/text'
import { coupleNames, has, invocationFor, photo, resolveCopy, verseFrom } from './compose'
import { Divider } from '@/themes/ornaments'
import OpeningGate from '@/themes/openings/OpeningGate'
import { ceremonyWhen } from '@/lib/dates'

/**
 * Server-side composition of a memories site: picks each section's variant
 * from the theme, wording from the tradition, and data from content (media
 * already resolved to signed URLs). Sections are plain-data props, so client
 * sections stay serializable.
 */
export default function SiteRenderer({ site, content, theme, tradition, paletteId, viewerName, banner }) {
  const copy = resolveCopy(tradition, content.content?.copy || {})

  const c = content.content || {}
  const hero = c.hero || {}
  const toggles = c.sectionToggles || {}
  const on = (key) => toggles[key] !== false
  const names = coupleNames(site, content)
  const invocation = invocationFor(hero, tradition)
  const mask = theme.shape.photoMask
  const v = theme.variants

  const ceremonies = (content.ceremonies || [])
    .filter((cer) => cer && cer.enabled !== false)
    .map((cer) => ({
      id: cer.id,
      title: cer.title,
      subtitle: cer.subtitle,
      description: cer.description,
      culturalNote: cer.culturalNote,
      when: ceremonyWhen(cer),
      venue: cer.venue,
      banner: photo(cer.heroImage, cer.heroImagePosition),
      carousel: (cer.carouselImages || [])
        .map((item) => (typeof item === 'string' ? { src: item } : { src: item?.url, position: item?.position }))
        .filter((p) => has(p.src)),
      beats: (cer.beats?.length ? cer.beats : cer.flow || []).map((b) => ({ label: b.label || b.beat, title: b.title, description: b.description })),
      verse: verseFrom(cer.dua || cer.blessing),
    }))

  const gallery = (content.gallery || [])
    .filter((g) => has(g.filename))
    .map((g) => ({ id: g.id, src: g.filename, thumb: g.thumbSrc, alt: g.alt, caption: g.caption?.en || g.caption, category: g.category || 'wedding', width: g.width, height: g.height, lqip: g.lqip }))
  const albums = [{ id: 'wedding', label: { en: 'Wedding', bn: 'বিয়ে' } }, ...(content.ceremonies || []).map((cer) => ({ id: cer.id, label: cer.title || { en: cer.id } }))]

  const milestones = (c.story?.milestones || []).map((m) => ({ year: m.year, title: m.title, story: m.story, image: has(m.imagePath) ? m.imagePath : null, position: m.imagePosition }))
  const duas = content.duas?.duas || []
  const firstEvent = (content.ceremonies || []).map((cer) => cer?.startsAt).filter(Boolean).sort()[0]
  const year = String(firstEvent || site.created_at || '').slice(0, 4)
  const verse = verseFrom(c.blessing || hero.blessing || tradition.defaultBlessing)

  const sections = {
    hero: () => (
      <Hero
        variant={v.hero}
        names={names}
        date={hero.date}
        invocation={invocation}
        media={{ image: has(hero.posterPath) ? hero.posterPath : null, video: hero.mediaType === 'video' && has(hero.videoPath) ? hero.videoPath : null, position: hero.posterPosition || '50% 50%' }}
        copy={copy}
      />
    ),
    story: () => on('story') && <Story variant={v.story} title={c.story?.title || copy['story.title']} milestones={milestones} copy={copy} mask={mask} />,
    spotlight: () =>
      on('spotlight') && c.brideReveal && (
        <Spotlight variant={v.spotlight} title={c.brideReveal.title} description={c.brideReveal.description} image={has(c.brideReveal.imagePath) ? c.brideReveal.imagePath : null} position={c.brideReveal.imagePosition} copy={copy} />
      ),
    monogram: () => on('monogram') && <Monogram variant={v.monogram} initials={initialsOf(names.en)} logo={has(c.logoUrl) ? c.logoUrl : null} topLabel={copy['monogram.topLabel']} verse={verse} />,
    ceremonies: () =>
      on('ceremonies') &&
      ceremonies.map((cer, i) => (
        <div key={cer.id}>
          {i > 0 && <Divider ornament={theme.ornament} />}
          <Ceremony variant={v.ceremony} ceremony={cer} copy={copy} index={i} mask={mask} />
        </div>
      )),
    gallery: () => on('gallery') && <Gallery variant={v.gallery} items={gallery} albums={albums} copy={copy} viewerName={viewerName} mask={mask} />,
    blessings: () => on('blessings') && <Blessings variant={v.blessings} title={copy['blessings.title']} intro={copy['blessings.intro']} duas={duas} parentBlessings={content.duas?.parentBlessings} />,
    guestbook: () => on('messages') && <Guestbook slug={site.slug} copy={copy} />,
  }

  const rendered = theme.order.map((key) => [key, sections[key]?.()]).filter(([, node]) => node && (!Array.isArray(node) || node.length))

  const navItems = [
    ...(on('story') && milestones.length ? [{ id: 'story', label: copy['nav.story'] }] : []),
    ...(on('ceremonies') ? ceremonies.map((cer) => ({ id: cer.id, label: cer.title || { en: cer.id } })) : []),
    ...(on('gallery') && gallery.length ? [{ id: 'gallery', label: copy['nav.gallery'] }] : []),
    ...(on('blessings') && (duas.length || content.duas?.parentBlessings?.message) ? [{ id: 'blessings', label: copy['nav.blessings'] }] : []),
    ...(on('messages') ? [{ id: 'guestbook', label: copy['nav.guestbook'] }] : []),
  ]

  return (
    <ThemeRoot theme={theme} sitePalette={site.palette} paletteId={paletteId}>
      <OpeningGate kind={theme.opening} slug={site.slug} names={names} invocation={invocation} skipLabel={copy['opening.skip'].en} />
      {banner}
      <Nav initials={initialsOf(names.en)} items={navItems} overDarkHero={v.hero === 'cinematic'} />
      <ScrollTools />
      <main>
        {rendered.map(([key, node], i) => (
          <div key={key}>
            {i > 0 && key !== 'spotlight' && rendered[i - 1][0] !== 'spotlight' && <Divider ornament={theme.ornament} />}
            {node}
          </div>
        ))}
      </main>
      <Footer names={names} thankYou={c.footer?.thankYou} photographer={c.footer?.photographer} contact={site.public_contact || {}} copy={copy} year={year} />
    </ThemeRoot>
  )
}
