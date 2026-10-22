import Reveal from '../primitives/Reveal'
import { Bilingual, SacredText, Reference, splitNames } from '../primitives/text'
import { Divider, GirihPattern, KhatamStar, LightStar, PaarBand, StitchFlower } from '@/themes/ornaments'

// The card each theme puts the invitation on
const FRAMES = {
  classic: '',
  arch: 'border border-t-ornament/60 bg-t-bg px-6 py-16 outline outline-1 outline-offset-[6px] outline-t-ornament/30 md:px-14',
  light: 'rounded-t-[999px] border border-b-0 border-t-ornament/50 bg-[radial-gradient(ellipse_at_50%_20%,color-mix(in_oklab,var(--t-accent-warm)_16%,transparent),transparent_65%)] px-6 pb-12 pt-28 md:px-14',
  paar: 'overflow-hidden rounded-[var(--t-radius)] bg-t-surface px-6 py-0 shadow-xl md:px-14',
  patch: 'bg-t-surface px-6 py-16 outline-2 outline-dashed -outline-offset-[12px] outline-t-accent/50 md:px-14',
  editorial: 'border-y-4 border-double border-t-ink py-14 text-left',
}

// The ornament pinned to the top edge of the card
const BADGE = {
  arch: <KhatamStar size={26} />,
  light: <LightStar size={40} />,
  patch: <StitchFlower size={36} />,
}

/**
 * The invitation itself: the wording, the couple's names, the date (with the
 * tradition's Hijri or Bangla-calendar line) and the verse.
 */
export default function InviteCard({ variant, ornament, eyebrow, wording, names, date, dateExtra, verse }) {
  const arch = variant === 'arch'
  const paar = variant === 'paar'
  const editorial = variant === 'editorial'
  const [first, second] = splitNames(names?.en)
  return (
    <section id="invitation" className="relative overflow-hidden bg-t-bg px-5 py-24 text-center md:py-32">
      {arch && <GirihPattern id="invite-girih" className="text-t-accent" opacity={0.05} />}
      <Reveal className={`relative mx-auto max-w-2xl ${FRAMES[variant] ?? ''} ${editorial ? 'md:max-w-4xl' : ''}`}>
        {BADGE[variant] && (
          <span className={`absolute left-1/2 -translate-x-1/2 bg-t-bg px-3 text-t-ornament ${variant === 'light' ? 'top-10 bg-transparent' : 'top-0 -translate-y-1/2'}`} aria-hidden="true">
            {BADGE[variant]}
          </span>
        )}
        {paar && <PaarBand id="invite-paar-top" className="-mx-6 mb-14 block h-10 w-[calc(100%+3rem)] md:-mx-14 md:w-[calc(100%+7rem)]" />}
        <Bilingual value={eyebrow} className="space-y-1" enClassName="text-[11px] uppercase tracking-[0.4em] text-t-accent" bnClassName="text-sm text-t-accent" />
        <Bilingual value={wording} className="mx-auto mt-8 max-w-xl space-y-3" enClassName="font-t-display text-xl italic leading-relaxed md:text-2xl" bnClassName="text-base leading-relaxed text-t-ink-muted" />

        <h2 className={`t-display mt-10 leading-tight ${editorial ? 'text-6xl md:text-8xl' : 'text-5xl md:text-7xl'}`}>
          <span className="block">{first}</span>
          {second && (
            <>
              <span className="my-2 block font-t-display text-3xl italic text-t-accent md:text-4xl" aria-hidden="true">
                &amp;
              </span>
              <span className="sr-only"> and </span>
              <span className="block">{second}</span>
            </>
          )}
        </h2>
        {names?.bn && (
          <p lang="bn" className="mt-4 font-t-bn-display text-2xl text-t-accent-strong">
            {names.bn}
          </p>
        )}

        {(date?.en || date?.bn) && (
          <div className="mx-auto mt-10 inline-block border-y border-t-ornament/60 px-8 py-4">
            {date.en && <p className="text-sm uppercase tracking-[0.35em]">{date.en}</p>}
            {date.bn && (
              <p lang="bn" className="mt-1 font-t-bn text-base text-t-ink-muted">
                {date.bn}
              </p>
            )}
            {dateExtra && (
              <p className="mt-2 text-xs text-t-ink-muted">
                {dateExtra.en}
                <span lang="bn" className="ml-2 font-t-bn">
                  {dateExtra.bn}
                </span>
              </p>
            )}
          </div>
        )}

        {verse && (
          <div className="mx-auto mt-14 max-w-xl space-y-3">
            <Divider ornament={ornament} className="mb-8" />
            {verse.original && <SacredText text={verse.original.text} lang={verse.original.lang} className="text-2xl leading-loose text-t-accent-strong md:text-3xl" />}
            <Bilingual value={verse.meaning} className="space-y-2" enClassName="font-t-display text-lg italic" bnClassName="text-sm text-t-ink-muted" />
            {verse.reference && <Reference value={verse.reference} />}
          </div>
        )}
        {paar && <PaarBand id="invite-paar-bottom" className="-mx-6 mt-14 block h-10 w-[calc(100%+3rem)] md:-mx-14 md:w-[calc(100%+7rem)]" />}
      </Reveal>
    </section>
  )
}
