import Reveal from '../primitives/Reveal'
import Photo from '../primitives/Photo'
import { Bilingual, Reference, SacredText } from '../primitives/text'
import { MonogramFrame } from '@/themes/ornaments'

/**
 * The couple's crest: an uploaded/generated monogram image, or initials drawn
 * in the theme's frame. Shows the tradition's label and the opening verse.
 */
const TALL = new Set(['arch', 'light'])

export default function Monogram({ variant = 'ring', initials = [], logo, topLabel, verse }) {
  const arch = TALL.has(variant)
  return (
    <section className="bg-t-bg px-6 py-24 text-center md:py-32">
      <Reveal className="mx-auto max-w-3xl">
        {topLabel?.en && <p className="mx-auto mb-10 max-w-md text-[11px] uppercase tracking-[0.35em] text-t-ink-muted">{topLabel.en}</p>}

        <div className={`relative mx-auto text-t-ornament ${arch ? 'aspect-[5/6] w-56 md:w-64' : 'aspect-square w-56 md:w-64'}`}>
          <MonogramFrame kind={variant} />
          <div className={`absolute inset-0 flex items-center justify-center ${arch ? 'pt-10' : ''}`}>
            {logo ? (
              <Photo src={logo} alt="Monogram" className="h-[72%] w-[72%] object-contain" />
            ) : (
              <p className="t-display flex items-center gap-2 text-6xl text-t-ink md:text-7xl" aria-label={initials.filter(Boolean).join(' and ')}>
                <span>{initials[0]}</span>
                {initials[1] && <span className="text-3xl text-t-accent">&amp;</span>}
                <span>{initials[1]}</span>
              </p>
            )}
          </div>
        </div>

        {verse && (
          <div className="mx-auto mt-12 max-w-2xl space-y-4">
            {verse.original && <SacredText text={verse.original.text} lang={verse.original.lang} className="text-2xl leading-loose text-t-accent-strong md:text-3xl" />}
            <Bilingual value={verse.meaning} className="space-y-2" enClassName="font-t-display text-xl italic md:text-2xl" bnClassName="text-base text-t-ink-muted" />
            {verse.reference && <Reference value={verse.reference} />}
          </div>
        )}
      </Reveal>
    </section>
  )
}
