import { defineTheme } from '../base.js'

/**
 * Jharokha — the wedding seen through a carved Mughal window. Ogee arches,
 * girih star geometry, emerald and antique gold. No figurative ornament.
 */
export default defineTheme({
  id: 'jharokha',
  name: { en: 'Jharokha', bn: 'ঝরোখা' },
  description: {
    en: 'Mughal arches, girih star patterns, emerald and antique gold. Photos framed in carved-window arches; doors open onto the site.',
    bn: 'মুঘল খিলান, গিরিহ নকশা, পান্না সবুজ আর পুরোনো সোনালি। খিলানের ফ্রেমে ছবি; দরজা খুলে সাইটে প্রবেশ।',
  },
  recommendedFor: ['muslim'],
  mood: ['regal', 'heritage', 'ornate'],
  palettes: [
    {
      id: 'marble-emerald',
      name: 'Marble & Emerald',
      description: 'Ivory marble, deep emerald and antique gold',
      bone: '#F7F2E7',
      graphite: '#1C2A24',
      warmGrey: '#DCCFB4',
      accent: '#1F5E4A',
      deepAccent: '#12392E',
      warmAccent: '#B8893B',
    },
    {
      id: 'rose-sandstone',
      name: 'Rose Sandstone',
      description: 'Warm sandstone, rose maroon and brass',
      bone: '#FAF3EC',
      graphite: '#2A1E22',
      warmGrey: '#E6D3C6',
      accent: '#8E3B4A',
      deepAccent: '#5A1F2C',
      warmAccent: '#C29A55',
    },
    {
      id: 'midnight-teal',
      name: 'Midnight Teal',
      description: 'Night-blue courtyard with lamplight gold',
      bone: '#0E2626',
      graphite: '#F2EADB',
      warmGrey: '#2A4443',
      accent: '#C9A45C',
      deepAccent: '#E3C88B',
      warmAccent: '#D9B46A',
    },
  ],
  paletteAI: 'accents',
  fonts: { display: 'marcellus', body: 'ebgaramond', bn: 'tirobangla', bnDisplay: 'tirobangla', ar: 'amiri' },
  type: { displayCase: 'upper', displayTracking: '0.08em' },
  shape: { radius: '0', photoMask: 'arch' },
  opening: 'arch-doors',
  variants: { hero: 'arch', story: 'medallion', spotlight: 'arch-split', monogram: 'arch', ceremony: 'iwan', gallery: 'arch-grid', blessings: 'panel', invite: 'arch' },
  ornament: 'girih',
})
