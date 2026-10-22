'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Reveal from '@/site/primitives/Reveal'
import Photo from '@/site/primitives/Photo'
import { Bilingual, SacredText, splitNames } from '@/site/primitives/text'
import { Beats, Carousel, Details, Verse, hasDetails } from '@/site/sections/ceremony-parts'
import { LightStar } from '../ornaments'

/**
 * Noor — "light". A single airy column where words lead and photos are
 * optional, so it suits families who prefer not to show the bride's photos.
 */

// The tall arch the hero draws, in a 200x300 box
const NOOR_ARCH = 'M16,296 V118 C16,56 54,12 100,12 C146,12 184,56 184,118 V296'

/** A line-drawn arch that fills with light around the names. */
export function NoorHero({ names, date, invocation, media }) {
  const reduce = useReducedMotion()
  const [first, second] = splitNames(names?.en)
  return (
    <section id="home" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-t-bg px-5 pb-16 pt-24 text-t-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_oklab,var(--t-accent-warm)_22%,transparent),transparent_62%)]" />
      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <svg viewBox="0 0 200 300" aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-6 mx-auto h-[calc(100%+3rem)] w-full text-t-ornament">
          <motion.path
            d={NOOR_ARCH}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1] }}
          />
          <path d={NOOR_ARCH} transform="translate(100 150) scale(0.93) translate(-100 -150)" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="shb-glow pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--t-accent-warm)_45%,transparent),transparent_70%)] blur-2xl" />

        <div className="relative z-10 flex flex-col items-center px-8 py-12 md:px-16">
          <span className="text-t-ornament">
            <LightStar size={42} />
          </span>
          {invocation?.text && (
            <div className="mt-6">
              <SacredText text={invocation.text} lang={invocation.lang} className="text-2xl leading-[1.7] text-t-accent-strong md:text-3xl" />
              {invocation.sub && <p className="mt-2 text-[10px] uppercase tracking-[0.45em] text-t-ink-muted">{invocation.sub}</p>}
            </div>
          )}
          {media?.image && (
            <div className="relative mt-8 h-28 w-28 overflow-hidden rounded-full ring-1 ring-t-ornament ring-offset-4 ring-offset-t-bg md:h-36 md:w-36">
              <Photo src={media.image} position={media.position} alt={names?.en || ''} eager sizes="144px" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="t-display mt-10 text-6xl leading-[0.95] md:text-8xl"
          >
            <span className="block">{first}</span>
            {second && (
              <>
                <span className="my-3 block text-2xl italic text-t-accent md:text-3xl" aria-hidden="true">
                  &amp;
                </span>
                <span className="sr-only"> and </span>
                <span className="block">{second}</span>
              </>
            )}
          </motion.h1>
          {names?.bn && (
            <p lang="bn" className="mt-5 font-t-bn-display text-2xl text-t-accent-strong">
              {names.bn}
            </p>
          )}
          {(date?.en || date?.bn) && (
            <div className="mt-8 space-y-1">
              {date.en && <p className="text-xs uppercase tracking-[0.5em]">{date.en}</p>}
              {date.bn && (
                <p lang="bn" className="font-t-bn text-sm text-t-ink-muted">
                  {date.bn}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** Text-first timeline: big outlined years on a line of light; photos are small and optional. */
export function NoorStory({ title, milestones, copy }) {
  return (
    <div className="mx-auto max-w-2xl px-6">
      <header className="mb-20 text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.45em] text-t-accent">{copy['story.eyebrow'].en}</p>
        <Bilingual value={title} as="h2" enClassName="t-display text-5xl md:text-7xl" bnClassName="mt-3 font-t-bn-display text-2xl text-t-ink-muted" />
      </header>
      <ol className="relative space-y-24 border-l border-t-ornament/40 pl-8 md:pl-14">
        {milestones.map((m, i) => (
          <Reveal as="li" key={i} className="relative">
            <span className="absolute -left-[2.45rem] top-2 h-3 w-3 rounded-full bg-t-accent-warm shadow-[0_0_18px_6px_color-mix(in_oklab,var(--t-accent-warm)_45%,transparent)] md:-left-[3.95rem]" />
            {m.year && (
              <p className="t-display text-7xl leading-none text-transparent md:text-8xl" style={{ WebkitTextStroke: '1px var(--t-ornament)' }}>
                {m.year}
              </p>
            )}
            <div className="mt-4 flex items-start gap-5">
              <div className="min-w-0 flex-1">
                <Bilingual value={m.title} as="h3" enClassName="t-display text-3xl" bnClassName="mt-1 text-lg text-t-ink-muted" />
                <Bilingual value={m.story} className="mt-4 space-y-2 leading-relaxed" enClassName="text-lg text-t-ink/85" bnClassName="text-base text-t-ink-muted" />
              </div>
              {m.image && (
                <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-full sm:block">
                  <Photo src={m.image} position={m.position} alt="" sizes="96px" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}

/** The message as a large centred quote; the photo, if any, sits small above it. */
export function NoorSpotlight({ title, description, image, position, eyebrow }) {
  return (
    <section className="bg-t-bg-alt px-6 py-28 text-center md:py-36">
      <Reveal className="mx-auto max-w-3xl">
        {image && (
          <div className="relative mx-auto mb-10 aspect-[3/4] w-40 overflow-hidden md:w-48">
            <Photo src={image} position={position} alt={title?.en || ''} mask="dome" sizes="192px" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}
        <p className="text-[11px] uppercase tracking-[0.45em] text-t-accent">{eyebrow.en}</p>
        <Bilingual value={title} as="h2" className="mt-5" enClassName="t-display text-4xl md:text-6xl" bnClassName="mt-3 font-t-bn-display text-2xl text-t-accent-strong" />
        <Bilingual value={description} className="mx-auto mt-8 max-w-2xl space-y-4" enClassName="font-t-display text-2xl italic leading-relaxed md:text-3xl" bnClassName="text-lg text-t-ink-muted" />
      </Reveal>
    </section>
  )
}

/** One centred column per event under a small lantern arch; photos follow the words. */
export function NoorCeremony({ ceremony, copy, index }) {
  return (
    <section id={ceremony.id} className={index % 2 ? 'bg-t-bg-alt' : 'bg-t-bg'}>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <Reveal>
          <svg viewBox="0 0 60 80" aria-hidden="true" className="mx-auto h-16 w-12 text-t-ornament">
            <path d="M6,78 V34 C6,16 18,4 30,4 C42,4 54,16 54,34 V78 Z" fill="color-mix(in oklab, var(--t-accent-warm) 18%, transparent)" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="30" cy="44" r="5" fill="currentColor" className="shb-glow" />
          </svg>
          <p className="mt-6 text-[11px] uppercase tracking-[0.45em] text-t-accent">{String(index + 1).padStart(2, '0')}</p>
          <h2 className="t-display mt-3 text-5xl md:text-7xl">{ceremony.title?.en}</h2>
          {ceremony.title?.bn && (
            <p lang="bn" className="mt-3 font-t-bn-display text-2xl text-t-accent-strong">
              {ceremony.title.bn}
            </p>
          )}
          {ceremony.subtitle?.en && <p className="mt-4 text-sm uppercase tracking-[0.3em] text-t-ink-muted">{ceremony.subtitle.en}</p>}
          <Bilingual value={ceremony.description} className="mx-auto mt-8 max-w-2xl space-y-3 leading-relaxed" enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
          {hasDetails(ceremony) && (
            <div className="mx-auto mt-10 max-w-xl border-y border-t-ornament/40 py-8">
              <Details ceremony={ceremony} copy={copy} align="center" />
            </div>
          )}
        </Reveal>
        <Beats beats={ceremony.beats} copy={copy} />
        <Carousel photos={ceremony.carousel} title={ceremony.title?.en || ''} mask="dome" />
        <Verse verse={ceremony.verse} />
      </div>
    </section>
  )
}

/** Gallery: an even grid of dome-topped frames. */
export function NoorGallery({ items, onOpen }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-8">
      {items.map((item, i) => (
        <li key={item.id || item.src}>
          <button type="button" onClick={() => onOpen(i)} className="group relative block aspect-[3/4] w-full" aria-label={`Open photo ${i + 1}`}>
            <Photo src={item.src} thumb={item.thumb} alt={item.alt || ''} lqip={item.lqip} mask="dome" sizes="(min-width: 640px) 33vw, 50vw" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
          </button>
        </li>
      ))}
    </ul>
  )
}
