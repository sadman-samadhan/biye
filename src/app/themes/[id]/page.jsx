import Link from 'next/link'
import { notFound } from 'next/navigation'
import Shell from '@/marketing/Shell'
import { THEMES } from '@/themes/registry'
import { TRADITIONS } from '@/traditions'
import { DEMO_TRADITIONS } from '@/demo/packs'
import { MOODS, OPENINGS } from '@/i18n/marketing'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(THEMES).map((id) => ({ id }))
}

export async function generateMetadata({ params }) {
  const theme = THEMES[(await params).id]
  if (!theme) return {}
  return { title: `${theme.name.en} theme | ShubhoBiye`, description: theme.description.en }
}

/** One theme: screenshots, palettes, opening, and demos with every tradition's wording. */
export default async function ThemePage({ params }) {
  const theme = THEMES[(await params).id]
  if (!theme) notFound()
  const order = [...DEMO_TRADITIONS].sort((a, b) => Number(theme.recommendedFor.includes(b)) - Number(theme.recommendedFor.includes(a)))
  const first = order[0]

  return (
    <Shell locale="en">
      <main className="px-5 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Link href="/themes" className="text-sm text-sb-muted hover:text-sb-ink">
            ← All themes
          </Link>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_22rem]">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h1 className="font-display text-5xl font-semibold md:text-6xl">{theme.name.en}</h1>
                <span lang="bn" className="font-bangla-body text-2xl text-sb-muted">
                  {theme.name.bn}
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-lg text-sb-ink-soft">{theme.description.en}</p>
              <p lang="bn" className="mt-2 max-w-2xl font-bangla-body text-sb-muted">
                {theme.description.bn}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                {theme.mood.map((m) => (
                  <li key={m} className="rounded-full bg-sb-soft px-3 py-1">
                    {MOODS[m]?.en || m}
                  </li>
                ))}
              </ul>
              <div className="relative mt-10 overflow-hidden rounded-2xl border border-sb-line shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element -- static theme screenshot */}
                <img src={`/themes/${theme.id}/cover.jpg`} alt={`${theme.name.en} on a laptop`} className="w-full" />
              </div>
            </div>

            <aside className="space-y-8">
              <div className="mx-auto w-56 overflow-hidden rounded-[2rem] border-[6px] border-sb-ink bg-sb-ink shadow-2xl lg:w-full" style={{ aspectRatio: '390 / 844' }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static theme screenshot */}
                <img src={`/themes/${theme.id}/phone.jpg`} alt={`${theme.name.en} on a phone`} className="h-full w-full object-cover object-top" />
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">Opening</h2>
                <p className="mt-2">{OPENINGS[theme.opening]?.en}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">Palettes</h2>
                <ul className="mt-3 space-y-2">
                  {theme.palettes.map((p) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="flex overflow-hidden rounded-md ring-1 ring-sb-line">
                        {['bone', 'graphite', 'accent', 'deepAccent', 'warmAccent'].map((k) => (
                          <span key={k} className="h-7 w-5" style={{ background: p[k] }} />
                        ))}
                      </span>
                      <span className="text-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="block text-sb-muted">{p.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-sb-muted">Or colours taken from your own cover photo.</p>
              </div>
            </aside>
          </div>

          <section className="mt-16 rounded-2xl border border-sb-line bg-sb-card p-6 md:p-8">
            <h2 className="font-display text-3xl font-semibold">Try it with your tradition</h2>
            <p className="mt-2 text-sb-ink-soft">Every theme works with each tradition’s wording, ceremonies and verses. The demos use a fictional couple.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {order.map((id) => (
                <li key={id} className={`rounded-xl border p-4 ${id === first ? 'border-sb-ink' : 'border-sb-line'}`}>
                  <p className="font-medium">{TRADITIONS[id].label.en}</p>
                  <p lang="bn" className="font-bangla-body text-sm text-sb-muted">
                    {TRADITIONS[id].label.bn}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <Link href={`/demo/${theme.id}/${id}/invite`} className="rounded-lg bg-sb-ink px-3 py-1.5 text-sb-paper hover:bg-sb-ink-soft">
                      Invitation
                    </Link>
                    <Link href={`/demo/${theme.id}/${id}`} className="rounded-lg border border-sb-line-strong px-3 py-1.5 hover:border-sb-ink">
                      Full site
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </Shell>
  )
}
