import { defineTheme } from '../base.js'

/**
 * Laal Paar — the red-bordered white saree of a Bengali bride. Saree borders
 * down the page, alpona turning behind the names, betel-leaf portraits.
 */
export default defineTheme({
  id: 'laal-paar',
  name: { en: 'Laal Paar', bn: 'লাল পাড়' },
  description: {
    en: 'Red-and-white saree borders down the page, alpona that draws itself, portraits in betel-leaf frames.',
    bn: 'পাতার দুই ধারে লাল-সাদা শাড়ির পাড়, নিজে নিজে আঁকা আলপনা, পানপাতার ফ্রেমে ছবি।',
  },
  recommendedFor: ['hindu'],
  mood: ['festive', 'heritage', 'bold'],
  palettes: [
    { id: 'laal-shada', name: 'Laal Shada', description: 'White with sindoor red and gold', bone: '#FFFDF8', graphite: '#2B1612', warmGrey: '#F0E2D6', accent: '#B3121E', deepAccent: '#7A0A12', warmAccent: '#D9A21B' },
    { id: 'sindoor', name: 'Sindoor', description: 'Deep red with gold', bone: '#4A0A10', graphite: '#FFF1E0', warmGrey: '#6B1A20', accent: '#F2C14E', deepAccent: '#FFE3A3', warmAccent: '#F2C14E' },
    { id: 'haldi', name: 'Haldi', description: 'Turmeric yellow with red', bone: '#FFF6DC', graphite: '#2D1A0E', warmGrey: '#F1DFAE', accent: '#B8320C', deepAccent: '#7E1A08', warmAccent: '#B3121E' },
  ],
  paletteAI: 'accents',
  fonts: { display: 'kalnia', body: 'spectral', bn: 'tirobangla', bnDisplay: 'galada', sa: 'tirosanskrit' },
  type: { displayCase: 'normal', displayTracking: '-0.01em' },
  shape: { radius: '0.75rem', photoMask: 'leaf' },
  opening: 'alpona',
  variants: { hero: 'alpona', story: 'paan', spotlight: 'shankha', monogram: 'alpona', ceremony: 'paar', gallery: 'prints', blessings: 'panel', invite: 'paar' },
  ornament: 'paar',
  frame: 'paar',
})
