import contentData from '@/data/content.json'
import ceremoniesData from '@/data/ceremonies.json'
import galleryData from '@/data/demo-gallery.json'
import duasData from '@/data/duas.json'
import { TRADITIONS } from './traditions'

/**
 * Built-in demo sites. They work without a database and never touch tenant data.
 * Server-side only by convention: client components receive demo data as props.
 */

export const DEMO_SITE = {
  id: 'demo-rafa-shawon',
  slug: 'demo',
  status: 'live',
  wedding_type: 'muslim',
  template_id: 'classic',
  owner_name: 'ShubhoBiye Demo',
  products: ['invite', 'site'],
  palette: {
    name: 'Classic Elegance',
    bone: '#F8F6F0',
    graphite: '#1A1815',
    warmGrey: '#8C857B',
    accent: '#A65D57',
    deepAccent: '#4A1525',
    warmAccent: '#D49B4B'
  },
  palette_options: [],
  selected_palette_index: 0
}

const DEMO_HINDU_SITE = {
  ...DEMO_SITE,
  id: 'demo-hindu',
  slug: 'demo-hindu',
  wedding_type: 'hindu',
  owner_name: 'ShubhoBiye Sanatan Demo',
  palette: {
    name: 'Royal Sindoor & Gold',
    bone: '#FAF7F2',
    graphite: '#1B1815',
    warmGrey: '#877E75',
    accent: '#9E2A2B',
    deepAccent: '#540B0E',
    warmAccent: '#D4A373'
  }
}

export const DEMO_CONTENT = {
  content: contentData,
  ceremonies: ceremoniesData.ceremonies,
  duas: duasData,
  gallery: galleryData.gallery
}

const DEMO_SITES_BY_SLUG = {
  demo: DEMO_SITE,
  'rafa-shawon': DEMO_SITE,
  'demo-hindu': DEMO_HINDU_SITE,
}

export function isDemoSiteId(siteId) {
  return siteId === DEMO_SITE.id || siteId === DEMO_HINDU_SITE.id
}

export function getDemoSite(slug) {
  return DEMO_SITES_BY_SLUG[slug] || null
}

export function getDemoContent(siteId) {
  if (siteId === DEMO_SITE.id) return DEMO_CONTENT
  if (siteId !== DEMO_HINDU_SITE.id) return null

  const hinduTradition = TRADITIONS.hindu
  return {
    content: {
      ...contentData,
      hero: {
        ...contentData.hero,
        coupleNames: { en: 'Subrata & Priyanka', bn: 'সুব্রত ও প্রিয়াঙ্কা' },
        openingInvocation: '॥ ॐ श्री गणेशाय नमः ॥',
        openingSub: 'Om Shri Ganeshaya Namah',
        blessing: hinduTradition.defaultBlessing
      },
      brideReveal: {
        title: { en: 'Our Sacred Bond', bn: 'শুভ পরিণয় ও আশীর্বাদ' },
        description: {
          en: 'Two souls joined across lifetimes, sanctified by sacred fire and blessed by elders.',
          bn: 'অগ্নিকে সাক্ষী রেখে শুরু হলো এক পবিত্র জীবন, গুরুজনদের আশীর্বাদে ধন্য দুটি প্রাণ।'
        }
      }
    },
    ceremonies: hinduTradition.ceremonies,
    duas: { duas: hinduTradition.defaultDuas, parentBlessings: hinduTradition.parentBlessings },
    gallery: galleryData.gallery
  }
}
