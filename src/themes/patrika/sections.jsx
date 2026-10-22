'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Reveal from '@/site/primitives/Reveal'
import Photo from '@/site/primitives/Photo'
import { Bilingual, SacredText, splitNames } from '@/site/primitives/text'
import { Beats, Carousel, Details, Verse, hasDetails } from '@/site/sections/ceremony-parts'

/**
 * Patrika — the wedding as a magazine issue: a cover with a masthead and
 * contents, feature spreads with drop caps and pull quotes.
 */

const pad = (n) => String(n).padStart(2, '0')

/** Folio running down the page edge, like a printed magazine. */
export function FolioFrame({ names }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.5em] text-t-ink-muted [writing-mode:vertical-rl]">
        {names?.en} · The Wedding Issue
      </p>
    </div>
  )
}

// A purely decorative barcode
const BARS = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1]

/** The cover: masthead, issue line, cover photo, contents and a price tag. */
export function CoverHero({ names, date, invocation, media, contents = [] }) {
  const reduce = useReducedMotion()
  const [first, second] = splitNames(names?.en)
  const photo = Boolean(media?.image)
  const ink = photo ? 'text-t-on-inverse' : 'text-t-ink'
  return (
    <section id="home" className={`relative flex min-h-[100svh] flex-col overflow-hidden ${photo ? 'bg-t-inverse' : 'bg-t-bg'} ${ink}`}>
      {photo && (
        <>
          <Photo src={media.image} position={media.position} alt={names?.en || ''} eager sizes="100vw" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-t-inverse/80 via-t-inverse/10 to-t-inverse/85" />
        </>
      )}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-8 pt-20 md:px-10 md:pt-24">
        <div className="flex items-center justify-between border-b border-current/40 pb-2 text-[10px] uppercase tracking-[0.35em] md:text-xs">
          <span>The Wedding Issue</span>
          <span className="hidden sm:inline">Vol. 1 · No. 1</span>
          <span>{date?.en}</span>
        </div>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="t-display mt-3 break-words text-[15vw] font-black uppercase leading-[0.85] tracking-tight md:text-[10.5vw]"
        >
          {/* Stacked on phones so long names never run off the cover */}
          <span className="block md:inline">{first}</span>
          {second && (
            <>
              <span className="mx-[0.06em] font-normal italic text-t-accent-warm normal-case">&amp;</span>
              <span className="sr-only"> and </span>
              <span className="block md:inline">{second}</span>
            </>
          )}
        </motion.h1>
        {names?.bn && (
          <p lang="bn" className="mt-3 font-t-bn-display text-2xl md:text-4xl">
            {names.bn}
          </p>
        )}

        <div className="mt-auto grid items-end gap-8 pt-12 md:grid-cols-3">
          {contents.length > 0 && (
            <nav aria-label="Contents" className={`max-w-xs ${photo ? 'bg-t-inverse/60 p-4 backdrop-blur-sm' : ''}`}>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-t-accent-warm">Inside</p>
              <ol className="space-y-1.5">
                {contents.slice(0, 6).map((item, i) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="group flex items-baseline gap-3 hover:underline">
                      <span className="t-display w-8 text-xl font-bold">{pad(i * 4 + 4)}</span>
                      <span className="text-sm uppercase tracking-[0.15em]">{item.label?.en}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="md:text-center">
            {invocation?.text && <SacredText text={invocation.text} lang={invocation.lang} className="text-xl leading-[1.7] opacity-90" />}
          </div>
          <div className="flex items-end justify-between gap-6 md:justify-end">
            <div className="flex h-24 w-24 rotate-12 flex-col items-center justify-center rounded-full bg-t-accent text-center text-t-on-accent shadow-xl">
              <span className="text-[9px] uppercase tracking-[0.2em]">Price</span>
              <span className="t-display text-sm italic leading-tight">your presence</span>
            </div>
            <svg viewBox="0 0 60 30" aria-hidden="true" className="h-10 w-20 bg-white p-1 text-black">
              {BARS.reduce(
                (acc, w, i) => {
                  if (i % 2 === 0) acc.nodes.push(<rect key={i} x={acc.x} y="0" width={w} height="30" fill="currentColor" />)
                  acc.x += w
                  return acc
                },
                { x: 1, nodes: [] }
              ).nodes}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Feature spread: photos with figure captions, drop caps, a pull quote every other story. */
export function FeatureStory({ title, milestones, copy }) {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <header className="mb-14 border-b-4 border-double border-t-ink pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-t-accent">{copy['story.eyebrow'].en} · Feature</p>
        <Bilingual value={title} as="h2" className="mt-3" enClassName="t-display text-6xl leading-none md:text-8xl" bnClassName="mt-3 font-t-bn-display text-3xl text-t-ink-muted" />
      </header>
      <div className="space-y-20">
        {milestones.map((m, i) => (
          <article key={i} className="grid gap-8 md:grid-cols-12">
            {m.image && (
              <Reveal as="figure" className={`md:col-span-7 ${i % 2 ? 'md:order-2' : ''}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-t-bg-alt">
                  <Photo src={m.image} position={m.position} alt={m.title?.en || ''} sizes="(min-width: 768px) 58vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <figcaption className="mt-2 border-t border-t-ink pt-2 text-xs uppercase tracking-[0.2em] text-t-ink-muted">
                  Fig. {i + 1} — {m.year} · {m.title?.en}
                </figcaption>
              </Reveal>
            )}
            <Reveal delay={0.1} className={m.image ? 'md:col-span-5' : 'md:col-span-8 md:col-start-3'}>
              {m.year && <p className="t-display text-sm font-bold uppercase tracking-[0.3em] text-t-accent">{m.year}</p>}
              <Bilingual value={m.title} as="h3" className="mt-2" enClassName="t-display text-4xl leading-tight" bnClassName="mt-1 text-lg text-t-ink-muted" />
              <Bilingual value={m.story} className="mt-5 space-y-3 leading-relaxed" enClassName="t-dropcap text-lg" bnClassName="text-base text-t-ink-muted" />
              {i % 2 === 1 && m.title?.en && (
                <blockquote className="mt-8 border-y-2 border-t-accent py-5">
                  <p className="t-display text-3xl italic leading-snug text-t-accent">“{m.title.en}”</p>
                </blockquote>
              )}
            </Reveal>
          </article>
        ))}
      </div>
    </div>
  )
}

/** A full-width pull quote with the photo bleeding off one side. */
export function PullquoteSpotlight({ title, description, image, position, eyebrow }) {
  return (
    <section className="overflow-hidden bg-t-inverse text-t-on-inverse">
      <div className="mx-auto grid max-w-7xl md:grid-cols-2">
        <Reveal className="px-6 py-20 md:px-12 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-t-accent-warm">{eyebrow.en}</p>
          <p className="t-display mt-6 text-[7rem] leading-[0.5] text-t-accent-warm" aria-hidden="true">
            “
          </p>
          <Bilingual value={title} as="h2" enClassName="t-display text-5xl italic leading-tight md:text-6xl" bnClassName="mt-3 font-t-bn-display text-3xl text-t-on-inverse/80" />
          <Bilingual value={description} className="mt-8 max-w-lg space-y-3 border-l-2 border-t-accent-warm pl-5 leading-relaxed" enClassName="text-lg text-t-on-inverse/85" bnClassName="text-base text-t-on-inverse/70" />
        </Reveal>
        {image && (
          <div className="relative min-h-[60vh]">
            <Photo src={image} position={position} alt={title?.en || ''} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  )
}

/** Each event as a chapter: giant numeral, captioned photo, drop-cap text and a fact box. */
export function ChapterCeremony({ ceremony, copy, index }) {
  return (
    <section id={ceremony.id} className="bg-t-bg">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal className="flex items-end gap-6 border-b-4 border-double border-t-ink pb-4">
          <span className="t-display text-8xl font-black leading-[0.75] text-t-accent md:text-[10rem]">{pad(index + 1)}</span>
          <div className="min-w-0 pb-1">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-t-ink-muted">Chapter {index + 1}</p>
            <h2 className="t-display text-4xl leading-none md:text-7xl">{ceremony.title?.en}</h2>
          </div>
        </Reveal>
        {ceremony.title?.bn && (
          <p lang="bn" className="mt-4 font-t-bn-display text-3xl text-t-accent">
            {ceremony.title.bn}
          </p>
        )}
        <div className="mt-10 grid gap-10 md:grid-cols-12">
          {ceremony.banner?.src && (
            <Reveal as="figure" className={`md:col-span-7 ${index % 2 ? 'md:order-2' : ''}`}>
              <div className="relative aspect-[4/5] overflow-hidden bg-t-bg-alt md:aspect-[4/3]">
                <Photo src={ceremony.banner.src} thumb={ceremony.banner.thumb} position={ceremony.banner.position} alt={ceremony.title?.en || ''} sizes="(min-width: 768px) 58vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              {ceremony.subtitle?.en && <figcaption className="mt-2 border-t border-t-ink pt-2 text-xs uppercase tracking-[0.2em] text-t-ink-muted">{ceremony.subtitle.en}</figcaption>}
            </Reveal>
          )}
          <Reveal delay={0.1} className={ceremony.banner?.src ? 'md:col-span-5' : 'md:col-span-12'}>
            <Bilingual value={ceremony.description} className="space-y-3 leading-relaxed" enClassName="t-dropcap text-lg" bnClassName="text-base text-t-ink-muted" />
            {hasDetails(ceremony) && (
              <aside className="mt-8 border-2 border-t-ink p-5">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em] text-t-accent">The facts</p>
                <Details ceremony={ceremony} copy={copy} />
              </aside>
            )}
          </Reveal>
        </div>
        <Beats beats={ceremony.beats} copy={copy} />
        <Carousel photos={ceremony.carousel} title={ceremony.title?.en || ''} />
        <Verse verse={ceremony.verse} />
      </div>
    </section>
  )
}

// Spread rhythm: a big lead photo, two small, then two halves
const SPREAD_SPANS = ['col-span-6 md:col-span-4 row-span-2', 'col-span-3 md:col-span-2', 'col-span-3 md:col-span-2', 'col-span-6 md:col-span-3', 'col-span-6 md:col-span-3']

/** Gallery as magazine spreads with figure numbers. */
export function SpreadGallery({ items, onOpen }) {
  return (
    <ul className="grid auto-rows-[11rem] grid-cols-6 gap-4 md:auto-rows-[14rem] md:gap-6">
      {items.map((item, i) => (
        <li key={item.id || item.src} className={`relative flex flex-col ${SPREAD_SPANS[i % SPREAD_SPANS.length]}`}>
          <button type="button" onClick={() => onOpen(i)} className="group relative min-h-0 flex-1 overflow-hidden bg-t-bg-alt" aria-label={`Open photo ${i + 1}`}>
            <Photo src={item.src} thumb={item.thumb} alt={item.alt || ''} lqip={item.lqip} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
          </button>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.25em] text-t-ink-muted">Fig. {i + 1}</p>
        </li>
      ))}
    </ul>
  )
}
