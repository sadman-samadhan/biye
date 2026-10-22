import Reveal from '../primitives/Reveal'
import { Bilingual, SacredText, meaningOf, originalOf, referenceOf } from '../primitives/text'
import { KhatamStar } from '@/themes/ornaments'

// How each blessings variant frames a verse
const CARD = {
  classic: 'text-center',
  panel: 'relative border border-t-ornament/50 bg-t-surface px-6 py-10 text-center md:px-12',
  glow: 'relative px-6 py-10 text-center before:pointer-events-none before:absolute before:inset-x-[15%] before:top-1/2 before:-z-0 before:h-40 before:-translate-y-1/2 before:rounded-full before:bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--t-accent-warm)_30%,transparent),transparent)] before:blur-2xl [&>*]:relative',
  stitched: 'relative bg-t-surface px-6 py-12 text-center outline-2 outline-dashed -outline-offset-[10px] outline-t-accent/50 md:px-12',
  pullquote: 'border-y-4 border-double border-t-ink px-2 py-10 text-left md:px-8',
}

function VerseCard({ verse, variant }) {
  const original = originalOf(verse)
  const reference = referenceOf(verse)
  const panel = variant === 'panel'
  return (
    <figure className={CARD[variant] || CARD.classic}>
      {panel && (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-t-bg px-3 text-t-ornament" aria-hidden="true">
          <KhatamStar size={22} />
        </span>
      )}
      {original && <SacredText text={original.text} lang={original.lang} className={`leading-loose text-t-accent-strong ${panel ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`} />}
      <Bilingual value={meaningOf(verse)} className="mt-5 space-y-2" enClassName={`font-t-display italic leading-relaxed ${variant === 'pullquote' ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}`} bnClassName="text-base text-t-ink-muted" />
      {reference && (
        <figcaption className="mt-4 text-xs uppercase tracking-[0.3em] text-t-accent">
          {reference.en}
          {reference.bn && (
            <span lang="bn" className="ml-2 font-t-bn normal-case tracking-normal">
              {reference.bn}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  )
}

export default function Blessings({ variant = 'classic', title, intro, duas = [], parentBlessings }) {
  const panel = variant !== 'classic'
  const hasParents = parentBlessings?.message?.en || parentBlessings?.message?.bn
  if (!duas.length && !hasParents) return null
  return (
    <section id="blessings" className={panel ? 'bg-t-bg py-24 md:py-32' : 'bg-t-bg-alt py-24 md:py-32'}>
      <div className="mx-auto max-w-4xl px-6">
        <Reveal as="header" className="mb-16 text-center">
          <Bilingual value={title} as="h2" enClassName="t-display text-4xl md:text-6xl" bnClassName="mt-2 font-t-bn-display text-2xl text-t-ink-muted" />
          {intro?.en && <p className="mt-4 text-t-ink-muted">{intro.en}</p>}
        </Reveal>

        <div className="space-y-16">
          {duas.map((verse, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <VerseCard verse={verse} variant={variant} />
            </Reveal>
          ))}
        </div>

        {hasParents && (
          <Reveal className={`mx-auto mt-20 max-w-2xl text-center ${panel ? '' : 'rounded-[var(--t-radius)] bg-t-surface px-6 py-12 md:px-12'}`}>
            <Bilingual value={parentBlessings.title} as="h3" enClassName="t-display text-2xl md:text-3xl" bnClassName="mt-1 text-lg text-t-ink-muted" />
            <Bilingual value={parentBlessings.message} className="mt-6 space-y-3 leading-relaxed" enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
            <Bilingual value={parentBlessings.attribution} className="mt-6 space-y-1 text-sm" enClassName="italic text-t-accent-strong" bnClassName="text-t-ink-muted" />
          </Reveal>
        )}
      </div>
    </section>
  )
}
