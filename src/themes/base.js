/**
 * Theme contract. A theme is pure configuration (serializable, so it can be
 * handed to client components) that changes layout variants, typography,
 * ornaments, photo shapes, motion and the opening — not just colours.
 *
 *   id, name {en,bn}, description {en,bn}
 *   recommendedFor: tradition ids it was designed around (shown first in pickers)
 *   palettes: [{ id, name, description, bone, graphite, warmGrey, accent, deepAccent, warmAccent }]
 *   paletteAI: 'full' | 'accents' | 'off'   — how a couple's custom/AI palette applies
 *   fonts: { display, body, bn, bnDisplay, ar, sa } — keys into themes/fonts.js
 *   type: { displayCase: 'normal'|'upper', displayTracking }
 *   shape: { radius, photoMask: null|'arch' }
 *   opening: 'none' | 'film' | 'arch-doors' | …
 *   order: section keys in page order
 *   variants: per-section layout variant ids
 *   ornament: divider/frame ornament set id
 */
export const SECTION_ORDER = ['hero', 'story', 'spotlight', 'monogram', 'ceremonies', 'gallery', 'blessings', 'guestbook']

const BASE = {
  recommendedFor: [],
  paletteAI: 'full',
  fonts: { display: 'cormorant', body: 'inter', bn: 'hindsiliguri', bnDisplay: 'galada', ar: 'amiri', sa: 'tirosanskrit' },
  type: { displayCase: 'normal', displayTracking: '-0.01em' },
  shape: { radius: '0.25rem', photoMask: null },
  opening: 'none',
  order: SECTION_ORDER,
  variants: {
    hero: 'cinematic',
    story: 'alternating',
    spotlight: 'band',
    monogram: 'ring',
    ceremony: 'parallax',
    gallery: 'masonry',
    blessings: 'classic',
    nav: 'bar',
  },
  ornament: 'line',
}

export function defineTheme(theme) {
  return {
    ...BASE,
    ...theme,
    fonts: { ...BASE.fonts, ...theme.fonts },
    type: { ...BASE.type, ...theme.type },
    shape: { ...BASE.shape, ...theme.shape },
    variants: { ...BASE.variants, ...theme.variants },
  }
}
