'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Reveal from '@/site/primitives/Reveal'
import Photo from '@/site/primitives/Photo'
import { Bilingual, SacredText, splitNames } from '@/site/primitives/text'
import { Beats, Carousel, Details, Verse, hasDetails } from '@/site/sections/ceremony-parts'
import { Alpona, MaskOutline, PaarBand } from '../ornaments'

/**
 * Laal Paar — the red-bordered white saree of Bengali weddings. The page wears
 * the border down both edges; alpona turns behind the names; portraits sit in
 * betel-leaf frames.
 */

/** The saree border down both edges of the page. */
export function PaarFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 left-0 right-0 z-40">
      <div className="absolute inset-y-0 left-0 flex w-2.5 md:w-7">
        <PaarBand id="paar-left" vertical className="h-full w-full" />
        <span className="w-[3px] shrink-0 bg-t-accent-warm" />
      </div>
      <div className="absolute inset-y-0 right-0 flex w-2.5 flex-row-reverse md:w-7">
        <PaarBand id="paar-right" vertical className="h-full w-full -scale-x-100" />
        <span className="w-[3px] shrink-0 bg-t-accent-warm" />
      </div>
    </div>
  )
}

/** Alpona turning slowly behind the names; the portrait in a betel leaf. */
export function AlponaHero({ names, date, invocation, media }) {
  const reduce = useReducedMotion()
  const [first, second] = splitNames(names?.en)
  return (
    <section id="home" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-t-bg px-6 pb-16 pt-24 text-t-ink">
      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[150vmin] -translate-x-1/2 -translate-y-1/2 text-t-accent opacity-[0.13] md:w-[115vmin]">
        <Alpona spin className="h-full w-full" />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center">
        {invocation?.text && (
          <div className="mb-8">
            <SacredText text={invocation.text} lang={invocation.lang} className="text-2xl leading-[1.7] text-t-accent md:text-3xl" />
            {invocation.sub && <p className="mt-1 text-[10px] uppercase tracking-[0.45em] text-t-ink-muted">{invocation.sub}</p>}
          </div>
        )}
        {media?.image && (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.9, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[5/6] w-52 text-t-accent md:w-64"
          >
            <Photo src={media.image} position={media.position} alt={names?.en || ''} mask="leaf" eager sizes="256px" className="absolute inset-0 h-full w-full object-cover" />
            <MaskOutline mask="leaf" />
          </motion.div>
        )}
        <h1 className="t-display mt-8 text-6xl leading-[0.95] text-t-accent-strong md:text-8xl">
          <span className="block md:inline">{first}</span>
          {second && (
            <>
              <span className="mx-3 block font-normal italic text-t-accent-warm md:inline" aria-hidden="true">
                &amp;
              </span>
              <span className="sr-only"> and </span>
              <span className="block md:inline">{second}</span>
            </>
          )}
        </h1>
        {names?.bn && (
          <p lang="bn" className="mt-4 font-t-bn-display text-3xl text-t-accent md:text-4xl">
            {names.bn}
          </p>
        )}
        {(date?.en || date?.bn) && (
          <div className="mt-8 inline-flex flex-col items-center gap-1 rounded-full border-2 border-t-accent px-8 py-3">
            {date.en && <p className="text-xs font-semibold uppercase tracking-[0.4em] text-t-accent">{date.en}</p>}
            {date.bn && (
              <p lang="bn" className="font-t-bn text-base">
                {date.bn}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

/** Leaf portraits zig-zag along a dotted thread with red petal numerals. */
export function PaanStory({ title, milestones, copy }) {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-16 text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.4em] text-t-accent">{copy['story.eyebrow'].en}</p>
        <Bilingual value={title} as="h2" enClassName="t-display text-5xl text-t-accent-strong md:text-7xl" bnClassName="mt-2 font-t-bn-display text-3xl text-t-accent" />
      </header>
      <ol className="relative space-y-16 before:absolute before:left-1/2 before:top-0 before:hidden before:h-full before:border-l-2 before:border-dotted before:border-t-accent/50 md:before:block">
        {milestones.map((m, i) => (
          <li key={i} className="relative grid items-center gap-6 md:grid-cols-2 md:gap-16">
            <span className="absolute left-1/2 top-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-t-accent font-t-display text-lg text-t-on-accent ring-4 ring-t-bg md:flex">
              {i + 1}
            </span>
            <Reveal className={`relative mx-auto aspect-[5/6] w-full max-w-[17rem] text-t-accent ${i % 2 ? 'md:order-2' : ''}`}>
              {m.image ? (
                <>
                  <Photo src={m.image} position={m.position} alt={m.title?.en || ''} mask="leaf" sizes="272px" className="absolute inset-0 h-full w-full object-cover" />
                  <MaskOutline mask="leaf" />
                </>
              ) : (
                <div className="absolute inset-0 bg-t-bg-alt" style={{ clipPath: 'url(#shb-leaf)' }} />
              )}
            </Reveal>
            <Reveal delay={0.1} className={i % 2 ? 'md:text-right' : ''}>
              {m.year && <p className="t-display text-5xl text-t-accent-warm">{m.year}</p>}
              <Bilingual value={m.title} as="h3" className="mt-2" enClassName="t-display text-3xl text-t-accent-strong" bnClassName="mt-1 text-lg text-t-ink-muted" />
              <Bilingual value={m.story} className="mt-4 space-y-2 leading-relaxed" enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** A wavy-edged red band (like a saree's pallu) with the message in white. */
export function ShankhaSpotlight({ title, description, image, position, eyebrow }) {
  const wave = 'M0,10 Q12.5,0 25,10 T50,10 T75,10 T100,10 V20 H0 Z'
  return (
    <section className="relative">
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true" className="block h-6 w-full text-t-accent md:h-10">
        <path d={wave} fill="currentColor" />
      </svg>
      <div className="relative overflow-hidden bg-t-accent text-t-on-accent">
        <div className="pointer-events-none absolute -right-24 -top-24 aspect-square w-[28rem] text-t-on-accent opacity-15">
          <Alpona className="h-full w-full" detail={2} />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-8 py-20 md:grid-cols-2">
          {image && (
            <Reveal className="relative mx-auto aspect-[5/6] w-full max-w-xs text-t-accent-warm">
              <Photo src={image} position={position} alt={title?.en || ''} mask="leaf" sizes="320px" className="absolute inset-0 h-full w-full object-cover" />
              <MaskOutline mask="leaf" />
            </Reveal>
          )}
          <Reveal delay={0.1} className={image ? '' : 'md:col-span-2 text-center'}>
            <p className="text-[11px] uppercase tracking-[0.4em] opacity-80">{eyebrow.en}</p>
            <Bilingual value={title} as="h2" className="mt-4" enClassName="t-display text-4xl leading-tight md:text-6xl" bnClassName="mt-3 font-t-bn-display text-3xl opacity-90" />
            <Bilingual value={description} className="mt-6 space-y-3 leading-relaxed" enClassName="text-lg opacity-90" bnClassName="text-base opacity-80" />
          </Reveal>
        </div>
      </div>
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true" className="block h-6 w-full rotate-180 text-t-accent md:h-10">
        <path d={wave} fill="currentColor" />
      </svg>
    </section>
  )
}

/** Each event as a card edged top and bottom with the saree border. */
export function PaarCeremony({ ceremony, copy, index }) {
  return (
    <section id={ceremony.id} className="bg-t-bg px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[var(--t-radius)] bg-t-surface shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--t-accent)_55%,transparent)]">
        <PaarBand id={`paar-top-${ceremony.id}`} className="block h-10 w-full" />
        <div className="h-[3px] bg-t-accent-warm" />
        {ceremony.banner?.src && (
          <div className="relative aspect-[16/8] overflow-hidden">
            <Photo src={ceremony.banner.src} thumb={ceremony.banner.thumb} position={ceremony.banner.position} alt={ceremony.title?.en || ''} sizes="(min-width: 1024px) 64rem, 100vw" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-t-surface via-transparent to-transparent" />
          </div>
        )}
        <div className="px-6 pb-14 pt-8 text-center md:px-14">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.45em] text-t-accent">{ceremony.subtitle?.en || String(index + 1).padStart(2, '0')}</p>
            {ceremony.title?.bn && (
              <p lang="bn" className="mt-4 font-t-bn-display text-4xl text-t-accent md:text-5xl">
                {ceremony.title.bn}
              </p>
            )}
            <h2 className="t-display mt-2 text-4xl text-t-accent-strong md:text-6xl">{ceremony.title?.en}</h2>
            <Bilingual value={ceremony.description} className="mx-auto mt-6 max-w-2xl space-y-3 leading-relaxed" enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
            {hasDetails(ceremony) && (
              <div className="mx-auto mt-10 max-w-2xl rounded-[var(--t-radius)] border-2 border-dashed border-t-accent/40 p-6">
                <Details ceremony={ceremony} copy={copy} align="center" />
              </div>
            )}
          </Reveal>
          <Beats beats={ceremony.beats} copy={copy} />
          <Carousel photos={ceremony.carousel} title={ceremony.title?.en || ''} mask="leaf" />
          <Verse verse={ceremony.verse} />
        </div>
        <div className="h-[3px] bg-t-accent-warm" />
        <PaarBand id={`paar-bottom-${ceremony.id}`} className="block h-10 w-full" />
      </div>
    </section>
  )
}

// Fixed tilts so the "photos on a table" look is the same on server and client
const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5]

/** Photos in red-edged prints, scattered slightly as if laid on a table. */
export function PaarGallery({ items, onOpen }) {
  return (
    <ul className="columns-2 gap-6 md:columns-3 md:gap-10">
      {items.map((item, i) => (
        <li key={item.id || item.src} className="mb-8 break-inside-avoid">
          <button
            type="button"
            onClick={() => onOpen(i)}
            style={{ transform: `rotate(${TILTS[i % TILTS.length]}deg)` }}
            className="block w-full border-[3px] border-t-accent bg-t-surface p-2 pb-8 shadow-xl transition duration-500 hover:z-10 hover:rotate-0 hover:scale-[1.03]"
            aria-label={`Open photo ${i + 1}`}
          >
            <Photo src={item.src} thumb={item.thumb} alt={item.alt || ''} lqip={item.lqip} width={item.width} height={item.height} sizes="(min-width: 768px) 33vw, 50vw" className="h-auto w-full" />
          </button>
        </li>
      ))}
    </ul>
  )
}
