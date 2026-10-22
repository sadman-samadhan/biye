import Reveal from '../primitives/Reveal'
import Photo from '../primitives/Photo'
import { Bilingual } from '../primitives/text'
import { ArchOutline } from '@/themes/ornaments'
import { THEME_VARIANTS } from '@/themes/variants'

/** Dark full-bleed band with a large photo (Cinematic). */
function Band({ title, description, image, position, eyebrow }) {
  return (
    <section className="relative overflow-hidden bg-t-inverse text-t-on-inverse">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-24 md:grid-cols-12 md:gap-16 md:px-12 md:py-32">
        <Reveal className="md:col-span-5">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-t-accent-warm">{eyebrow.en}</p>
          <Bilingual value={title} as="h2" enClassName="t-display text-4xl leading-tight md:text-6xl" bnClassName="mt-3 font-t-bn-display text-2xl text-t-accent-warm md:text-3xl" />
          <Bilingual value={description} className="mt-8 space-y-4 leading-relaxed" enClassName="text-lg text-t-on-inverse/80" bnClassName="text-base text-t-on-inverse/65" />
        </Reveal>
        {image && (
          <Reveal delay={0.1} className="relative aspect-[4/5] overflow-hidden rounded-[var(--t-radius)] md:col-span-7 md:aspect-[16/11]">
            <Photo src={image} alt={title?.en || ''} position={position} sizes="(min-width: 768px) 58vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          </Reveal>
        )}
      </div>
    </section>
  )
}

/** Arch-framed photo beside the message on a soft ground (Jharokha). */
function ArchSplit({ title, description, image, position, eyebrow }) {
  return (
    <section className="bg-t-bg-alt">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-28">
        {image && (
          <Reveal className="relative mx-auto aspect-[3/4] w-full max-w-sm text-t-ornament">
            <Photo src={image} alt={title?.en || ''} position={position} mask="arch" sizes="(min-width: 768px) 40vw, 90vw" className="absolute inset-0 h-full w-full object-cover" />
            <ArchOutline />
          </Reveal>
        )}
        <Reveal delay={0.1} className={image ? '' : 'md:col-span-2 text-center'}>
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-t-accent">{eyebrow.en}</p>
          <Bilingual value={title} as="h2" enClassName="t-display text-3xl leading-snug md:text-5xl" bnClassName="mt-3 font-t-bn-display text-2xl text-t-accent-strong" />
          <Bilingual value={description} className="mt-6 space-y-4 leading-relaxed" enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
        </Reveal>
      </div>
    </section>
  )
}

const LAYOUTS = { band: Band, 'arch-split': ArchSplit, ...THEME_VARIANTS.spotlight }

export default function Spotlight({ variant, copy, ...props }) {
  if (!props.title?.en && !props.description?.en && !props.image) return null
  const Layout = LAYOUTS[variant] || Band
  return <Layout {...props} eyebrow={copy['spotlight.eyebrow']} />
}
