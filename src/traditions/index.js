import muslim from './muslim.js'
import hindu from './hindu.js'
import christian from './christian.js'
import buddhist from './buddhist.js'
import universal from './universal.js'
import sharedPresets from './data/shared-presets.js'
import { createCopy, BASE_COPY } from './copy.js'

/**
 * Traditions supply content, never visuals: invocation, verses, ceremony
 * presets and wording. Any theme can be combined with any tradition.
 */
export const TRADITIONS = { muslim, hindu, christian, buddhist, universal }

export const TRADITION_OPTIONS = [
  { value: 'muslim', label: 'Muslim — মুসলিম' },
  { value: 'hindu', label: 'Hindu — হিন্দু' },
  { value: 'christian', label: 'Christian — খ্রিস্টান' },
  { value: 'buddhist', label: 'Buddhist — বৌদ্ধ' },
  { value: 'universal', label: 'No religious text — ধর্মীয় লেখা ছাড়া' },
]

const ALIASES = { general: 'universal' }

/** Resolved tradition with its variant applied (e.g. hindu + bengali). */
export function getTradition(id = 'muslim', variant) {
  const tradition = TRADITIONS[ALIASES[id] || id] || TRADITIONS.muslim
  const variantId = variant && tradition.variants?.[variant] ? variant : tradition.defaultVariant
  const applied = variantId ? { ...tradition, ...tradition.variants[variantId], variant: variantId } : tradition
  return {
    ...applied,
    // Legacy field names used by older code paths
    openingInvocation: applied.invocation?.text || '',
    openingSub: applied.invocation?.sub || '',
  }
}

export function traditionCopy(tradition, overrides) {
  return createCopy(tradition, overrides)
}

/** Optional events offered for a tradition, beyond its default ceremonies. */
export function presetsFor(tradition) {
  const ids = new Set(tradition.extraPresets || [])
  return sharedPresets.filter((p) => ids.has(p.id) && !tradition.ceremonies.some((c) => c.id === p.id))
}

export const SHARED_PRESETS = sharedPresets

const KNOWN_RANK = Object.fromEntries(
  [...Object.values(TRADITIONS).flatMap((t) => t.ceremonies), ...sharedPresets].map((c) => [c.id, c.rank])
)

// Older sites stored ceremonies without `rank`; match their names instead.
const NAME_RANK = [
  [/ashirbad|আশীর্বাদ|engagement|বাগদান/i, 10],
  [/aiburo|আইবুড়ো/i, 20],
  [/holud|গায়ে/i, 30],
  [/mehendi|henna|মেহেদী/i, 35],
  [/sangeet|সঙ্গীত/i, 36],
  [/akht|nikah|akd|আখত|নিকাহ/i, 40],
  [/qawwali|কাওয়ালী/i, 45],
  [/biye|wedding|shadi|saat.?paak|matrimony|বিবাহ|বিয়ে/i, 50],
  [/bou.?bhat|walima|reception|phool|বৌভাত|ওয়ালিমা|সংবর্ধনা|প্রীতিভোজ/i, 70],
]

export function ceremonyRank(ceremony) {
  if (Number.isFinite(ceremony?.rank)) return ceremony.rank
  if (KNOWN_RANK[ceremony?.id] != null) return KNOWN_RANK[ceremony.id]
  const text = `${ceremony?.id || ''} ${ceremony?.title?.en || ''} ${ceremony?.title?.bn || ''}`
  return NAME_RANK.find(([re]) => re.test(text))?.[1] ?? 100
}

export function sortCeremonies(list) {
  return [...list].sort((a, b) => ceremonyRank(a) - ceremonyRank(b))
}

/** The main ceremony can't be removed or hidden. */
export function isAnchorCeremony(ceremony) {
  return Object.values(TRADITIONS).some((t) => t.anchorIds?.includes(ceremony?.id)) || /^(biye|wedding)$/.test(ceremony?.id || '')
}

export { BASE_COPY, createCopy }
