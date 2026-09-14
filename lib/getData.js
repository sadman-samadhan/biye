import contentData from '@/data/content.json'
import ceremoniesData from '@/data/ceremonies.json'
import imagesData from '@/data/demo-gallery.json'
import duasData from '@/data/duas.json'
import { supabase, getSupabaseAdmin, isSupabaseConfigured } from './supabase'

// Static fallback data for Rafa & Shawon (built-in demo)
export const DEMO_SITE = {
  id: 'demo-rafa-shawon',
  slug: 'demo',
  status: 'live',
  wedding_type: 'muslim',
  template_id: 'classic',
  owner_name: 'AmarBiye Demo',
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

export const DEMO_CONTENT = {
  content: contentData,
  ceremonies: ceremoniesData.ceremonies,
  duas: duasData,
  gallery: imagesData.gallery
}

/**
 * Fetch a site record by slug.
 * Gracefully falls back to DEMO_SITE if Supabase is offline or if testing 'rafa-shawon'.
 */
export async function getSiteBySlug(slug, allowDraft = true) {
  if (!slug) return null

  if (isSupabaseConfigured) {
    try {
      // Use admin client in server components to avoid public RLS restrictions on drafts
      const client = getSupabaseAdmin()
      let query = client.from('sites').select('*').eq('slug', slug)
      
      // In production, only filter out drafts if explicitly requested
      if (!allowDraft && process.env.NODE_ENV === 'production') {
        query = query.eq('status', 'live')
      }

      const { data, error } = await query.maybeSingle()

      if (data && !error) {
        return data
      }
    } catch (err) {
      console.warn(`[getSiteBySlug] Supabase query failed for slug "${slug}":`, err.message)
    }
  }

  // Fallback for demo slug
  if (slug === 'rafa-shawon' || slug === 'demo') {
    return DEMO_SITE
  }

  if (slug === 'demo-hindu') {
    return {
      ...DEMO_SITE,
      id: 'demo-hindu',
      slug: 'demo-hindu',
      wedding_type: 'hindu',
      owner_name: 'AmarBiye Sanatan Demo',
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
  }

  return null
}

/**
 * Fetch full content for a site by siteId.
 * Gracefully falls back to DEMO_CONTENT for the demo site.
 */
export async function getSiteContent(siteId) {
  if (!siteId) return null

  if (siteId === 'demo-rafa-shawon') {
    return DEMO_CONTENT
  }

  if (siteId === 'demo-hindu') {
    const { TRADITIONS } = await import('./traditions')
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
          description: { en: 'Two souls joined across lifetimes, sanctified by sacred fire and blessed by elders.', bn: 'অগ্নিকে সাক্ষী রেখে শুরু হলো এক পবিত্র জীবন, গুরুজনদের আশীর্বাদে ধন্য দুটি প্রাণ।' }
        }
      },
      ceremonies: hinduTradition.ceremonies,
      duas: { duas: hinduTradition.defaultDuas, parentBlessings: hinduTradition.parentBlessings },
      gallery: imagesData.gallery
    }
  }

  if (isSupabaseConfigured) {
    try {
      const client = getSupabaseAdmin()
      const { data, error } = await client
        .from('site_content')
        .select('*')
        .eq('site_id', siteId)
        .maybeSingle()

      if (data && !error) {
        return {
          content: data.content || {},
          ceremonies: data.ceremonies || [],
          duas: data.duas || { duas: [], parentBlessings: {} },
          gallery: data.gallery || []
        }
      }
    } catch (err) {
      console.warn(`[getSiteContent] Failed for siteId "${siteId}":`, err.message)
    }
  }

  return DEMO_CONTENT
}

/**
 * Convenience helper to get both site record and structured content by slug.
 */
export async function getFullSiteData(slug, allowDraft = false) {
  const site = await getSiteBySlug(slug, allowDraft)
  if (!site) return null

  const content = await getSiteContent(site.id)
  return {
    site,
    ...content
  }
}

// -------------------------------------------------------------
// Existing Static Accessors (Preserved for backward compatibility)
// -------------------------------------------------------------

// Get hero content
export function getHeroContent() {
  return contentData.hero
}

// Get bride reveal content
export function getBrideRevealContent() {
  return contentData.brideReveal
}

// Get story milestones
export function getStoryMilestones() {
  return contentData.story
}

// Get all ceremonies
export function getAllCeremonies() {
  return ceremoniesData.ceremonies
}

// Get ceremony by ID
export function getCeremonyById(id) {
  return ceremoniesData.ceremonies.find(c => c.id === id)
}

// Get all gallery images
export function getAllGalleryImages() {
  return imagesData.gallery.map(img => ({
    ...img,
    src: getImagePath(img.filename)
  }))
}

// Get gallery images by category
export function getGalleryImagesByCategory(category) {
  const allImages = getAllGalleryImages()
  if (category === 'all') return allImages
  return allImages.filter(img => img.category === category)
}

// Get all duas
export function getAllDuas() {
  return duasData.duas
}

// Get parent blessings
export function getParentBlessings() {
  return duasData.parentBlessings
}

// Get footer content
export function getFooterContent() {
  return contentData.footer
}

// Helper: Get image path (handles external URLs, Supabase Storage, and local public images)
export function getImagePath(filename) {
  if (!filename) return '/images/placeholder.jpg'

  // If already an absolute HTTP/HTTPS URL, return as-is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }

  // 1. Remove any leading slashes
  const clean = filename.startsWith('/') ? filename.slice(1) : filename

  // 2. Check if it already starts with "images/"
  if (clean.startsWith('images/')) {
    return `/${clean}`
  }

  return `/images/${clean}`
}

// Helper: Get video path
export function getVideoPath(filename) {
  if (!filename) return ''
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }
  return `/videos/${filename.startsWith('/') ? filename.slice(1) : filename}`
}

// Helper: Get audio path
export function getAudioPath(filename) {
  if (!filename) return ''
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }
  return `/audio/${filename.startsWith('/') ? filename.slice(1) : filename}`
}
