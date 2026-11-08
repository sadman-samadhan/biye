import { dhakaDay } from './phase.js'

/**
 * Pure rules for the invitation: which events it lists, what the countdown
 * counts to, whether RSVPs are still open. Safe on client and server.
 */

const startOf = (c) => {
  const t = c?.startsAt ? new Date(c.startsAt).getTime() : NaN
  return Number.isNaN(t) ? Infinity : t
}

/** Enabled ceremonies shown on the invitation, in time order (events without a time keep their place at the end). */
export function inviteEvents(ceremonies = []) {
  return ceremonies
    .filter((c) => c && c.enabled !== false && c.onInvite !== false)
    .map((c, i) => ({ c, i }))
    .sort((a, b) => startOf(a.c) - startOf(b.c) || a.i - b.i)
    .map(({ c }) => c)
}

/** Events guests can RSVP to. */
export function rsvpEvents(ceremonies = []) {
  return inviteEvents(ceremonies).filter((c) => c.rsvp !== false)
}

/**
 * The event the countdown counts to: the one the couple chose, else the main
 * ceremony while it is still ahead, else the next upcoming, else the first.
 * isMain(ceremony) identifies the main ceremony (the tradition's anchor).
 */
export function countdownEvent(invitation = {}, ceremonies = [], now = new Date(), isMain = () => false) {
  const events = inviteEvents(ceremonies).filter((c) => Number.isFinite(startOf(c)))
  if (!events.length) return null
  const chosen = events.find((c) => c.id === invitation.countdownTo)
  if (chosen) return chosen
  const main = events.find(isMain)
  if (main && startOf(main) > now.getTime()) return main
  return events.find((c) => startOf(c) > now.getTime()) || events[0]
}

/** The event whose date headlines the invitation: the main ceremony, else the countdown event. */
export function headlineEvent(invitation = {}, ceremonies = [], now = new Date(), isMain = () => false) {
  return inviteEvents(ceremonies).find((c) => isMain(c) && Number.isFinite(startOf(c))) || countdownEvent(invitation, ceremonies, now, isMain)
}

/** Events happening today (Dhaka), for the live view. */
export function todaysEvents(ceremonies = [], now = new Date()) {
  const today = dhakaDay(now)
  return inviteEvents(ceremonies).filter((c) => Number.isFinite(startOf(c)) && dhakaDay(new Date(startOf(c))) === today)
}

export const RSVP_DEFAULTS = Object.freeze({ enabled: false, deadline: '', maxParty: 5, collectPhone: false })

export function rsvpSettings(invitation = {}) {
  return { ...RSVP_DEFAULTS, ...(invitation.rsvp || {}) }
}

/**
 * Whether guests can still reply. The deadline is a calendar day in Dhaka and
 * includes that whole day; with no deadline, replies close when the last event starts.
 */
export function rsvpState(invitation = {}, ceremonies = [], now = new Date()) {
  const settings = rsvpSettings(invitation)
  const events = rsvpEvents(ceremonies)
  if (!settings.enabled || !events.length) return { open: false, reason: 'disabled', settings, events }
  if (settings.deadline && /^\d{4}-\d{2}-\d{2}$/.test(settings.deadline)) {
    if (dhakaDay(now) > settings.deadline) return { open: false, reason: 'closed', settings, events }
  } else {
    const last = Math.max(...events.map(startOf).filter(Number.isFinite))
    if (Number.isFinite(last) && now.getTime() > last) return { open: false, reason: 'closed', settings, events }
  }
  return { open: true, reason: null, settings, events }
}

// ---- Links couples paste ---------------------------------------------------------

const MAP_HOSTS = /^(maps\.app\.goo\.gl|goo\.gl|(www\.)?google\.[a-z.]+|maps\.google\.[a-z.]+|maps\.apple\.com|maps\.apple)$/i
const STREAM_HOSTS = /^((www|m)\.)?(youtube\.com|youtu\.be|facebook\.com|fb\.watch)$/i

function hostOf(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.hostname : null
  } catch {
    return null
  }
}

/** Google Maps or Apple Maps links only (Google needs a /maps path on google.* hosts). */
export function isMapUrl(value) {
  const host = hostOf(value)
  if (!host || !MAP_HOSTS.test(host)) return false
  if (/^(www\.)?google\./i.test(host)) return new URL(value).pathname.startsWith('/maps')
  return true
}

/** YouTube or Facebook live links only. */
export const isLiveStreamUrl = (value) => Boolean(hostOf(value) && STREAM_HOSTS.test(hostOf(value)))

// ---- Guest lists -----------------------------------------------------------------
// Most guests are invited to some events, not all. The couple makes a list per
// group of guests (e.g. "Holud only") and sends each group its own link,
// /{slug}/i/{id}. The id is random and unguessable, so it doubles as the key.

export const GUEST_LIST_ID = /^[A-Za-z0-9_-]{8,32}$/

/** A fresh, unguessable list id (browser or Node). */
export function newGuestListId() {
  const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_' // 58 characters
  const bytes = new Uint8Array(12)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

/** The couple's list with this id, or null. */
export function guestListFor(invitation = {}, listId) {
  if (typeof listId !== 'string' || !GUEST_LIST_ID.test(listId)) return null
  return (invitation.guestLists || []).find((l) => l?.id === listId) || null
}

/** Only the ceremonies on a guest list (every ceremony when there is no list). */
export function ceremoniesForList(ceremonies = [], list) {
  if (!list) return ceremonies
  const ids = new Set(list.events || [])
  return ceremonies.filter((c) => c && ids.has(c.id))
}

/**
 * Site content as a guest on a list sees it: only their events, and only the
 * gallery albums of those events (general "Wedding" photos stay). Applied
 * before photo links are signed, so other events' photos never reach them.
 */
export function contentForList(content, list) {
  if (!list) return content
  const all = new Set((content.ceremonies || []).map((c) => c?.id))
  const mine = new Set(list.events || [])
  return {
    ...content,
    ceremonies: ceremoniesForList(content.ceremonies || [], list),
    gallery: Array.isArray(content.gallery) ? content.gallery.filter((g) => !all.has(g?.category) || mine.has(g.category)) : content.gallery,
  }
}
