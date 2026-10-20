/**
 * AmarBiye - Wedding Palette System
 * Supports curated presets and Gemini Vision AI extracted palettes.
 */

export const PRESET_PALETTES = [
  {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    description: 'Warm ivory, earthy clay, and regal deep wine (the signature Rafa & Shawon look)',
    bone: '#FAF9F6',
    graphite: '#2B2B2B',
    warmGrey: '#E8E2DB',
    accent: '#A67C52',       // clay
    deepAccent: '#6B2C3E',   // deep-wine
    warmAccent: '#D4A574',   // saffron
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold & Navy',
    description: 'Majestic midnight navy, shimmering gold, and champagne tones',
    bone: '#FDFBF7',
    graphite: '#141D2B',
    warmGrey: '#DCD4C7',
    accent: '#C5A059',       // royal gold
    deepAccent: '#0D1B2A',   // midnight navy
    warmAccent: '#DFBC6C',   // champagne gold
  },
  {
    id: 'garden-romance',
    name: 'Garden Romance',
    description: 'Soft sage greens, warm blush, and organic botanical hues for outdoor weddings',
    bone: '#F7FAF7',
    graphite: '#233027',
    warmGrey: '#D5DFD7',
    accent: '#5E8267',       // botanical sage
    deepAccent: '#2A4333',   // forest emerald
    warmAccent: '#D99B82',   // dusty rose
  },
  {
    id: 'terracotta-sunset',
    name: 'Terracotta Sunset',
    description: 'Rich earth tones, burnt sienna, and warm sunset glow',
    bone: '#FAF6F2',
    graphite: '#2C1E17',
    warmGrey: '#E5D9D0',
    accent: '#C85A3C',       // terracotta
    deepAccent: '#752516',   // dark sienna
    warmAccent: '#E89868',   // golden peach
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    description: 'Clean gallery neutrals, slate accents, and stark high-contrast typography',
    bone: '#FBFBFB',
    graphite: '#18181B',
    warmGrey: '#E4E4E7',
    accent: '#52525B',       // zinc slate
    deepAccent: '#09090B',   // near black
    warmAccent: '#A1A1AA',   // silver mist
  }
]

export const DEFAULT_PALETTE = PRESET_PALETTES[0]

/**
 * Returns a canonical 6-digit lowercase hex color, or null when the value is not a hex color.
 * Palette values are injected into CSS, so anything else must be rejected.
 */
export function toHexColor(value) {
  if (typeof value !== 'string') return null
  const match = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!match) return null
  const hex = match[1].length === 3 ? match[1].split('').map((c) => c + c).join('') : match[1]
  return `#${hex.toLowerCase()}`
}

/**
 * Calculates luminance for a hex color (e.g. #FFFFFF).
 */
export function hexToLuminance(hex) {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

/**
 * Calculates WCAG contrast ratio between two colors (e.g. 7:1)
 */
export function getContrastRatio(hex1, hex2) {
  try {
    const lum1 = hexToLuminance(hex1)
    const lum2 = hexToLuminance(hex2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
  } catch {
    return 4.5
  }
}

/**
 * Validates a palette object to ensure text (graphite) has at least 4.5:1 contrast against background (bone).
 * Automatically darkens graphite if contrast fails WCAG AA.
 */
export function normalizePalette(palette) {
  if (!palette || typeof palette !== 'object') return DEFAULT_PALETTE

  const normalized = {
    name: typeof palette.name === 'string' ? palette.name.slice(0, 80) : 'Custom Palette',
    bone: toHexColor(palette.bone) || DEFAULT_PALETTE.bone,
    graphite: toHexColor(palette.graphite) || DEFAULT_PALETTE.graphite,
    warmGrey: toHexColor(palette.warmGrey) || DEFAULT_PALETTE.warmGrey,
    accent: toHexColor(palette.accent) || DEFAULT_PALETTE.accent,
    deepAccent: toHexColor(palette.deepAccent) || DEFAULT_PALETTE.deepAccent,
    warmAccent: toHexColor(palette.warmAccent) || DEFAULT_PALETTE.warmAccent,
  }

  const contrast = getContrastRatio(normalized.graphite, normalized.bone)
  if (contrast < 4.5) {
    // If contrast is insufficient on light background, force a dark graphite
    normalized.graphite = '#1F1F1F'
  }

  return normalized
}
