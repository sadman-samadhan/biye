/** Text helpers for bilingual (English + Bangla) and sacred-script content. */

const has = (v) => typeof v === 'string' && v.trim().length > 0

/** English line + Bangla line, each tagged with its language. Renders nothing when both are empty. */
export function Bilingual({ value, as: Tag = 'p', className = '', enClassName = '', bnClassName = '', bnFirst = false }) {
  if (!value || (!has(value.en) && !has(value.bn))) return null
  const en = has(value.en) && (
    <span lang="en" className={`block ${enClassName}`}>
      {value.en}
    </span>
  )
  const bn = has(value.bn) && (
    <span lang="bn" className={`block font-t-bn ${bnClassName}`}>
      {value.bn}
    </span>
  )
  return (
    <Tag className={className}>
      {bnFirst ? bn : en}
      {bnFirst ? en : bn}
    </Tag>
  )
}

const SCRIPT = {
  ar: { className: 'font-t-ar', dir: 'rtl', lang: 'ar' },
  sa: { className: 'font-t-sa', dir: 'ltr', lang: 'sa' },
  pi: { className: 'font-t-display italic', dir: 'ltr', lang: 'pi' },
  bn: { className: 'font-t-bn', dir: 'ltr', lang: 'bn' },
}

/** A verse in its original script with the right font, language and direction. */
export function SacredText({ text, lang = 'ar', className = '' }) {
  if (!has(text)) return null
  const s = SCRIPT[lang] || SCRIPT.ar
  return (
    <p lang={s.lang} dir={s.dir} className={`${s.className} ${className}`}>
      {text}
    </p>
  )
}

/** Picks the original-script line from a verse/blessing object. */
export function originalOf(verse) {
  if (!verse) return null
  if (has(verse.ar) || has(verse.arabic)) return { text: verse.ar || verse.arabic, lang: 'ar' }
  if (has(verse.sa) || has(verse.sanskrit)) return { text: verse.sa || verse.sanskrit, lang: 'sa' }
  if (has(verse.pi) || has(verse.pali)) return { text: verse.pi || verse.pali, lang: 'pi' }
  return null
}

/** English/Bangla meaning of a verse in either the blessing or the dua shape. */
export function meaningOf(verse) {
  if (!verse) return {}
  return { en: verse.en || verse.english || verse.translation || '', bn: verse.bn || verse.bengali || '' }
}

export function referenceOf(verse) {
  const ref = verse?.reference
  if (!ref) return null
  return typeof ref === 'string' ? { en: ref, bn: '' } : ref
}

/** "Rahim & Karima" → ['Rahim', 'Karima'] (also handles "and" / "ও"). */
export function splitNames(names) {
  const raw = String(names || '').trim()
  if (!raw) return ['', '']
  const parts = raw.split(/\s+(?:&|and|ও|এবং)\s+|\s*&\s*/i)
  return parts.length >= 2 ? [parts[0], parts.slice(1).join(' & ')] : [raw, '']
}

export function initialsOf(names) {
  const [a, b] = splitNames(names)
  return [a?.[0] || '', b?.[0] || ''].map((c) => c.toUpperCase())
}

const BENGALI = /[ঀ-৿]/

/** A citation such as "Surah Ar-Rum 30:21" / "সূরা আর-রূম ৩০:২১" in small caps style (Latin only). */
export function Reference({ value, className = '' }) {
  if (!value) return null
  const text = typeof value === 'string' ? value : value.en || value.bn
  if (!has(text)) return null
  const bangla = BENGALI.test(text)
  return (
    <p lang={bangla ? 'bn' : undefined} className={`text-t-accent ${bangla ? 'font-t-bn text-sm' : 'text-xs uppercase tracking-[0.3em]'} ${className}`}>
      {text}
    </p>
  )
}
