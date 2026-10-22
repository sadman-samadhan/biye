'use client'

import { useEffect, useState } from 'react'
import { Bilingual } from '../primitives/text'
import { toBanglaDigits } from '@/lib/calendar'

const UNITS = [
  ['days', 86400],
  ['hours', 3600],
  ['minutes', 60],
  ['seconds', 1],
]

function parts(ms) {
  let rest = Math.max(0, Math.floor(ms / 1000))
  return UNITS.map(([key, size]) => {
    const value = Math.floor(rest / size)
    rest -= value * size
    return [key, value]
  })
}

/**
 * Time left until the event. Rendered on the client only (the server's clock
 * would never match the guest's), so it shows placeholders until mounted.
 */
export default function Countdown({ target, title, copy }) {
  const [now, setNow] = useState(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const end = new Date(target).getTime()
  if (Number.isNaN(end)) return null
  const left = now == null ? null : end - now
  // A day after it started there is nothing left to count
  if (left != null && left < -86400000) return null

  return (
    <section id="countdown" className="bg-t-inverse px-5 py-20 text-center text-t-on-inverse md:py-24">
      <p className="text-[11px] uppercase tracking-[0.4em] text-t-accent-warm">{copy['invite.countdown.title'].en}</p>
      <Bilingual value={title} className="mt-3" enClassName="t-display text-3xl md:text-4xl" bnClassName="mt-1 font-t-bn-display text-lg text-t-on-inverse/70" />
      {left != null && left <= 0 ? (
        <Bilingual value={copy['invite.today']} className="mt-10" enClassName="t-display text-5xl text-t-accent-warm" bnClassName="mt-1 font-t-bn text-xl text-t-on-inverse/70" />
      ) : (
        <ol className="mx-auto mt-10 grid max-w-xl grid-cols-4 gap-3 md:gap-6" aria-live="off">
          {(left == null ? UNITS.map(([key]) => [key, null]) : parts(left)).map(([key, value]) => (
            <li key={key} className="border border-t-on-inverse/15 py-4 md:py-6">
              <p className="t-display text-4xl tabular-nums md:text-6xl">{value == null ? '–' : String(value).padStart(2, '0')}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-t-on-inverse/70 md:text-xs">{copy[`invite.${key}`].en}</p>
              <p lang="bn" className="font-t-bn text-xs text-t-on-inverse/60">
                {value == null ? '' : toBanglaDigits(value)} {copy[`invite.${key}`].bn}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
