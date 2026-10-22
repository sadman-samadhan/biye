import { defineTheme } from '../base.js'

/**
 * Nakshi Kantha — Bengal's embroidered quilt. Patchwork sections, stitched
 * edges, and a running stitch that sews down the page as guests scroll.
 * Flowers and stitches only, so it suits every tradition.
 */
export default defineTheme({
  id: 'nakshi-kantha',
  name: { en: 'Nakshi Kantha', bn: 'নকশী কাঁথা' },
  description: {
    en: 'Patchwork sections with stitched edges, and a running stitch that sews down the page as you scroll. Handmade and warm.',
    bn: 'সেলাই করা ধারের প্যাচওয়ার্ক, আর স্ক্রল করলে পাতাজুড়ে চলতে থাকা ফোঁড়। হাতে-বোনা উষ্ণতা।',
  },
  recommendedFor: ['universal', 'muslim', 'hindu', 'christian', 'buddhist'],
  mood: ['handmade', 'playful', 'heritage'],
  palettes: [
    { id: 'indigo-kantha', name: 'Indigo Kantha', description: 'Indigo, madder red and cream', bone: '#F6F0E4', graphite: '#1F2440', warmGrey: '#E3D9C6', accent: '#2F3C8F', deepAccent: '#1B2366', warmAccent: '#C2402F' },
    { id: 'mustard-field', name: 'Mustard Field', description: 'Mustard, rust and teal', bone: '#FBF3DD', graphite: '#2A2116', warmGrey: '#EAD9A8', accent: '#A8481F', deepAccent: '#6E2E16', warmAccent: '#2E6E62' },
    { id: 'night-quilt', name: 'Night Quilt', description: 'Dark navy with coral and sea-green threads', bone: '#1B1E30', graphite: '#F2EADB', warmGrey: '#2E3350', accent: '#E07A4F', deepAccent: '#F5B48E', warmAccent: '#86C2B4' },
  ],
  paletteAI: 'accents',
  fonts: { display: 'fraunces', body: 'karla', bn: 'tirobangla', bnDisplay: 'atma' },
  type: { displayCase: 'normal', displayTracking: '-0.02em' },
  shape: { radius: '0', photoMask: 'patch' },
  opening: 'stitch',
  variants: { hero: 'quilt', story: 'stitch', spotlight: 'patch', monogram: 'stitch', ceremony: 'patch', gallery: 'quilt', blessings: 'stitched', invite: 'patch' },
  ornament: 'stitch',
  frame: 'thread',
})
