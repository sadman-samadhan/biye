'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import Photo from '../primitives/Photo'
import { SacredText, splitNames } from '../primitives/text'
import { ArchOutline, GirihPattern, KhatamStar } from '@/themes/ornaments'

function Invocation({ invocation, className = '', textClassName = '' }) {
  if (!invocation?.text) return null
  return (
    <div className={`flex flex-col gap-3 text-center ${className}`}>
      <SacredText text={invocation.text} lang={invocation.lang} className={`leading-[1.6] ${textClassName}`} />
      {invocation.sub && <p className="text-[10px] uppercase tracking-[0.4em] opacity-80 md:text-xs">{invocation.sub}</p>}
    </div>
  )
}

/** Full-screen film/photo with names revealed over it (Cinematic). */
function CinematicHero({ names, date, invocation, media, copy }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 25 })
  const mediaY = useTransform(smooth, [0, 1], ['0%', reduce ? '0%' : '18%'])
  const textOpacity = useTransform(smooth, [0, 0.45], [1, 0])
  const [first, second] = splitNames(names?.en)

  return (
    <section ref={ref} id="home" className="relative h-[100svh] overflow-hidden bg-t-inverse text-t-on-inverse">
      <motion.div className="absolute inset-0" style={{ y: mediaY, scale: 1.06 }}>
        {media.video ? (
          <video
            autoPlay={!reduce}
            muted
            loop
            playsInline
            preload="metadata"
            src={media.video}
            poster={media.image || undefined}
            data-media
            style={{ objectPosition: media.position }}
            className="absolute inset-0 h-full w-full object-cover brightness-[0.55] contrast-[1.08] saturate-[0.85]"
          />
        ) : media.image ? (
          <Photo src={media.image} alt={names?.en || ''} position={media.position} eager className="absolute inset-0 h-full w-full object-cover brightness-[0.55] contrast-[1.08] saturate-[0.85]" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,color-mix(in_oklab,var(--t-accent-strong)_45%,transparent),transparent_70%)]" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,color-mix(in_oklab,var(--t-inverse)_70%,transparent)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-t-inverse/40 via-transparent to-t-inverse" />
      </motion.div>

      <motion.div style={{ opacity: textOpacity }} className="relative z-10 flex h-full flex-col items-center justify-between px-4 py-24 md:py-28">
        <Invocation invocation={invocation} textClassName="text-2xl md:text-4xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]" />

        <div className="w-full text-center">
          <h1 className="flex flex-wrap items-center justify-center py-4 t-display">
            <motion.span
              initial={reduce ? false : { x: -40, opacity: 0, filter: 'blur(10px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-4xl tracking-tight md:text-6xl lg:text-7xl"
            >
              {first}
            </motion.span>
            {second && (
              <>
                <motion.span
                  initial={reduce ? false : { scale: 0, opacity: 0, rotate: -40 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.8, duration: 1.2, ease: 'backOut' }}
                  className="mx-4 text-4xl font-light italic text-t-accent-warm md:mx-8 md:text-6xl lg:text-7xl"
                  aria-hidden="true"
                >
                  &amp;
                </motion.span>
                <span className="sr-only"> and </span>
                <motion.span
                  initial={reduce ? false : { x: 40, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  className="text-4xl tracking-tight md:text-6xl lg:text-7xl"
                >
                  {second}
                </motion.span>
              </>
            )}
          </h1>
          {names?.bn && (
            <p lang="bn" className="font-t-bn-display text-2xl text-t-accent-warm md:text-3xl">
              {names.bn}
            </p>
          )}
          <div className="mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-t-accent-warm to-transparent opacity-60" />
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            {date?.en && <p className="text-[10px] uppercase tracking-[0.6em] md:text-xs">{date.en}</p>}
            {date?.bn && (
              <p lang="bn" className="mt-1 font-t-bn text-lg text-t-accent-warm md:text-xl">
                {date.bn}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-3" aria-hidden="true">
            <span className="text-[9px] uppercase tracking-[0.5em] opacity-60">{copy['hero.scroll'].en}</span>
            <span className="relative block h-14 w-px overflow-hidden bg-t-on-inverse/15">
              <motion.span
                animate={reduce ? undefined : { y: [-56, 56] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-b from-transparent via-t-accent-warm to-transparent"
              />
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/** Portrait framed in a Mughal arch on a girih lattice (Jharokha). */
function ArchHero({ names, date, invocation, media }) {
  const reduce = useReducedMotion()
  const [first, second] = splitNames(names?.en)
  return (
    <section id="home" className="relative overflow-hidden bg-t-bg px-5 pb-16 pt-24 text-t-ink md:pb-24 md:pt-28">
      <GirihPattern id="hero-girih" className="text-t-accent" opacity={0.07} />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row md:items-center md:justify-center md:gap-20">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[3/4] w-[min(78vw,22rem)] shrink-0 text-t-ornament md:w-[24rem]"
        >
          {media.image ? (
            <Photo src={media.image} alt={names?.en || ''} position={media.position} mask="arch" eager className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-t-bg-alt" style={{ clipPath: 'url(#shb-arch)' }} />
          )}
          <ArchOutline />
        </motion.div>

        <div className="max-w-md text-center md:text-left">
          <Invocation invocation={invocation} className="mb-8 text-t-accent-strong md:text-left" textClassName="text-3xl md:text-4xl" />
          <h1 className="t-display text-4xl leading-tight md:text-6xl">
            {first}
            {second && (
              <>
                <span className="my-2 flex items-center justify-center gap-3 text-t-ornament md:justify-start" aria-hidden="true">
                  <span className="h-px w-10 bg-current" />
                  <KhatamStar size={18} />
                  <span className="h-px w-10 bg-current" />
                </span>
                <span className="sr-only"> and </span>
                {second}
              </>
            )}
          </h1>
          {names?.bn && (
            <p lang="bn" className="mt-4 font-t-bn-display text-2xl text-t-accent-strong">
              {names.bn}
            </p>
          )}
          {(date?.en || date?.bn) && (
            <div className="mt-8 inline-block border-y border-t-ornament/60 px-6 py-3 md:pl-0">
              {date.en && <p className="text-sm uppercase tracking-[0.35em]">{date.en}</p>}
              {date.bn && (
                <p lang="bn" className="mt-0.5 font-t-bn text-base text-t-ink-muted">
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

export default function Hero({ variant, ...props }) {
  return variant === 'arch' ? <ArchHero {...props} /> : <CinematicHero {...props} />
}
