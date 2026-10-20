/**
 * Guest passcodes: easy to say over the phone and type on a phone keyboard.
 * Default form: "<flower>-<4 digits>", e.g. "shapla-4821".
 */

const BANGLA_DIGITS = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' }

// Flowers of Bengal, in the spellings people use when texting
const WORDS = [
  'shapla', 'kadam', 'palash', 'bokul', 'shimul', 'juthi', 'hasna', 'champa', 'kamini', 'beli',
  'golap', 'gada', 'joba', 'shefali', 'dolon', 'krishnochura', 'radhachura', 'kash', 'shiuli', 'kodom',
]

/** Canonical form for comparison: lowercase, no spaces, Bangla digits as ASCII. */
export function normalizePasscode(input) {
  return String(input ?? '')
    .normalize('NFKC')
    .replace(/[০-৯]/g, (d) => BANGLA_DIGITS[d])
    .toLowerCase()
    .replace(/\s+/g, '')
}

export function passcodeProblem(passcode) {
  const value = normalizePasscode(passcode)
  if (value.length < 6) return 'Use at least 6 characters'
  if (value.length > 40) return 'Use at most 40 characters'
  return null
}

/** Random default passcode. `random` returns integers in [0, n) (crypto-backed on the server). */
export function generatePasscode(random) {
  const word = WORDS[random(WORDS.length)]
  const digits = String(random(9000) + 1000)
  return `${word}-${digits}`
}
