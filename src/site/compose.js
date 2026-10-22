import { meaningOf, originalOf, referenceOf } from './primitives/text'
import { BASE_COPY, createCopy } from '@/traditions'

/** Helpers shared by the site and invitation renderers. */

export const has = (v) => typeof v === 'string' && v.trim()

/** Every copy key resolved to { en, bn } (plain data, safe to pass to client components). */
export function resolveCopy(tradition, overrides = {}) {
  const t = createCopy(tradition, overrides)
  return Object.fromEntries(Object.keys(BASE_COPY).map((key) => [key, t(key)]))
}

export function verseFrom(blessing) {
  if (!blessing) return null
  const meaning = meaningOf(blessing)
  const original = originalOf(blessing)
  if (!original && !meaning.en && !meaning.bn) return null
  return { original, meaning, reference: referenceOf(blessing) }
}

export function photo(src, position) {
  return has(src) ? { src, position: position || '50% 50%' } : null
}

export function coupleNames(site, content) {
  return content.content?.hero?.coupleNames || { en: site.owner_name || '', bn: '' }
}

/** The couple's own invocation line, else the tradition's (or none). */
export function invocationFor(hero = {}, tradition) {
  return has(hero.openingInvocation)
    ? { text: hero.openingInvocation, lang: tradition.invocation?.lang || 'ar', sub: hero.openingSub || '' }
    : tradition.invocation || null
}
