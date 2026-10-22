import ThemeRoot from '../ThemeRoot'
import Hero from '../sections/Hero'
import Gallery from '../sections/Gallery'
import Guestbook from '../sections/Guestbook'
import Footer from '../sections/Footer'
import Nav from '../sections/Nav'
import ScrollTools from '../sections/ScrollTools'
import { initialsOf } from '../primitives/text'
import { coupleNames, frameInset, has, invocationFor, photo, resolveCopy, verseFrom } from '../compose'
import InviteCard from './InviteCard'
import Hosts from './Hosts'
import Countdown from './Countdown'
import Events from './Events'
import Rsvp from './Rsvp'
import Share from './Share'
import LiveToday from './LiveToday'
import Closing from './Closing'
import OpeningGate from '@/themes/openings/OpeningGate'
import { THEME_FRAMES } from '@/themes/variants'
import { ceremonyWhen, formatEventDay } from '@/lib/dates'
import { dateExtraLine, googleCalendarUrl } from '@/lib/calendar'
import { countdownEvent, headlineEvent, inviteEvents, rsvpState, shareText, todaysEvents } from '@/lib/invitation'
import { isAnchorCeremony } from '@/traditions'

/**
 * The invitation (before the wedding) and the live view (on the wedding days).
 * Same theme as the full site; wording comes from the tradition and the
 * couple's invitation settings.
 */
export default function InviteRenderer({ site, content, theme, tradition, paletteId, viewerName, banner, mode = 'invite', origin = '', qr = null, now = new Date(), demo = false }) {
  const copy = resolveCopy(tradition, content.content?.copy || {})
  const c = content.content || {}
  const hero = c.hero || {}
  const invitation = content.invitation || {}
  const on = (key) => (c.sectionToggles || {})[key] !== false
  const names = coupleNames(site, content)
  const invocation = invocationFor(hero, tradition)
  const v = theme.variants
  const ceremonies = content.ceremonies || []
  const live = mode === 'live'
  const Frame = THEME_FRAMES[theme.frame]

  const nameLine = names.en || names.bn || ''
  const toEvent = (cer) => ({
    id: cer.id,
    title: cer.title,
    when: ceremonyWhen(cer),
    startsAt: cer.startsAt || null,
    venue: cer.venue,
    banner: photo(cer.heroImage, cer.heroImagePosition),
    liveStreamUrl: has(cer.liveStreamUrl) ? cer.liveStreamUrl : null,
    icsUrl: cer.startsAt && !demo ? `/${site.slug}/calendar.ics?event=${encodeURIComponent(cer.id)}` : null,
    googleUrl: googleCalendarUrl({
      title: [cer.title?.en, nameLine].filter(Boolean).join(' · '),
      startsAt: cer.startsAt,
      endsAt: cer.endsAt,
      location: [cer.venue?.en, cer.venue?.address?.en].filter(Boolean).join(', '),
      details: origin ? `${origin}/${site.slug}` : '',
    }),
  })
  const events = inviteEvents(ceremonies).map(toEvent)
  const today = live ? todaysEvents(ceremonies, now).map(toEvent) : []

  const main = countdownEvent(invitation, ceremonies, now, isAnchorCeremony)
  const headline = headlineEvent(invitation, ceremonies, now, isAnchorCeremony)
  const date = hero.date?.en || hero.date?.bn ? hero.date : formatEventDay(headline?.startsAt)
  const verse = invitation.showVerse === false ? null : verseFrom(invitation.verse || c.blessing || hero.blessing || tradition.defaultBlessing)

  const rsvp = rsvpState(invitation, ceremonies, now)
  const deadline = rsvp.settings.deadline ? formatEventDay(`${rsvp.settings.deadline}T12:00:00+06:00`) : null
  const showRsvp = rsvp.settings.enabled && rsvp.events.length > 0

  const photos = (invitation.photos || [])
    .map((item) => (typeof item === 'string' ? { src: item } : { src: item?.url, position: item?.position }))
    .filter((p) => has(p.src))
    .map((p, i) => ({ id: `p${i}`, src: p.src, category: 'wedding', alt: `${nameLine} ${i + 1}` }))

  const url = `${origin}/${site.slug}`
  const navItems = [
    ...(today.length ? [{ id: 'today', label: copy['invite.today'] }] : []),
    ...(events.length ? [{ id: 'events', label: copy['invite.events.title'] }] : []),
    ...(showRsvp ? [{ id: 'rsvp', label: { en: 'RSVP', bn: 'উত্তর' } }] : []),
    ...(photos.length ? [{ id: 'gallery', label: copy['invite.photos.title'] }] : []),
    ...(live && on('messages') ? [{ id: 'guestbook', label: copy['nav.guestbook'] }] : []),
  ]

  return (
    <ThemeRoot theme={theme} sitePalette={site.palette} paletteId={paletteId}>
      <OpeningGate kind={theme.opening} slug={site.slug} names={names} invocation={invocation} skipLabel={copy['opening.skip'].en} />
      {banner}
      <Nav initials={initialsOf(names.en)} items={navItems} overDarkHero={v.hero === 'cinematic'} />
      <ScrollTools />
      {Frame && <Frame names={names} />}
      <div className={frameInset(theme.frame)}>
        <main>
          <Hero
            variant={v.hero}
            names={names}
            date={date}
            invocation={invocation}
            media={{
              image: has(invitation.cover) ? invitation.cover : has(hero.posterPath) ? hero.posterPath : null,
              video: null,
              position: (has(invitation.cover) ? invitation.coverPosition : hero.posterPosition) || '50% 50%',
            }}
            copy={copy}
            contents={navItems}
          />
          {live && <LiveToday events={today} copy={copy} />}
          <InviteCard
            variant={v.invite}
            ornament={theme.ornament}
            eyebrow={copy['invite.eyebrow']}
            wording={invitation.wording?.en || invitation.wording?.bn ? invitation.wording : copy['invite.wording']}
            names={names}
            date={date}
            dateExtra={dateExtraLine(headline?.startsAt, tradition.dateExtras || [])}
            verse={verse}
          />
          <Hosts variant={v.invite} hosts={invitation.hosts || []} copy={copy} />
          {main && !live && <Countdown target={main.startsAt} title={main.title} copy={copy} />}
          <Events variant={v.invite} events={events} copy={copy} />
          {showRsvp && (
            <Rsvp
              slug={site.slug}
              open={rsvp.open}
              events={rsvp.events.map((e) => ({ id: e.id, title: e.title }))}
              settings={{ maxParty: rsvp.settings.maxParty, collectPhone: rsvp.settings.collectPhone, note: rsvp.settings.note }}
              deadline={deadline}
              demo={demo}
              copy={copy}
            />
          )}
          <Gallery variant={v.gallery} items={photos} albums={[]} copy={{ ...copy, 'gallery.title': copy['invite.photos.title'] }} viewerName={viewerName} mask={theme.shape.photoMask} />
          {live && on('messages') && <Guestbook slug={site.slug} copy={copy} />}
          <Share url={url} text={shareText({ names, date, url })} icsUrl={events.some((e) => e.startsAt) && !demo ? `/${site.slug}/calendar.ics` : null} qr={qr} copy={copy} />
          <Closing
            closing={invitation.closing?.en || invitation.closing?.bn ? invitation.closing : copy['invite.closing']}
            signedBy={invitation.signedBy}
            ornament={theme.ornament}
          />
        </main>
        <Footer names={names} thankYou={c.footer?.thankYou} photographer={c.footer?.photographer} contact={site.public_contact || {}} copy={copy} year={String(headline?.startsAt || site.created_at || '').slice(0, 4)} />
      </div>
    </ThemeRoot>
  )
}
