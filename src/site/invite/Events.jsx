import { CalendarPlus, MapPin, Radio } from 'lucide-react'
import Reveal from '../primitives/Reveal'
import Photo from '../primitives/Photo'
import { Bilingual } from '../primitives/text'
import { ArchOutline } from '@/themes/ornaments'
import { TIME_ZONE } from '@/lib/phase'

const has = (v) => typeof v === 'string' && v.trim()

function dayBadge(startsAt) {
  const date = startsAt ? new Date(startsAt) : null
  if (!date || Number.isNaN(date.getTime())) return null
  const f = (opts, locale = 'en-GB') => new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, ...opts }).format(date)
  return { day: f({ day: 'numeric' }), month: f({ month: 'short' }), dayBn: f({ day: 'numeric' }, 'bn-BD'), monthBn: f({ month: 'long' }, 'bn-BD') }
}

const lightButton =
  'inline-flex items-center gap-2 rounded-full border border-t-accent/50 px-4 py-2 text-sm text-t-accent-strong transition hover:bg-t-accent hover:text-t-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-t-accent'

const onDarkButton =
  'inline-flex items-center gap-2 rounded-full border border-t-on-inverse/40 px-4 py-2 text-sm text-t-on-inverse transition hover:bg-t-on-inverse hover:text-t-inverse'

/** Map, calendar and livestream buttons for one event. `onDark` for the dark live-day band. */
export function EventActions({ event, copy, center = false, onDark = false }) {
  const button = onDark ? onDarkButton : lightButton
  return (
    <div className={`mt-5 flex flex-wrap gap-2 ${center ? 'justify-center' : ''}`}>
      {event.venue?.mapUrl && (
        <a href={event.venue.mapUrl} target="_blank" rel="noopener noreferrer" className={button}>
          <MapPin size={15} /> {copy['ceremonies.map'].en}
        </a>
      )}
      {event.icsUrl && (
        <a href={event.icsUrl} className={button} download>
          <CalendarPlus size={15} /> {copy['invite.calendar'].en}
        </a>
      )}
      {event.googleUrl && (
        <a href={event.googleUrl} target="_blank" rel="noopener noreferrer" className={button}>
          {copy['invite.googleCalendar'].en}
        </a>
      )}
      {event.liveStreamUrl && (
        <a href={event.liveStreamUrl} target="_blank" rel="noopener noreferrer" className={`${button} border-t-accent bg-t-accent text-t-on-accent`}>
          <Radio size={15} /> {copy['invite.watchLive'].en}
        </a>
      )}
    </div>
  )
}

function Venue({ venue }) {
  if (!venue || (!has(venue.en) && !has(venue.bn))) return null
  return (
    <div className="mt-3">
      <Bilingual value={venue} enClassName="text-lg" bnClassName="text-base text-t-ink-muted" />
      <Bilingual value={venue.address} className="mt-1" enClassName="text-sm text-t-ink-muted" bnClassName="text-sm text-t-ink-muted" />
    </div>
  )
}

/** Timeline: date badge on the left, details on the right (Cinematic and other modern themes). */
function Timeline({ events, copy }) {
  return (
    <ol className="space-y-10">
      {events.map((event, i) => {
        const badge = dayBadge(event.startsAt)
        return (
          <Reveal as="li" key={event.id} delay={i * 0.05} className="grid grid-cols-[4.5rem_1fr] gap-5 border-t border-t-line pt-8 sm:grid-cols-[6rem_1fr] sm:gap-8">
            <div className="text-center">
              {badge && (
                <>
                  <p className="t-display text-5xl leading-none text-t-accent-strong sm:text-6xl">{badge.day}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-t-ink-muted">{badge.month}</p>
                  <p lang="bn" className="font-t-bn text-xs text-t-ink-muted">
                    {badge.monthBn}
                  </p>
                </>
              )}
            </div>
            <div className="min-w-0">
              <Bilingual value={event.title} as="h3" enClassName="t-display text-3xl" bnClassName="mt-0.5 font-t-bn-display text-lg text-t-ink-muted" />
              <Bilingual value={event.when} className="mt-3" enClassName="text-base" bnClassName="text-sm text-t-ink-muted" />
              <Venue venue={event.venue} />
              <EventActions event={event} copy={copy} />
            </div>
          </Reveal>
        )
      })}
    </ol>
  )
}

/** Arched cards with the event's photo (Jharokha). */
function Arches({ events, copy }) {
  return (
    <ul className="grid gap-12 sm:grid-cols-2">
      {events.map((event, i) => (
        <Reveal as="li" key={event.id} delay={i * 0.05} className="text-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[18rem] text-t-ornament">
            {event.banner ? (
              <Photo src={event.banner.src} position={event.banner.position} alt="" mask="arch" sizes="18rem" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-t-bg-alt" style={{ clipPath: 'url(#shb-arch)' }} />
            )}
            <ArchOutline />
          </div>
          <Bilingual value={event.title} as="h3" className="mt-6" enClassName="t-display text-2xl" bnClassName="mt-0.5 font-t-bn-display text-lg text-t-ink-muted" />
          <Bilingual value={event.when} className="mt-3" enClassName="text-base" bnClassName="text-sm text-t-ink-muted" />
          <Venue venue={event.venue} />
          <EventActions event={event} copy={copy} center />
        </Reveal>
      ))}
    </ul>
  )
}

export default function Events({ variant, events = [], copy }) {
  if (!events.length) return null
  return (
    <section id="events" className="bg-t-bg px-5 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal as="header" className="mb-14 text-center">
          <Bilingual value={copy['invite.events.title']} as="h2" enClassName="t-display text-4xl md:text-6xl" bnClassName="mt-2 font-t-bn-display text-2xl text-t-ink-muted" />
        </Reveal>
        {variant === 'arch' ? <Arches events={events} copy={copy} /> : <Timeline events={events} copy={copy} />}
      </div>
    </section>
  )
}
