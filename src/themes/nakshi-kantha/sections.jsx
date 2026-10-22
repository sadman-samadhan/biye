'use client'

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import Reveal from '@/site/primitives/Reveal'
import Photo from '@/site/primitives/Photo'
import { Bilingual, SacredText, splitNames } from '@/site/primitives/text'
import { Beats, Carousel, Details, Verse, hasDetails } from '@/site/sections/ceremony-parts'
import { StitchFlower, StitchLine } from '../ornaments'

/**
 * Nakshi Kantha — the embroidered quilt of Bengal. Pages are patchwork; a
 * running stitch sews its way down the page as guests scroll.
 */

// A dashed "stitched" edge just inside a patch
const stitched = 'outline-2 outline-dashed -outline-offset-[10px]'

/** The running stitch down the left edge, sewn as far as the guest has scrolled. */
export function ThreadFrame() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })
  return (
    <svg aria-hidden="true" viewBox="0 0 24 1000" preserveAspectRatio="none" className="pointer-events-none fixed left-2 top-0 z-40 hidden h-full w-6 text-t-accent-warm lg:block">
      <motion.path
        d="M12,0 C2,60 22,120 12,180 S2,300 12,360 S22,480 12,540 S2,660 12,720 S22,840 12,900 S2,980 12,1000"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="10 8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ pathLength: progress }}
      />
    </svg>
  )
}

/** Patchwork hero: names, photo, date and a stitched flower on separate patches. */
export function QuiltHero({ names, date, invocation, media }) {
  const reduce = useReducedMotion()
  const [first, second] = splitNames(names?.en)
  const patch = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 30, rotate: -2 },
    animate: { opacity: 1, y: 0, rotate: 0 },
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
  })
  return (
    <section id="home" className="bg-t-bg px-4 pb-10 pt-20 md:px-8 md:pt-24">
      <div className={`mx-auto grid max-w-6xl gap-3 md:min-h-[calc(100svh-8rem)] md:gap-4 ${media?.image ? 'md:grid-cols-4 md:grid-rows-3' : 'md:grid-cols-3 md:grid-rows-2'}`}>
        <motion.div {...patch(0)} className={`relative flex flex-col justify-center bg-t-accent p-8 text-t-on-accent outline-t-on-accent/40 md:p-12 ${stitched} ${media?.image ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2 md:row-span-2'}`}>
          {invocation?.text && <SacredText text={invocation.text} lang={invocation.lang} className="mb-4 text-xl leading-[1.7] opacity-90" />}
          <h1 className="t-display text-6xl leading-[0.9] md:text-8xl">
            <span className="block">{first}</span>
            {second && (
              <>
                <span className="block font-t-display text-3xl italic opacity-80 md:text-5xl" aria-hidden="true">
                  &amp;
                </span>
                <span className="sr-only"> and </span>
                <span className="block">{second}</span>
              </>
            )}
          </h1>
          {names?.bn && (
            <p lang="bn" className="mt-5 font-t-bn-display text-3xl">
              {names.bn}
            </p>
          )}
        </motion.div>
        {media?.image && (
          <motion.div {...patch(0.15)} className={`relative aspect-[4/5] overflow-hidden bg-t-bg-alt outline-t-bg/70 md:col-span-2 md:row-span-3 md:aspect-auto ${stitched}`}>
            <Photo src={media.image} position={media.position} alt={names?.en || ''} eager sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          </motion.div>
        )}
        <motion.div {...patch(0.3)} className={`relative flex flex-col items-center justify-center bg-t-accent-strong p-6 text-center text-t-bg outline-t-bg/40 ${stitched}`}>
          {date?.en && <p className="t-display text-xl leading-tight md:text-2xl">{date.en}</p>}
          {date?.bn && (
            <p lang="bn" className="mt-1 font-t-bn text-base">
              {date.bn}
            </p>
          )}
        </motion.div>
        <motion.div {...patch(0.45)} className={`relative flex items-center justify-center bg-t-bg-alt p-6 text-t-accent outline-t-accent/40 ${stitched}`}>
          <StitchFlower size={84} />
        </motion.div>
      </div>
    </section>
  )
}

/** Milestones as patches joined by a stitched thread that is sewn as you scroll. */
export function StitchStory({ title, milestones, copy }) {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-14 text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.4em] text-t-accent">{copy['story.eyebrow'].en}</p>
        <Bilingual value={title} as="h2" enClassName="t-display text-5xl md:text-7xl" bnClassName="mt-2 font-t-bn-display text-3xl text-t-accent" />
        <StitchLine className="mx-auto mt-6 h-3 w-40 text-t-accent-warm" />
      </header>
      <ol>
        {milestones.map((m, i) => {
          const right = i % 2 === 1
          return (
            <li key={i}>
              {i > 0 && (
                <svg viewBox="0 0 400 80" aria-hidden="true" className="mx-auto block h-16 w-full max-w-md text-t-accent-warm md:h-20">
                  <motion.path
                    d={right ? 'M80,0 C80,50 320,30 320,80' : 'M320,0 C320,50 80,30 80,80'}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                  />
                </svg>
              )}
              <Reveal className={`grid items-center gap-6 md:grid-cols-2 ${right ? 'md:[direction:rtl]' : ''}`}>
                {m.image ? (
                  <div className={`relative aspect-[4/3] [direction:ltr] ${right ? 'rotate-2' : '-rotate-2'}`}>
                    <Photo src={m.image} position={m.position} alt={m.title?.en || ''} mask="patch" sizes="(min-width: 768px) 45vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-t-bg-alt text-t-accent [direction:ltr]">
                    <StitchFlower size={72} />
                  </div>
                )}
                <div className={`relative bg-t-surface p-8 outline-t-accent/40 [direction:ltr] ${stitched}`}>
                  {m.year && <p className="t-display text-4xl text-t-accent">{m.year}</p>}
                  <Bilingual value={m.title} as="h3" className="mt-2" enClassName="t-display text-3xl" bnClassName="mt-1 text-lg text-t-ink-muted" />
                  <Bilingual value={m.story} className="mt-4 space-y-2 leading-relaxed" enClassName="text-[17px]" bnClassName="text-base text-t-ink-muted" />
                </div>
              </Reveal>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** One big patch with a smaller photo patch sewn onto its corner. */
export function PatchSpotlight({ title, description, image, position, eyebrow }) {
  return (
    <section className="bg-t-bg px-5 py-20 md:py-28">
      <Reveal className={`relative mx-auto max-w-5xl bg-t-accent px-8 py-14 text-t-on-accent outline-t-on-accent/40 md:px-16 md:py-20 ${stitched}`}>
        <div className={image ? 'md:max-w-[55%]' : 'text-center'}>
          <p className="text-[11px] uppercase tracking-[0.4em] opacity-80">{eyebrow.en}</p>
          <Bilingual value={title} as="h2" className="mt-4" enClassName="t-display text-4xl leading-tight md:text-6xl" bnClassName="mt-3 font-t-bn-display text-3xl opacity-90" />
          <Bilingual value={description} className="mt-6 space-y-3 leading-relaxed" enClassName="text-lg opacity-90" bnClassName="text-base opacity-80" />
        </div>
        {image && (
          <div className="relative mx-auto mt-10 aspect-[4/5] w-64 rotate-3 bg-t-surface p-3 shadow-2xl md:absolute md:-right-6 md:top-1/2 md:mt-0 md:w-80 md:-translate-y-1/2">
            <div className="relative h-full w-full">
              <Photo src={image} position={position} alt={title?.en || ''} mask="patch" sizes="320px" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        )}
      </Reveal>
    </section>
  )
}

// On the dark patch, every muted/accent text inside switches to light-on-accent
const ON_ACCENT =
  '[&_.text-t-accent]:text-t-on-accent [&_.text-t-accent-strong]:text-t-on-accent [&_.text-t-ink-muted]:text-t-on-accent/80 [&_.text-t-ink\\/80]:text-t-on-accent/90 [&_.border-t-accent\\/50]:border-t-on-accent/40 [&_.border-t-accent\\/50]:text-t-on-accent'

// Patch colours cycle through the palette
const PATCH_TONES = [
  'bg-t-surface text-t-ink outline-t-accent/40',
  'bg-t-bg-alt text-t-ink outline-t-accent-warm/60',
  `bg-t-accent text-t-on-accent outline-t-on-accent/40 ${ON_ACCENT}`,
]

/** Each event is its own quilt patch, colours taking turns. */
export function PatchCeremony({ ceremony, copy, index }) {
  const tone = PATCH_TONES[index % PATCH_TONES.length]
  const dark = index % PATCH_TONES.length === 2
  return (
    <section id={ceremony.id} className="bg-t-bg px-4 py-8 md:px-8 md:py-12">
      <div className={`relative mx-auto max-w-6xl px-6 py-14 md:px-14 md:py-20 ${tone} ${stitched}`}>
        <div className="grid items-center gap-10 md:grid-cols-5">
          {ceremony.banner?.src && (
            <Reveal className={`relative aspect-[4/5] md:col-span-2 ${index % 2 ? 'md:order-2 rotate-2' : '-rotate-2'}`}>
              <Photo src={ceremony.banner.src} thumb={ceremony.banner.thumb} position={ceremony.banner.position} alt={ceremony.title?.en || ''} mask="patch" sizes="(min-width: 768px) 40vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
            </Reveal>
          )}
          <Reveal delay={0.1} className={ceremony.banner?.src ? 'md:col-span-3' : 'md:col-span-5 text-center'}>
            <p className="t-display text-6xl leading-none opacity-30">{String(index + 1).padStart(2, '0')}</p>
            <h2 className="t-display mt-2 text-4xl md:text-6xl">{ceremony.title?.en}</h2>
            {ceremony.title?.bn && (
              <p lang="bn" className="mt-2 font-t-bn-display text-3xl opacity-90">
                {ceremony.title.bn}
              </p>
            )}
            <Bilingual value={ceremony.description} className="mt-6 space-y-3 leading-relaxed" enClassName="text-lg" bnClassName={`text-base ${dark ? 'opacity-80' : 'text-t-ink-muted'}`} />
            {hasDetails(ceremony) && <div className={`mt-8 border-t-2 border-dashed pt-6 ${dark ? 'border-t-on-accent/40' : 'border-t-accent/40'}`}>
              <Details ceremony={ceremony} copy={copy} />
            </div>}
          </Reveal>
        </div>
        <Beats beats={ceremony.beats} copy={copy} />
        <Carousel photos={ceremony.carousel} title={ceremony.title?.en || ''} mask="patch" />
        <Verse verse={ceremony.verse} />
      </div>
    </section>
  )
}

// Repeating patchwork rhythm: big square, tall, small, wide, small, tall
const QUILT_SPANS = ['col-span-2 row-span-2', 'row-span-2', '', 'col-span-2', '', 'row-span-2']

/** Gallery as a quilt of different-sized patches, each with a stitched edge. */
export function QuiltGallery({ items, onOpen }) {
  // The patchwork rhythm needs a handful of photos; fewer sit in an even row
  const spans = items.length >= 6 ? QUILT_SPANS : ['row-span-2']
  return (
    <ul className="grid grid-flow-dense auto-rows-[9rem] grid-cols-2 gap-3 md:auto-rows-[12rem] md:grid-cols-4 md:gap-4">
      {items.map((item, i) => (
        <li key={item.id || item.src} className={`relative ${spans[i % spans.length]}`}>
          <button type="button" onClick={() => onOpen(i)} className={`group absolute inset-0 overflow-hidden bg-t-bg-alt outline-t-bg/80 ${stitched}`} aria-label={`Open photo ${i + 1}`}>
            <Photo src={item.src} thumb={item.thumb} alt={item.alt || ''} lqip={item.lqip} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
          </button>
        </li>
      ))}
    </ul>
  )
}
