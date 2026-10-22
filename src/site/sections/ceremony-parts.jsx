'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import Reveal from '../primitives/Reveal'
import Photo from '../primitives/Photo'
import { Bilingual, SacredText } from '../primitives/text'
import { MaskOutline } from '@/themes/ornaments'

/** Building blocks of a ceremony section, shared by every theme's ceremony layout. */

/** True when there is a date or a venue to show. */
export const hasDetails = (ceremony) => Boolean(ceremony.when?.en || ceremony.when?.bn || ceremony.venue?.en || ceremony.venue?.bn)

export function Details({ ceremony, copy, align = 'left' }) {
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

export function Beats({ beats, copy }) {
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

export function Carousel({ photos, title, mask }) {
  const [index, setIndex] = useState(0)
  const touch = useRef(null)
  if (!photos?.length) return null
  const go = (d) => setIndex((i) => (i + d + photos.length) % photos.length)
  const photo = photos[index]
  return (
    <div className="mt-14">
      <div
        className={`relative mx-auto overflow-hidden bg-t-bg-alt ${mask ? 'aspect-[3/4] max-w-md' : 'aspect-[16/10] max-w-4xl rounded-[var(--t-radius)]'}`}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return
          const dx = e.changedTouches[0].clientX - touch.current
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
          touch.current = null
        }}
      >
        <Photo key={photo.src} src={photo.src} thumb={photo.thumb} alt={`${title} ${index + 1}`} position={photo.position} mask={mask} sizes="(min-width: 1024px) 56rem, 100vw" className="absolute inset-0 h-full w-full object-cover" />
        {mask && <MaskOutline mask={mask} className="text-t-ornament" />}
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

export function Verse({ verse }) {
  if (!verse?.original && !verse?.meaning?.en) return null
  return (
    <div className="mx-auto mt-14 max-w-2xl text-center">
      {verse.original && <SacredText text={verse.original.text} lang={verse.original.lang} className="text-2xl leading-loose text-t-accent-strong" />}
      <Bilingual value={verse.meaning} className="mt-2 space-y-1" enClassName="font-t-display text-lg italic" bnClassName="text-sm text-t-ink-muted" />
    </div>
  )
}
