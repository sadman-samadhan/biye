/**
 * One link, three moments:
 *   invitation — before the first event day: invitation, RSVP, countdown
 *   live       — the wedding days (and the day after): today's events, map, blessings
 *   memories   — afterwards, once the couple publishes the gallery
 * All dates are in Bangladesh time, regardless of where the server runs.
 */

export const TIME_ZONE = 'Asia/Dhaka'

/** "YYYY-MM-DD" for an instant, as a calendar date in Dhaka. */
export function dhakaDay(date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function addDays(day, n) {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** First and last event day (Dhaka) from enabled ceremonies with a start time. */
export function eventWindow(ceremonies = []) {
  const days = ceremonies
    .filter((c) => c && c.enabled !== false && c.startsAt)
    .map((c) => new Date(c.startsAt))
    .filter((d) => !Number.isNaN(d.getTime()))
    .map(dhakaDay)
    .sort()
  if (!days.length) return null
  return { first: days[0], last: days[days.length - 1] }
}

/**
 * Which view `/{slug}` shows right now.
 * products: ['invite'], ['site'] or both. phase_override always wins (if allowed by products).
 */
export function computePhase({ products = ['site'], phaseOverride, memoriesPublished = false, ceremonies = [], now = new Date() }) {
  const hasInvite = products.includes('invite')
  const hasSite = products.includes('site')
  const allowed = new Set([...(hasInvite ? ['invitation', 'live'] : []), ...(hasSite ? ['live', 'memories'] : [])])

  if (phaseOverride && allowed.has(phaseOverride)) return phaseOverride
  if (!hasInvite) return 'memories'

  const window = eventWindow(ceremonies)
  const today = dhakaDay(now)

  let phase
  if (!window) phase = memoriesPublished ? 'memories' : 'invitation'
  else if (today < window.first) phase = 'invitation'
  else if (today <= addDays(window.last, 1)) phase = 'live'
  else phase = memoriesPublished ? 'memories' : 'live'

  if (phase === 'memories' && !hasSite) return 'live'
  return phase
}

/** Which access setting applies to a phase. */
export function accessScopeForPhase(phase) {
  return phase === 'memories' ? 'site' : 'invite'
}
