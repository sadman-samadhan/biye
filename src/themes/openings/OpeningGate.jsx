'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SacredText, splitNames } from '@/site/primitives/text'
import { GirihPattern, KhatamStar } from '../ornaments'
import { AlponaBloom, ArchLight, CoverTurn, StitchUnfold } from './more'

/** Letterbox bars part around a title card (Cinematic). */
function FilmLeader({ names, onDone }) {
  const [first, second] = splitNames(names?.en)
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <>
      <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-t-inverse" exit={{ y: '-100%' }} transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }} />
      <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-t-inverse" exit={{ y: '100%' }} transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }} />
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-t-on-inverse"
        initial={{ opacity: 0, letterSpacing: '0.3em' }}
        animate={{ opacity: 1, letterSpacing: '0.02em' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        <p className="t-display text-4xl md:text-6xl">
          {first}
          {second && <span className="mx-3 italic text-t-accent-warm">&amp;</span>}
          {second}
        </p>
        {names?.bn && (
          <p lang="bn" className="mt-3 font-t-bn-display text-xl text-t-accent-warm">
            {names.bn}
          </p>
        )}
      </motion.div>
    </>
  )
}

/** Carved jali doors swing open after the invocation (Jharokha). */
function ArchDoors({ invocation, names, onDone }) {
  const [opening, setOpening] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => setOpening(true), 1500)
    const b = setTimeout(onDone, 3100)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [onDone])
  const door = 'absolute top-0 h-full w-1/2 overflow-hidden bg-t-accent-strong text-t-ornament border-t-ornament/70'
  return (
    <div className="absolute inset-0" style={{ perspective: '1600px' }}>
      <motion.div className={`${door} left-0 origin-left border-r`} animate={opening ? { rotateY: -100, opacity: 0.2 } : {}} transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1] }}>
        <GirihPattern id="door-l" opacity={0.35} />
      </motion.div>
      <motion.div className={`${door} right-0 origin-right border-l`} animate={opening ? { rotateY: 100, opacity: 0.2 } : {}} transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1] }}>
        <GirihPattern id="door-r" opacity={0.35} />
      </motion.div>
      <motion.div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center" animate={opening ? { opacity: 0, scale: 1.05 } : { opacity: 1 }} transition={{ duration: 0.6 }}>
        <span className="text-t-ornament">
          <KhatamStar size={40} />
        </span>
        {invocation?.text && <SacredText text={invocation.text} lang={invocation.lang} className="text-3xl text-t-bg md:text-4xl" />}
        <p className="t-display text-sm tracking-[0.4em] text-t-bg/85">{names?.en}</p>
      </motion.div>
    </div>
  )
}

const OPENINGS = { film: FilmLeader, 'arch-doors': ArchDoors, 'arch-light': ArchLight, alpona: AlponaBloom, stitch: StitchUnfold, cover: CoverTurn }

/**
 * Plays the theme's opening once per visit (per tab session). Always skippable,
 * and skipped entirely for visitors who prefer reduced motion.
 */
export default function OpeningGate({ kind, slug, names, invocation, skipLabel = 'Skip' }) {
  const reduce = useReducedMotion()
  const Opening = OPENINGS[kind]
  const [show, setShow] = useState(Boolean(Opening))
  const key = `shb-opening-${slug}`

  useEffect(() => {
    if (!Opening) return
    let seen = false
    try {
      seen = sessionStorage.getItem(key) === '1'
    } catch {
      // storage blocked: play it
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read session storage after mount
    if (seen || reduce) setShow(false)
  }, [Opening, key, reduce])

  useEffect(() => {
    if (!show) return
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [show])

  const done = () => {
    try {
      sessionStorage.setItem(key, '1')
    } catch {
      // ignore
    }
    setShow(false)
  }

  if (!Opening) return null
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="opening" className="fixed inset-0 z-[90]" exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
          <Opening names={names} invocation={invocation} onDone={done} />
          <button type="button" onClick={done} className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 z-10 rounded-full bg-t-inverse/70 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-t-on-inverse backdrop-blur hover:bg-t-inverse">
            {skipLabel}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
