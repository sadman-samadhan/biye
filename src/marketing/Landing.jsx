import Link from 'next/link'
import { Check, MessageCircle } from 'lucide-react'
import Shell from './Shell'
import ThemeGallery from './ThemeGallery'
import { themeCards, traditionList } from './data'
import { MARKETING, MOODS, PRICES, whatsappUrl } from '@/i18n/marketing'

// The three phones in the hero, front one last
const HERO_PHONES = ['noor', 'patrika', 'laal-paar']

function Phone({ id, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-[2rem] border-[6px] border-sb-ink bg-sb-ink shadow-2xl ${className}`} style={{ aspectRatio: '390 / 844' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static theme screenshots */}
      <img src={`/themes/${id}/phone.jpg`} alt="" className="h-full w-full object-cover object-top" />
    </div>
  )
}

/** The marketing home page, in English or Bangla. */
export default function Landing({ locale = 'en' }) {
  const t = MARKETING[locale]
  const wa = whatsappUrl(locale)
  return (
    <Shell locale={locale}>
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(227,162,26,0.22),transparent_65%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-2 md:pb-28 md:pt-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sb-marigold-deep">{t.hero.eyebrow}</p>
              <h1 className={`mt-4 text-5xl font-semibold leading-[1.05] md:text-6xl ${locale === 'bn' ? 'font-bangla-body leading-tight' : 'font-display'}`}>{t.hero.title}</h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-sb-ink-soft">{t.hero.body}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#themes" className="rounded-xl bg-sb-ink px-6 py-3.5 font-medium text-sb-paper hover:bg-sb-ink-soft">
                  {t.hero.primary}
                </a>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-sb-line-strong bg-sb-card px-6 py-3.5 font-medium hover:border-sb-ink">
                  <MessageCircle size={17} /> {t.hero.secondary}
                </a>
              </div>
            </div>
            <div className="relative mx-auto h-[30rem] w-full max-w-md md:h-[34rem]">
              <Phone id={HERO_PHONES[0]} className="absolute left-0 top-10 w-[44%] -rotate-6" />
              <Phone id={HERO_PHONES[1]} className="absolute right-0 top-10 w-[44%] rotate-6" />
              <Phone id={HERO_PHONES[2]} className="absolute left-1/2 top-0 z-10 w-[50%] -translate-x-1/2" />
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-sb-line bg-sb-card">
          <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-2 px-5 py-5 text-sm text-sb-ink-soft">
            {t.trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={15} className="text-sb-sage" /> {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Theme gallery */}
        <section id="themes" className="scroll-mt-20 px-5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className={`text-4xl font-semibold md:text-5xl ${locale === 'bn' ? 'font-bangla-body' : 'font-display'}`}>{t.gallery.title}</h2>
            <p className="mt-3 max-w-2xl text-sb-ink-soft">{t.gallery.body}</p>
            <div className="mt-10">
              <ThemeGallery themes={themeCards()} traditions={traditionList()} moods={MOODS} labels={t.gallery} locale={locale} />
            </div>
          </div>
        </section>

        {/* One link that evolves */}
        <section className="bg-sb-ink px-5 py-20 text-sb-paper md:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className={`max-w-xl text-4xl font-semibold md:text-5xl ${locale === 'bn' ? 'font-bangla-body' : 'font-display'}`}>{t.evolve.title}</h2>
            <p className="mt-4 font-mono text-sm text-sb-holud">shubhobiye.com/your-names</p>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {t.evolve.steps.map((step, i) => (
                <li key={step.name} className="relative rounded-2xl border border-white/15 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-sb-holud">
                    {i + 1} · {step.when}
                  </p>
                  <h3 className={`mt-3 text-2xl font-semibold ${locale === 'bn' ? 'font-bangla-body' : 'font-display'}`}>{step.name}</h3>
                  <p className="mt-3 leading-relaxed text-sb-paper/80">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 px-5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className={`text-4xl font-semibold md:text-5xl ${locale === 'bn' ? 'font-bangla-body' : 'font-display'}`}>{t.how.title}</h2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {t.how.steps.map((step, i) => (
                <li key={step.name}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sb-marigold font-semibold text-white">{i + 1}</span>
                  <h3 className="mt-4 text-lg font-semibold">{step.name}</h3>
                  <p className="mt-2 text-sb-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-sb-line bg-sb-card px-5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className={`text-4xl font-semibold md:text-5xl ${locale === 'bn' ? 'font-bangla-body' : 'font-display'}`}>{t.features.title}</h2>
            <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {t.features.items.map((f) => (
                <li key={f.name} className="border-t-2 border-sb-marigold pt-4">
                  <h3 className="font-semibold">{f.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-sb-ink-soft">{f.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 px-5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className={`text-4xl font-semibold md:text-5xl ${locale === 'bn' ? 'font-bangla-body' : 'font-display'}`}>{t.pricing.title}</h2>
            <p className="mt-3 text-sb-ink-soft">{t.pricing.body}</p>
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {t.pricing.plans.map((plan) => (
                <li key={plan.id} className={`flex flex-col rounded-2xl border p-7 ${plan.featured ? 'border-sb-ink bg-sb-ink text-sb-paper shadow-xl md:-translate-y-3' : 'border-sb-line bg-sb-card'}`}>
                  <h3 className={`text-2xl font-semibold ${locale === 'bn' ? 'font-bangla-body' : 'font-display'}`}>{plan.name}</h3>
                  <p className={`mt-1 text-sm ${plan.featured ? 'text-sb-paper/75' : 'text-sb-muted'}`}>{plan.body}</p>
                  <p className="mt-6 text-4xl font-semibold">{PRICES[plan.id] || t.pricing.ask}</p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {plan.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check size={16} className={`mt-0.5 shrink-0 ${plan.featured ? 'text-sb-holud' : 'text-sb-sage'}`} /> {item}
                      </li>
                    ))}
                  </ul>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={`mt-8 rounded-xl px-5 py-3 text-center font-medium ${plan.featured ? 'bg-sb-marigold text-white hover:bg-sb-marigold-deep' : 'border border-sb-line-strong hover:border-sb-ink'}`}>
                    {t.pricing.cta}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-sb-line bg-sb-card px-5 py-20 md:py-28">
          <div className="mx-auto max-w-3xl">
            <h2 className={`text-4xl font-semibold md:text-5xl ${locale === 'bn' ? 'font-bangla-body' : 'font-display'}`}>{t.faq.title}</h2>
            <div className="mt-10 divide-y divide-sb-line border-y border-sb-line">
              {t.faq.items.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="text-xl text-sb-marigold transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-sb-ink-soft">{item.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/themes" className="font-medium text-sb-marigold-deep hover:underline">
                {t.nav.themes} →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Shell>
  )
}
