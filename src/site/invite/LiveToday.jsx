import Reveal from '../primitives/Reveal'
import { Bilingual } from '../primitives/text'
import { EventActions } from './Events'

/** On the wedding days: what is happening today, with maps and the livestream. */
export default function LiveToday({ events = [], copy }) {
  if (!events.length) return null
  return (
    <section id="today" className="bg-t-inverse px-5 py-16 text-t-on-inverse md:py-20">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Bilingual value={copy['invite.live.title']} as="h2" enClassName="text-[11px] uppercase tracking-[0.4em] text-t-accent-warm" bnClassName="mt-1 font-t-bn text-sm text-t-on-inverse/70" />
        <ul className="mt-8 space-y-10">
          {events.map((event) => (
            <li key={event.id}>
              <Bilingual value={event.title} as="h3" enClassName="t-display text-3xl md:text-4xl" bnClassName="mt-1 font-t-bn-display text-lg text-t-on-inverse/70" />
              <Bilingual value={event.when} className="mt-2" enClassName="text-base" bnClassName="text-sm text-t-on-inverse/70" />
              {(event.venue?.en || event.venue?.bn) && <Bilingual value={event.venue} className="mt-2" enClassName="text-base" bnClassName="text-sm text-t-on-inverse/70" />}
              <EventActions event={{ ...event, icsUrl: null, googleUrl: null }} copy={copy} center onDark />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
