import { TIME_ZONE } from './phase.js'

// Bangla names the part of the day instead of AM/PM
function bnDayPeriod(hour) {
  if (hour >= 4 && hour < 12) return 'সকাল'
  if (hour >= 12 && hour < 16) return 'দুপুর'
  if (hour >= 16 && hour < 18) return 'বিকাল'
  if (hour >= 18 && hour < 20) return 'সন্ধ্যা'
  return 'রাত'
}

/**
 * Event times as guests read them, always in Bangladesh time:
 *   en: "Thursday, 10 December 2026 · 6:30 PM"
 *   bn: "বৃহস্পতিবার, ১০ ডিসেম্বর ২০২৬ · সন্ধ্যা ৬:৩০"
 */
export function formatEventTime(startsAt) {
  if (!startsAt) return null
  const date = new Date(startsAt)
  if (Number.isNaN(date.getTime())) return null
  const day = (locale) =>
    new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  const time = (locale) =>
    new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', hour12: true }).format(date)
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: 'numeric', hourCycle: 'h23' }).format(date))
  const bnClock = time('bn-BD').replace(/\s*(AM|PM|am|pm|পূর্বাহ্ণ|অপরাহ্ণ)\s*/g, '').trim()
  return {
    en: `${day('en-GB')} · ${time('en-US')}`,
    bn: `${day('bn-BD').replace(/,(?=\s*[০-৯]{4}$)/, '')} · ${bnDayPeriod(hour)} ${bnClock}`,
  }
}

/** Display text for a ceremony's date: the couple's own wording wins, else the formatted start time. */
export function ceremonyWhen(ceremony) {
  const custom = ceremony?.date
  if (custom?.en || custom?.bn) return { en: custom.en || '', bn: custom.bn || '' }
  return formatEventTime(ceremony?.startsAt)
}
