'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SacredText, splitNames } from '@/site/primitives/text'
import { Alpona, LightStar, StitchFlower } from '../ornaments'

function useTimeline(steps, onDone) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timers = steps.map((at, i) => setTimeout(() => (i === steps.length - 1 ? onDone() : setStep(i + 1)), at))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once
  }, [])
  return step
}

const ARCH = 'M16,296 V118 C16,56 54,12 100,12 C146,12 184,56 184,118 V296'

/** Noor: an arch is drawn in light, fills with a glow, and you pass through it. */
export function ArchLight({ invocation, onDone }) {
  const step = useTimeline([1700, 2700, 3400], onDone)
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-t-bg">
      <motion.div className="relative h-[70vh] w-[min(70vw,46vh)]" animate={step >= 2 ? { scale: 6, opacity: 0 } : {}} transition={{ duration: 0.9, ease: [0.7, 0, 0.84, 0] }}>
        <motion.div
          className="absolute inset-0 rounded-t-full bg-[radial-gradient(ellipse_at_50%_45%,color-mix(in_oklab,var(--t-accent-warm)_55%,transparent),transparent_70%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
          transition={{ duration: 1 }}
        />
        <svg viewBox="0 0 200 300" className="absolute inset-0 h-full w-full text-t-ornament" aria-hidden="true">
          <motion.path d={ARCH} fill="none" stroke="currentColor" strokeWidth="1.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }} />
        </svg>
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center" initial={{ opacity: 0 }} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={{ duration: 0.8 }}>
          <span className="text-t-ornament">
            <LightStar size={44} />
          </span>
          {invocation?.text && <SacredText text={invocation.text} lang={invocation.lang} className="px-4 text-2xl leading-[1.7] text-t-accent-strong md:text-3xl" />}
        </motion.div>
      </motion.div>
    </div>
  )
}

/** Laal Paar: white alpona draws itself on red, then blooms open. */
export function AlponaBloom({ invocation, names, onDone }) {
  const step = useTimeline([2600, 3400], onDone)
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-t-accent text-t-on-accent">
      <motion.div className="aspect-square w-[min(90vw,80vh)]" animate={step >= 1 ? { scale: 3, rotate: 45, opacity: 0 } : {}} transition={{ duration: 0.8, ease: 'easeIn' }}>
        <Alpona draw className="h-full w-full" />
      </motion.div>
      <motion.div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" animate={step >= 1 ? { opacity: 0 } : {}}>
        {invocation?.text && <SacredText text={invocation.text} lang={invocation.lang} className="text-2xl leading-[1.7] md:text-3xl" />}
        <motion.p className="t-display mt-3 text-sm uppercase tracking-[0.4em]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          {names?.en}
        </motion.p>
      </motion.div>
    </div>
  )
}

/** Nakshi Kantha: a stitch traces around the names, then the quilt's patches fly apart. */
export function StitchUnfold({ names, onDone }) {
  const step = useTimeline([2200, 3200], onDone)
  const [first, second] = splitNames(names?.en)
  const patches = ['bg-t-accent', 'bg-t-accent-warm', 'bg-t-accent-strong', 'bg-t-bg-alt']
  const away = [
    { x: '-60vw', y: '-60vh', rotate: -20 },
    { x: '60vw', y: '-60vh', rotate: 18 },
    { x: '-60vw', y: '60vh', rotate: 14 },
    { x: '60vw', y: '60vh', rotate: -16 },
  ]
  return (
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
      {patches.map((bg, i) => (
        <motion.div key={i} className={`${bg} outline-2 outline-dashed -outline-offset-[12px] outline-t-bg/50`} animate={step >= 1 ? away[i] : {}} transition={{ duration: 0.9, ease: [0.7, 0, 0.84, 0] }} />
      ))}
      <motion.div className="absolute inset-0 flex items-center justify-center" animate={step >= 1 ? { opacity: 0, scale: 0.9 } : {}} transition={{ duration: 0.5 }}>
        <div className="relative bg-t-bg px-10 py-8 text-center text-t-ink md:px-16 md:py-12">
          <svg className="pointer-events-none absolute inset-0 h-full w-full text-t-accent" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
            <motion.rect x="3" y="3" width="94" height="94" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
          </svg>
          <span className="mx-auto mb-3 block w-fit text-t-accent-warm">
            <StitchFlower size={44} />
          </span>
          <p className="t-display text-4xl md:text-6xl">
            {first}
            {second && <span className="mx-2 italic text-t-accent">&amp;</span>}
            {second}
          </p>
          {names?.bn && (
            <p lang="bn" className="mt-2 font-t-bn-display text-2xl text-t-accent">
              {names.bn}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/** Patrika: the front cover, which then turns like a page. */
export function CoverTurn({ names, onDone }) {
  const step = useTimeline([1900, 3100], onDone)
  const [first, second] = splitNames(names?.en)
  return (
    <div className="absolute inset-0" style={{ perspective: '2200px' }}>
      <motion.div
        className="absolute inset-0 flex origin-left flex-col justify-between bg-t-ink p-6 text-t-bg shadow-2xl md:p-12"
        animate={step >= 1 ? { rotateY: -105 } : {}}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className="flex justify-between border-b border-t-bg/40 pb-2 text-[10px] uppercase tracking-[0.35em] md:text-xs">
          <span>The Wedding Issue</span>
          <span>Vol. 1 · No. 1</span>
        </div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="t-display text-[18vw] font-black uppercase leading-[0.82] md:text-[11vw]">
          {first}
          {second && <span className="mx-[0.05em] font-normal italic normal-case text-t-accent-warm">&amp;</span>}
          {second}
        </motion.p>
        <p className="text-[10px] uppercase tracking-[0.35em] md:text-xs">Turn the page →</p>
      </motion.div>
    </div>
  )
}
