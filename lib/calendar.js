import { TIME_ZONE, dhakaDay } from './phase.js'

/**
 * Calendar helpers for invitations: the Bangla (Bangladesh revised) and Hijri
 * date lines, .ics files and Google Calendar links. Pure; safe on client and server.
 */

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
export const toBanglaDigits = (value) => String(value).replace(/\d/g, (d) => BN_DIGITS[d])

const BANGLA_MONTHS = [
  ['Boishakh', 'বৈশাখ'], ['Joishtho', 'জ্যৈষ্ঠ'], ['Asharh', 'আষাঢ়'], ['Srabon', 'শ্রাবণ'],
  ['Bhadro', 'ভাদ্র'], ['Ashwin', 'আশ্বিন'], ['Kartik', 'কার্তিক'], ['Agrahayan', 'অগ্রহায়ণ'],
  ['Poush', 'পৌষ'], ['Magh', 'মাঘ'], ['Falgun', 'ফাল্গুন'], ['Chaitra', 'চৈত্র'],
]

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

/**
 * Bangla calendar date as used in Bangladesh since the 2019 revision:
 * the year starts on 14 April, the first six months have 31 days, Falgun
 * has 29 (30 in a Gregorian leap year) and the rest 30.
 */
export function banglaDate(date) {
  const [y, m, d] = dhakaDay(date).split('-').map(Number)
  const startYear = m > 4 || (m === 4 && d >= 14) ? y : y - 1
  const start = Date.UTC(startYear, 3, 14)
  let offset = Math.round((Date.UTC(y, m - 1, d) - start) / 86400000)
  const lengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeap(startYear + 1) ? 30 : 29, 30]
  let month = 0
  while (offset >= lengths[month]) offset -= lengths[month++]
  const day = offset + 1
  const year = startYear - 593
  return {
    day,
    month,
    year,
    en: `${day} ${BANGLA_MONTHS[month][0]} ${year}`,
    bn: `${toBanglaDigits(day)} ${BANGLA_MONTHS[month][1]} ${toBanglaDigits(year)} বঙ্গাব্দ`,
  }
}

/** Hijri (Umm al-Qura) date. Local moon sighting can differ by a day. */
export function hijriDate(date) {
  const parts = (locale) =>
    Object.fromEntries(
      new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, { timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric' })
        .formatToParts(date)
        .map((p) => [p.type, p.value])
    )
  const en = parts('en')
  const bn = parts('bn-BD')
  return {
    en: `${en.day} ${en.month} ${en.year} AH`,
    bn: `${bn.day} ${bn.month} ${bn.year} হিজরি`,
  }
}

/** The extra date line a tradition asks for ('hijri' | 'bangla-calendar'), or null. */
export function dateExtraLine(startsAt, extras = []) {
  const date = startsAt ? new Date(startsAt) : null
  if (!date || Number.isNaN(date.getTime())) return null
  if (extras.includes('hijri')) return hijriDate(date)
  if (extras.includes('bangla-calendar')) return banglaDate(date)
  return null
}

// ---- .ics -----------------------------------------------------------------------

const DEFAULT_HOURS = 3

const icsDate = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function icsEscape(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/([,;])/g, '\\$1')
}

/** Folds a content line at 75 octets, as RFC 5545 requires (never splitting a UTF-8 character). */
const utf8Length = (ch) => {
  const cp = ch.codePointAt(0)
  return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4
}

function fold(line) {
  if ([...line].reduce((n, ch) => n + utf8Length(ch), 0) <= 75) return line
  const out = []
  let current = ''
  let size = 0
  for (const ch of line) {
    const n = utf8Length(ch)
    if (size + n > (out.length ? 74 : 75)) {
      out.push(current)
      current = ''
      size = 0
    }
    current += ch
    size += n
  }
  out.push(current)
  return out.join('\r\n ')
}

function eventTimes(event) {
  const start = new Date(event.startsAt)
  if (Number.isNaN(start.getTime())) return null
  let end = event.endsAt ? new Date(event.endsAt) : null
  if (!end || Number.isNaN(end.getTime()) || end <= start) end = new Date(start.getTime() + DEFAULT_HOURS * 3600000)
  return { start, end }
}

/**
 * One VEVENT per event with a start time, in UTC.
 * events: [{ id, title, startsAt, endsAt?, location?, description? }]
 */
export function buildIcs({ calendarName, uidDomain = 'shubhobiye.com', url, events, now = new Date() }) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ShubhoBiye//Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  if (calendarName) lines.push(`X-WR-CALNAME:${icsEscape(calendarName)}`)
  for (const event of events) {
    const times = eventTimes(event)
    if (!times) continue
    lines.push(
      'BEGIN:VEVENT',
      `UID:${icsEscape(event.id)}@${uidDomain}`,
      `DTSTAMP:${icsDate(now)}`,
      `DTSTART:${icsDate(times.start)}`,
      `DTEND:${icsDate(times.end)}`,
      `SUMMARY:${icsEscape(event.title)}`,
      ...(event.location ? [`LOCATION:${icsEscape(event.location)}`] : []),
      ...(event.description || url ? [`DESCRIPTION:${icsEscape([event.description, url].filter(Boolean).join('\n'))}`] : []),
      ...(url ? [`URL:${url}`] : []),
      'END:VEVENT'
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

/** "Add to Google Calendar" link for one event. */
export function googleCalendarUrl({ title, startsAt, endsAt, location, details }) {
  const times = eventTimes({ startsAt, endsAt })
  if (!times) return null
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || '',
    dates: `${icsDate(times.start)}/${icsDate(times.end)}`,
    ctz: TIME_ZONE,
    ...(location ? { location } : {}),
    ...(details ? { details } : {}),
  })
  return `https://calendar.google.com/calendar/render?${q}`
}
