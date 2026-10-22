import { defineTheme } from '../base.js'

/**
 * Noor — "light". A modern nikah: one airy column, a line-drawn arch filled
 * with lamplight, words before pictures. Works with no photos of the bride.
 */
export default defineTheme({
  id: 'noor',
  name: { en: 'Noor', bn: 'নূর' },
  description: {
    en: 'An arch drawn in light, wide calm space and words before pictures. Works beautifully without photos of the bride.',
    bn: 'আলোয় আঁকা খিলান, প্রশান্ত পরিসর, ছবির আগে কথা। কনের ছবি ছাড়াও সুন্দর।',
  },
  recommendedFor: ['muslim'],
  mood: ['serene', 'modern', 'modest'],
  palettes: [
    { id: 'noor-dawn', name: 'Dawn', description: 'Ivory, sage and soft gold', bone: '#FBF8F1', graphite: '#26282F', warmGrey: '#E7E1D3', accent: '#6F8570', deepAccent: '#33453B', warmAccent: '#C8A15A' },
    { id: 'noor-night', name: 'Night of Light', description: 'Midnight blue with lantern gold', bone: '#0F1726', graphite: '#F1EBDD', warmGrey: '#25324A', accent: '#D9B45E', deepAccent: '#F0D58C', warmAccent: '#E8C979' },
    { id: 'noor-rose', name: 'Rose Attar', description: 'Blush, plum and brass', bone: '#FBF5F3', graphite: '#2E2328', warmGrey: '#EADCD8', accent: '#9C5E6E', deepAccent: '#5E3341', warmAccent: '#C49A62' },
  ],
  paletteAI: 'accents',
  fonts: { display: 'italiana', body: 'jost', bn: 'tirobangla', bnDisplay: 'tirobangla', ar: 'amiri' },
  type: { displayCase: 'normal', displayTracking: '0.02em' },
  shape: { radius: '1.25rem', photoMask: 'dome' },
  opening: 'arch-light',
  variants: { hero: 'noor', story: 'noor', spotlight: 'quote', monogram: 'light', ceremony: 'lantern', gallery: 'dome', blessings: 'glow', invite: 'light' },
  ornament: 'light',
})
