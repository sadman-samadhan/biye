'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import Reveal from '../primitives/Reveal'
import Photo from '../primitives/Photo'
import { Bilingual, SacredText } from '../primitives/text'
import { ArchOutline } from '@/themes/ornaments'

function Details({ ceremony, copy, align = 'left' }) {
  const center = align === 'center'
  return (
    <div className={`grid gap-6 ${center ? 'text-center sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
      {(ceremony.when?.en || ceremony.when?.bn) && (
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.3em] text-t-accent">{copy['ceremonies.when'].en}</p>
          <Bilingual value={ceremony.when} enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
        </div>
      )}
      {(ceremony.venue?.en || ceremony.venue?.bn) && (
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.3em] text-t-accent">{copy['ceremonies.where'].en}</p>
          <Bilingual value={ceremony.venue} enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
          {ceremony.venue?.mapUrl && (
            <a
              href={ceremony.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-3 inline-flex items-center gap-2 rounded-full border border-t-accent/50 px-4 py-2 text-sm text-t-accent-strong transition hover:bg-t-accent hover:text-t-on-accent ${center ? 'mx-auto' : ''}`}
            >
              <MapPin size={15} /> {copy['ceremonies.map'].en}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function Beats({ beats, copy }) {
  if (!beats?.length) return null
  return (
    <div className="mt-14">
      <p className="mb-6 text-center text-[11px] uppercase tracking-[0.35em] text-t-ink-muted">{copy['ceremonies.moments'].en}</p>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {beats.map((beat, i) => (
          <li key={i} className="border-l border-t-accent/50 pl-4">
            {beat.label && <p className="text-[11px] uppercase tracking-[0.25em] text-t-accent">{beat.label}</p>}
            <Bilingual value={beat.title} as="h4" className="mt-1" enClassName="t-display text-xl" bnClassName="text-sm text-t-ink-muted" />
            <Bilingual value={beat.description} className="mt-2 space-y-1" enClassName="text-[15px] text-t-ink/80" bnClassName="text-sm text-t-ink-muted" />
          </li>
        ))}
      </ol>
    </div>
  )
}

function Carousel({ photos, title, mask }) {
  const [index, setIndex] = useState(0)
  const touch = useRef(null)
  if (!photos?.length) return null
  const go = (d) => setIndex((i) => (i + d + photos.length) % photos.length)
  const photo = photos[index]
  return (
    <div className="mt-14">
      <div
        className={`relative mx-auto overflow-hidden bg-t-bg-alt ${mask === 'arch' ? 'aspect-[3/4] max-w-md text-t-ornament' : 'aspect-[16/10] max-w-4xl rounded-[var(--t-radius)]'}`}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return
          const dx = e.changedTouches[0].clientX - touch.current
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
          touch.current = null
        }}
      >
        <Photo key={photo.src} src={photo.src} thumb={photo.thumb} alt={`${title} ${index + 1}`} position={photo.position} mask={mask} sizes="(min-width: 1024px) 56rem, 100vw" className="absolute inset-0 h-full w-full object-cover" />
        {mask === 'arch' && <ArchOutline />}
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-t-bg/80 p-2 text-t-ink shadow hover:bg-t-bg">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-t-bg/80 p-2 text-t-ink shadow hover:bg-t-bg">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Photos">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-t-accent' : 'w-3 bg-t-line'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Verse({ verse }) {
  if (!verse?.original && !verse?.meaning?.en) return null
  return (
    <div className="mx-auto mt-14 max-w-2xl text-center">
      {verse.original && <SacredText text={verse.original.text} lang={verse.original.lang} className="text-2xl leading-loose text-t-accent-strong" />}
      <Bilingual value={verse.meaning} className="mt-2 space-y-1" enClassName="font-t-display text-lg italic" bnClassName="text-sm text-t-ink-muted" />
    </div>
  )
}

/** Full-bleed parallax banner, then details (Cinematic). */
function Parallax({ ceremony, copy }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-8%', '8%'])
  return (
    <section id={ceremony.id} className="bg-t-bg">
      <div ref={ref} className="relative flex min-h-[70svh] items-center justify-center overflow-hidden bg-t-inverse text-t-on-inverse md:min-h-[85svh]">
        {ceremony.banner?.src && (
          <motion.div className="absolute inset-[-10%_0]" style={{ y }}>
            <Photo src={ceremony.banner.src} thumb={ceremony.banner.thumb} alt={ceremony.title?.en || ''} position={ceremony.banner.position} sizes="100vw" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-t-inverse/50 via-transparent to-t-inverse/70" />
        <Reveal className="relative z-10 max-w-4xl px-6 text-center">
          {ceremony.title?.bn && (
            <p lang="bn" className="mb-4 font-t-bn-display text-2xl text-t-on-inverse/90 md:text-3xl">
              {ceremony.title.bn}
            </p>
          )}
          <h2 className="t-display text-5xl tracking-tight md:text-7xl lg:text-8xl">{ceremony.title?.en}</h2>
          <div className="mx-auto mt-8 h-0.5 w-24 bg-t-accent-warm" />
          {ceremony.subtitle?.en && <p className="mt-6 text-sm uppercase tracking-[0.35em] text-t-on-inverse/80">{ceremony.subtitle.en}</p>}
        </Reveal>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <Reveal>
          <Details ceremony={ceremony} copy={copy} />
          <Bilingual value={ceremony.description} className="mt-10 space-y-3 leading-relaxed" enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
          {ceremony.culturalNote?.en && (
            <blockquote className="mt-8 border-l-2 border-t-accent pl-5 text-t-ink-muted">
              <Bilingual value={ceremony.culturalNote} className="space-y-2" enClassName="italic" bnClassName="text-sm" />
            </blockquote>
          )}
        </Reveal>
        <Beats beats={ceremony.beats} copy={copy} />
        <Carousel photos={ceremony.carousel} title={ceremony.title?.en || ''} />
        <Verse verse={ceremony.verse} />
      </div>
    </section>
  )
}

/** Arched card ("iwan") alternating left/right on a patterned ground (Jharokha). */
function Iwan({ ceremony, copy, index, mask }) {
  const flip = index % 2 === 1
  return (
    <section id={ceremony.id} className={index % 2 ? 'bg-t-bg-alt' : 'bg-t-bg'}>
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal className={`relative mx-auto aspect-[3/4] w-full max-w-sm text-t-ornament ${flip ? 'md:order-2' : ''}`}>
            {ceremony.banner?.src ? (
              <Photo src={ceremony.banner.src} thumb={ceremony.banner.thumb} alt={ceremony.title?.en || ''} position={ceremony.banner.position} mask={mask} sizes="(min-width: 768px) 40vw, 90vw" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-t-surface" style={{ clipPath: 'url(#shb-arch)' }} />
            )}
            <ArchOutline />
          </Reveal>
          <Reveal delay={0.1}>
            {ceremony.subtitle?.en && <p className="text-xs uppercase tracking-[0.35em] text-t-accent">{ceremony.subtitle.en}</p>}
            <h2 className="t-display mt-3 text-4xl md:text-5xl">{ceremony.title?.en}</h2>
            {ceremony.title?.bn && (
              <p lang="bn" className="mt-2 font-t-bn-display text-2xl text-t-accent-strong">
                {ceremony.title.bn}
              </p>
            )}
            <Bilingual value={ceremony.description} className="mt-6 space-y-3 leading-relaxed" enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
            <div className="mt-8 border-t border-t-ornament/40 pt-6">
              <Details ceremony={ceremony} copy={copy} />
            </div>
          </Reveal>
        </div>
        <Beats beats={ceremony.beats} copy={copy} />
        <Carousel photos={ceremony.carousel} title={ceremony.title?.en || ''} mask={mask} />
        <Verse verse={ceremony.verse} />
      </div>
    </section>
  )
}

export default function Ceremony({ variant, ...props }) {
  return variant === 'iwan' ? <Iwan {...props} /> : <Parallax {...props} />
}
