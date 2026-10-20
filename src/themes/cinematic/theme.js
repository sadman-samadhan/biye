import { defineTheme } from '../base.js'
import { PRESET_PALETTES } from '../../../lib/palettes.js'

/** The original ShubhoBiye look, refined: a film title sequence for your wedding. */
export default defineTheme({
  id: 'cinematic',
  name: { en: 'Cinematic', bn: 'সিনেমাটিক' },
  description: {
    en: 'Full-screen film or photo, parallax ceremony banners and dark cinematic bands. Works for every tradition.',
    bn: 'পূর্ণ পর্দার ছবি বা ভিডিও, প্যারালাক্স অনুষ্ঠান-ব্যানার আর সিনেমার মতো গাঢ় অংশ। সব ধর্মের জন্য মানানসই।',
  },
  recommendedFor: ['universal', 'muslim', 'hindu', 'christian', 'buddhist'],
  mood: ['dramatic', 'modern'],
  palettes: PRESET_PALETTES,
  paletteAI: 'full',
  fonts: { display: 'cormorant', body: 'inter', bn: 'hindsiliguri', bnDisplay: 'galada' },
  opening: 'film',
  variants: { hero: 'cinematic', story: 'alternating', spotlight: 'band', monogram: 'ring', ceremony: 'parallax', gallery: 'masonry', blessings: 'classic' },
  ornament: 'line',
})
