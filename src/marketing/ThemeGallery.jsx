'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

/**
 * Theme cards with tradition and mood filters. `themes` is plain data from the
 * server: { id, name, description, recommendedFor, mood, palettes, demoTradition }.
 */
export default function ThemeGallery({ themes, traditions, moods, labels, locale = 'en' }) {
  const [tradition, setTradition] = useState('all')
  const [mood, setMood] = useState('all')
  const usedMoods = useMemo(() => [...new Set(themes.flatMap((t) => t.mood))], [themes])
  const shown = themes.filter((t) => (tradition === 'all' || t.recommendedFor.includes(tradition)) && (mood === 'all' || t.mood.includes(mood)))
  const L = (v) => (v ? v[locale] || v.en : '')

  const chip = (active) => `shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${active ? 'border-sb-ink bg-sb-ink text-sb-paper' : 'border-sb-line-strong bg-sb-card hover:border-sb-ink'}`

  return (
    <div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label={labels.traditionLabel}>
          <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-sb-muted">{labels.traditionLabel}</span>
          {[['all', labels.all], ...traditions.map((t) => [t.id, L(t.label)])].map(([id, label]) => (
            <button key={id} type="button" aria-pressed={tradition === id} onClick={() => setTradition(id)} className={chip(tradition === id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label={labels.moodLabel}>
          <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-sb-muted">{labels.moodLabel}</span>
          {[['all', labels.all], ...usedMoods.map((m) => [m, L(moods[m]) || m])].map(([id, label]) => (
            <button key={id} type="button" aria-pressed={mood === id} onClick={() => setMood(id)} className={chip(mood === id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 && <p className="mt-10 text-sb-muted">{labels.empty}</p>}
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <li key={t.id} className="group overflow-hidden rounded-2xl border border-sb-line bg-sb-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <Link href={`/themes/${t.id}`} className="block">
              <div className="relative aspect-[16/10] overflow-hidden bg-sb-soft">
                {/* eslint-disable-next-line @next/next/no-img-element -- static cover screenshots */}
                <img src={`/themes/${t.id}/cover.jpg`} alt="" loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]" />
                <div className="absolute bottom-2 right-2 h-[58%] overflow-hidden rounded-lg border-2 border-sb-ink bg-sb-ink shadow-xl" style={{ aspectRatio: '390 / 844' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static phone screenshots */}
                  <img src={`/themes/${t.id}/phone.jpg`} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl font-semibold">{t.name.en}</h3>
                  <span lang="bn" className="font-bangla-body text-sb-muted">
                    {t.name.bn}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-sb-ink-soft">{L(t.description)}</p>
                <div className="mt-4 flex items-center gap-1">
                  {t.palettes.map((p) => (
                    <span key={p.id} title={p.name} className="flex overflow-hidden rounded-full ring-1 ring-sb-line">
                      {['bone', 'accent', 'warmAccent'].map((k) => (
                        <span key={k} className="h-4 w-2.5" style={{ background: p[k] }} />
                      ))}
                    </span>
                  ))}
                  <span className="ml-auto text-sm font-medium text-sb-marigold-deep">{labels.details} →</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
