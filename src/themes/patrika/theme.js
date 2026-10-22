import { defineTheme } from '../base.js'

/**
 * Patrika — the wedding as a magazine issue: a cover with masthead and
 * contents, a chapter for each event, drop caps and pull quotes.
 */
export default defineTheme({
  id: 'patrika',
  name: { en: 'Patrika', bn: 'পত্রিকা' },
  description: {
    en: 'Your wedding as a magazine: a cover with a masthead and contents, a chapter for each event, drop caps and pull quotes.',
    bn: 'ম্যাগাজিনের মতো বিয়ে: মাস্টহেড ও সূচিপত্রসহ প্রচ্ছদ, প্রতিটি অনুষ্ঠানের আলাদা অধ্যায়।',
  },
  recommendedFor: ['universal', 'christian', 'buddhist', 'muslim', 'hindu'],
  mood: ['editorial', 'modern', 'bold'],
  palettes: [
    { id: 'newsprint', name: 'Newsprint', description: 'Paper white, black ink and a red masthead', bone: '#F4F1EA', graphite: '#111111', warmGrey: '#D9D4C7', accent: '#C8102E', deepAccent: '#111111', warmAccent: '#C8102E' },
    { id: 'glossy', name: 'Glossy', description: 'Black cover with gold', bone: '#0F0F0F', graphite: '#F4F1EA', warmGrey: '#2A2A2A', accent: '#E4B363', deepAccent: '#F4F1EA', warmAccent: '#E4B363' },
    { id: 'sepia', name: 'Sepia', description: 'Old print in brown and rust', bone: '#EFE6D6', graphite: '#2B2118', warmGrey: '#D8C8AE', accent: '#8C3B1F', deepAccent: '#2B2118', warmAccent: '#B07B2C' },
  ],
  paletteAI: 'accents',
  fonts: { display: 'bodoni', body: 'hanken', bn: 'tirobangla', bnDisplay: 'tirobangla' },
  type: { displayCase: 'normal', displayTracking: '-0.02em' },
  shape: { radius: '0', photoMask: null },
  opening: 'cover',
  variants: { hero: 'cover', story: 'feature', spotlight: 'pullquote', monogram: 'seal', ceremony: 'chapter', gallery: 'spreads', blessings: 'pullquote', invite: 'editorial' },
  ornament: 'rule',
  frame: 'folio',
})
