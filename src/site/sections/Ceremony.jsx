'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Reveal from '../primitives/Reveal'
import Photo from '../primitives/Photo'
import { Bilingual } from '../primitives/text'
import { ArchOutline } from '@/themes/ornaments'
import { THEME_VARIANTS } from '@/themes/variants'
import { Beats, Carousel, Details, Verse } from './ceremony-parts'

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

const LAYOUTS = { parallax: Parallax, iwan: Iwan, ...THEME_VARIANTS.ceremony }

export default function Ceremony({ variant, ...props }) {
  const Layout = LAYOUTS[variant] || Parallax
  return <Layout {...props} />
}
