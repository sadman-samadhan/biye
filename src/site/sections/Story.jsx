import Reveal from '../primitives/Reveal'
import Photo from '../primitives/Photo'
import { Bilingual } from '../primitives/text'
import { ArchOutline } from '@/themes/ornaments'

/** Alternating photo/text rows (Cinematic). */
function Alternating({ title, milestones, copy }) {
  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12">
      <header className="mb-16 text-center md:mb-24">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-t-accent">{copy['story.eyebrow'].en}</p>
        <Bilingual value={title} as="h2" enClassName="t-display text-4xl md:text-6xl" bnClassName="mt-2 font-t-bn-display text-2xl text-t-ink-muted md:text-3xl" />
      </header>
      <ol className="space-y-24 md:space-y-32">
        {milestones.map((m, i) => (
          <li key={i} className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
            <Reveal className={`md:col-span-7 ${i % 2 ? 'md:order-2' : ''}`}>
              {m.image ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--t-radius)] bg-t-bg-alt md:aspect-[4/3]">
                  <Photo src={m.image} alt={m.title?.en || ''} position={m.position} sizes="(min-width: 768px) 58vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--t-radius)] bg-t-bg-alt t-display text-7xl text-t-line">{m.year}</div>
              )}
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-5">
              {m.year && <p className="t-display text-5xl text-t-accent md:text-6xl">{m.year}</p>}
              <Bilingual value={m.title} as="h3" className="mt-3" enClassName="t-display text-2xl md:text-3xl" bnClassName="mt-1 text-lg text-t-ink-muted" />
              <Bilingual value={m.story} className="mt-5 space-y-3 leading-relaxed" enClassName="text-[17px] text-t-ink/85" bnClassName="text-base text-t-ink-muted" />
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Centered timeline with arch/circle medallion photos (Jharokha). */
function Medallion({ title, milestones, copy, mask }) {
  return (
    <div className="mx-auto max-w-3xl px-6">
      <header className="mb-16 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-t-accent">{copy['story.eyebrow'].en}</p>
        <Bilingual value={title} as="h2" enClassName="t-display text-3xl md:text-5xl" bnClassName="mt-2 font-t-bn-display text-2xl text-t-accent-strong" />
      </header>
      <ol className="relative space-y-20 before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-t-ornament/40">
        {milestones.map((m, i) => (
          <li key={i} className="relative text-center">
            <Reveal className="relative mx-auto mb-6 aspect-[3/4] w-48 text-t-ornament md:w-56">
              {m.image ? (
                <Photo src={m.image} alt={m.title?.en || ''} position={m.position} mask={mask} sizes="224px" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-t-bg-alt" style={mask === 'arch' ? { clipPath: 'url(#shb-arch)' } : undefined} />
              )}
              {mask === 'arch' && <ArchOutline />}
            </Reveal>
            <Reveal delay={0.1} className="relative mx-auto max-w-lg bg-t-bg px-4">
              {m.year && <p className="t-display text-sm tracking-[0.4em] text-t-accent">{m.year}</p>}
              <Bilingual value={m.title} as="h3" className="mt-2" enClassName="t-display text-2xl" bnClassName="mt-1 text-lg text-t-ink-muted" />
              <Bilingual value={m.story} className="mt-4 space-y-2 leading-relaxed" enClassName="text-[17px]" bnClassName="text-base text-t-ink-muted" />
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Story({ variant, milestones = [], ...props }) {
  if (!milestones.length) return null
  return (
    <section id="story" className="bg-t-bg py-24 md:py-32">
      {variant === 'medallion' ? <Medallion milestones={milestones} {...props} /> : <Alternating milestones={milestones} {...props} />}
    </section>
  )
}
