import { toHexColor } from './palettes.js'

/**
 * Colour roles every theme styles against (CSS variables --t-<role>):
 *   bg, bgAlt, surface, ink, inkMuted, accent, accentStrong, accentWarm,
 *   onAccent, ornament, line, inverse, onInverse
 * Palettes are stored in the editor's 6-key form
 * (bone, graphite, warmGrey, accent, deepAccent, warmAccent) and expanded here.
 */

function rgb(hex) {
  const h = (toHexColor(hex) || '#000000').slice(1)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

function hex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`
}

/** Linear mix: t=0 → a, t=1 → b. */
export function mix(a, b, t) {
  const A = rgb(a)
  const B = rgb(b)
  return hex(A.map((v, i) => v + (B[i] - v) * t))
}

export function luminance(color) {
  const [r, g, b] = rgb(color).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export const isDark = (color) => luminance(color) < 0.2

/**
 * Smallest change to `fg` (toward black or toward white) that reaches `min`
 * contrast against `bg`. Falls back to whichever extreme contrasts more.
 */
export function ensureContrast(fg, bg, min) {
  if (contrast(fg, bg) >= min) return fg
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    for (const target of isDark(bg) ? ['#ffffff', '#000000'] : ['#000000', '#ffffff']) {
      const candidate = mix(fg, target, t)
      if (contrast(candidate, bg) >= min) return candidate
    }
  }
  return contrast('#ffffff', bg) >= contrast('#000000', bg) ? '#ffffff' : '#000000'
}

/** Text colour for an accent background, darkening the accent if neither black nor white is readable on it. */
function accentPair(accent, ink) {
  if (contrast('#ffffff', accent) >= 4.5) return { accent, onAccent: '#ffffff' }
  const darkText = ensureContrast(ink, accent, 4.5)
  if (contrast(darkText, accent) >= 4.5) return { accent, onAccent: darkText }
  let deeper = accent
  for (let t = 0.05; t <= 1 && contrast('#ffffff', deeper) < 4.5; t += 0.05) deeper = mix(accent, '#000000', t)
  return { accent: deeper, onAccent: '#ffffff' }
}

/** Expands a 6-key palette into all roles. */
export function paletteToRoles(p) {
  const bg = toHexColor(p.bone) || '#faf9f6'
  const dark = isDark(bg)
  const ink = ensureContrast(toHexColor(p.graphite) || (dark ? '#f4efe6' : '#1f1b18'), bg, 7)
  const pair = accentPair(ensureContrast(toHexColor(p.accent) || '#a67c52', bg, 3), ink)
  const accent = pair.accent
  const accentStrong = toHexColor(p.deepAccent) || mix(accent, '#000000', 0.45)
  const accentWarm = toHexColor(p.warmAccent) || mix(accent, '#ffcc66', 0.4)
  const inverse = dark ? mix(bg, '#000000', 0.45) : mix(accentStrong, '#0a0806', 0.72)

  return {
    bg,
    bgAlt: mix(bg, ink, dark ? 0.06 : 0.035),
    surface: dark ? mix(bg, '#ffffff', 0.05) : mix(bg, '#ffffff', 0.6),
    ink,
    inkMuted: ensureContrast(mix(ink, bg, 0.32), bg, 4.5),
    accent,
    accentStrong: ensureContrast(accentStrong, bg, 4.5),
    accentWarm,
    onAccent: pair.onAccent,
    ornament: ensureContrast(accentWarm, bg, 2),
    line: toHexColor(p.warmGrey) ? mix(toHexColor(p.warmGrey), bg, 0.25) : mix(ink, bg, 0.82),
    inverse,
    onInverse: ensureContrast(dark ? ink : bg, inverse, 7),
    scheme: dark ? 'dark' : 'light',
  }
}

/**
 * Final roles for a site: the theme's own palette (or the one the couple chose),
 * with the couple's custom/AI colours applied according to the theme's policy:
 *   'full'    — the custom palette replaces the theme palette
 *   'accents' — only accent colours are taken from it (keeps the theme's ground)
 *   'off'     — custom colours are ignored
 */
export function resolvePalette(theme, { sitePalette, paletteId } = {}) {
  const themePalettes = theme.palettes || []
  const chosen = themePalettes.find((p) => p.id === paletteId)
  const isThemePalette = sitePalette && themePalettes.some((p) => p.id && p.id === sitePalette.id)
  // Only colours made for this couple (AI from their photo, or hand-picked) carry across themes;
  // a preset that belongs to another theme does not.
  const isCustom = sitePalette && !isThemePalette && (!sitePalette.id || sitePalette.id === 'ai-generated' || sitePalette.id === 'custom')
  const base = chosen || (isThemePalette ? sitePalette : null) || themePalettes[0]

  if (!isCustom || chosen || theme.paletteAI === 'off') return paletteToRoles(base)
  if (theme.paletteAI === 'accents') {
    return paletteToRoles({ ...base, accent: sitePalette.accent, deepAccent: sitePalette.deepAccent, warmAccent: sitePalette.warmAccent })
  }
  return paletteToRoles(sitePalette)
}

const ROLE_VARS = {
  bg: '--t-bg',
  bgAlt: '--t-bg-alt',
  surface: '--t-surface',
  ink: '--t-ink',
  inkMuted: '--t-ink-muted',
  accent: '--t-accent',
  accentStrong: '--t-accent-strong',
  accentWarm: '--t-accent-warm',
  onAccent: '--t-on-accent',
  ornament: '--t-ornament',
  line: '--t-line',
  inverse: '--t-inverse',
  onInverse: '--t-on-inverse',
}

/** CSS custom properties for the roles (values are validated hex only). */
export function rolesToCssVars(roles) {
  const vars = {}
  for (const [role, name] of Object.entries(ROLE_VARS)) {
    const value = toHexColor(roles[role])
    if (value) vars[name] = value
  }
  // Legacy names still used by a few shared components
  vars['--color-bone'] = vars['--t-bg']
  vars['--color-graphite'] = vars['--t-ink']
  vars['--color-warm-grey'] = vars['--t-line']
  vars['--color-clay'] = vars['--t-accent']
  vars['--color-deep-wine'] = vars['--t-accent-strong']
  vars['--color-saffron'] = vars['--t-accent-warm']
  return vars
}
