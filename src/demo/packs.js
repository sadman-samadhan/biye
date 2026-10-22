import { getTradition, isAnchorCeremony, sortCeremonies } from '@/traditions'
import { THEMES, getTheme } from '@/themes/registry'
import { formatEventDay } from '@/lib/dates'
import { DEMO_PHOTOS } from './photos'

/**
 * Demo sites for the marketing pages: every theme with every tradition's
 * wording, a fictional couple and the openly licensed demo photos. Built from
 * code, so demos never touch the database or a real couple's content.
 */

export const DEMO_TRADITIONS = ['muslim', 'hindu', 'christian', 'buddhist', 'universal']
export const DEMO_THEMES = Object.keys(THEMES)

const photo = (id) => DEMO_PHOTOS[id]?.src || ''

// Which photos each tradition's demo uses
const PICKS = {
  muslim: { cover: 'henna-bangles', spotlight: 'rings-roses', story: ['henna-palm', 'marigolds', 'ring-box'], events: ['marigold-garland', 'henna-green', 'stage', 'stage-flowers', 'stage-2'] },
  hindu: { cover: 'topor', spotlight: 'topor-yellow', story: ['marigold-garland', 'henna-red', 'flower-basket'], events: ['marigolds', 'henna-bangles', 'marigold-stall', 'stage', 'stage-flowers', 'stage-2', 'henna-palm'] },
  christian: { cover: 'rings-book', spotlight: 'rings-roses', story: ['rings', 'stage-flowers', 'ring-box'], events: ['stage', 'rings-roses', 'stage-2'] },
  buddhist: { cover: 'marigolds', spotlight: 'flower-basket', story: ['marigold-stall', 'rings', 'stage-flowers'], events: ['marigold-garland', 'stage', 'stage-2'] },
  universal: { cover: 'rings-roses', spotlight: 'ring-box', story: ['rings', 'marigolds', 'stage-flowers'], events: ['marigold-garland', 'stage', 'stage-2', 'henna-palm'] },
}

const GALLERY = ['henna-bangles', 'marigolds', 'rings-roses', 'stage-flowers', 'henna-palm', 'marigold-garland', 'ring-box', 'stage', 'henna-red', 'flower-basket', 'rings', 'marigold-stall']

const STORY = [
  { year: '2019', title: { en: 'A borrowed umbrella', bn: 'ধার করা ছাতা' }, story: { en: 'Monsoon in Dhanmondi, one umbrella, two strangers late for the same class.', bn: 'ধানমন্ডিতে বর্ষার দিন, একটি ছাতা, একই ক্লাসে দেরি করা দুজন।' } },
  { year: '2022', title: { en: 'Chattogram by train', bn: 'ট্রেনে চট্টগ্রাম' }, story: { en: 'Six hours, endless cha, and the first time we talked about forever.', bn: 'ছয় ঘণ্টা, অফুরন্ত চা, আর প্রথমবার চিরদিনের কথা।' } },
  { year: '2026', title: { en: 'The question', bn: 'প্রশ্নটা' }, story: { en: 'On the rooftop at sunset, with both mothers secretly watching.', bn: 'সূর্যাস্তে ছাদে, দুই মা লুকিয়ে দেখছিলেন।' } },
]

const VENUES = [
  { en: 'Family home, Dhanmondi', bn: 'পারিবারিক বাসভবন, ধানমন্ডি', address: { en: 'Road 27, Dhanmondi, Dhaka', bn: 'রোড ২৭, ধানমন্ডি, ঢাকা' } },
  { en: 'The Garden Hall, Gulshan', bn: 'দ্য গার্ডেন হল, গুলশান', address: { en: 'Gulshan Avenue, Dhaka', bn: 'গুলশান এভিনিউ, ঢাকা' } },
  { en: 'Riverside Pavilion, Purbachal', bn: 'রিভারসাইড প্যাভিলিয়ন, পূর্বাচল', address: { en: 'Purbachal, Dhaka', bn: 'পূর্বাচল, ঢাকা' } },
]

// Dates always about two months ahead, so the invitation's countdown and RSVP are live
function eventDates(count, now = new Date()) {
  const start = new Date(now.getTime() + 56 * 86400000)
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10)
    return `${day}T${i % 2 ? '19:30' : '17:00'}:00+06:00`
  })
}

const isDemoTheme = (id) => Boolean(THEMES[id])
export const isDemoTradition = (id) => DEMO_TRADITIONS.includes(id)
export const isDemo = (themeId, traditionId) => isDemoTheme(themeId) && isDemoTradition(traditionId)

/** Fictional families named after the tradition's placeholder couple. */
function hostsFor(names) {
  const [bride, groom] = (names.en || '').split(' & ')
  const [brideBn, groomBn] = (names.bn || '').split(' ও ')
  return [
    { side: 'bride', relation: 'daughter', child: { en: bride || '', bn: brideBn || '' }, parents: { en: 'Mr. & Mrs. Rahman', bn: 'জনাব ও মিসেস রহমান' }, address: { en: 'Dhanmondi, Dhaka', bn: 'ধানমন্ডি, ঢাকা' } },
    { side: 'groom', relation: 'son', child: { en: groom || '', bn: groomBn || '' }, parents: { en: 'Mr. & Mrs. Chowdhury', bn: 'জনাব ও মিসেস চৌধুরী' }, address: { en: 'Chattogram', bn: 'চট্টগ্রাম' } },
  ]
}

/** { site, content } for a demo, shaped exactly like a real site after media resolution. */
export function demoSite(themeId, traditionId, now = new Date()) {
  const theme = getTheme(themeId)
  const tradition = getTradition(traditionId)
  const picks = PICKS[traditionId] || PICKS.universal
  const names = tradition.placeholderCouple || { en: 'Rahim & Karima', bn: 'রহিম ও করিমা' }

  const presets = sortCeremonies(tradition.ceremonies || []).filter((c) => c.enabled !== false).slice(0, 5)
  const dates = eventDates(presets.length, now)
  const ceremonies = presets.map((c, i) => {
    const banner = picks.events[i % picks.events.length]
    const extra = picks.events[(i + 1) % picks.events.length]
    return {
      ...c,
      enabled: true,
      startsAt: dates[i],
      venue: { ...VENUES[i % VENUES.length], mapUrl: 'https://maps.app.goo.gl/' },
      heroImage: photo(banner),
      heroImagePosition: '50% 50%',
      carouselImages: [{ url: photo(banner) }, { url: photo(extra) }],
    }
  })
  const anchor = ceremonies.find((c) => isAnchorCeremony(c)) || ceremonies[ceremonies.length - 1]
  const deadline = anchor ? new Date(new Date(anchor.startsAt).getTime() - 14 * 86400000).toISOString().slice(0, 10) : ''

  const site = {
    id: `demo-${themeId}-${traditionId}`,
    slug: `demo/${themeId}/${traditionId}`,
    status: 'live',
    wedding_type: traditionId,
    template_id: theme.id,
    theme_settings: { paletteId: theme.palettes[0]?.id },
    palette: null,
    products: ['invite', 'site'],
    public_contact: {},
    owner_name: names.en,
    created_at: now.toISOString(),
  }

  const content = {
    version: 1,
    content: {
      hero: {
        coupleNames: names,
        date: formatEventDay(anchor?.startsAt) || undefined,
        mediaType: 'image',
        posterPath: photo(picks.cover),
        posterPosition: '50% 50%',
      },
      brideReveal: {
        title: { en: 'Two families, one table', bn: 'দুই পরিবার, এক টেবিল' },
        description: {
          en: 'A plate of mishti, a lot of happy tears, and an evening when our story became everyone’s.',
          bn: 'এক থালা মিষ্টি, অনেক আনন্দের অশ্রু, আর সেই সন্ধ্যা যখন আমাদের গল্প সবার হয়ে গেল।',
        },
        imagePath: photo(picks.spotlight),
      },
      story: { title: { en: 'Our Journey', bn: 'আমাদের পথচলা' }, milestones: STORY.map((m, i) => ({ ...m, imagePath: photo(picks.story[i]) })) },
      blessing: tradition.defaultBlessing,
      footer: { thankYou: { en: 'Thank you for being part of our story.', bn: 'আমাদের গল্পের অংশ হওয়ার জন্য ধন্যবাদ।' } },
      sectionToggles: { messages: false },
    },
    ceremonies,
    duas: { duas: tradition.defaultDuas || [], parentBlessings: tradition.parentBlessings || {} },
    gallery: GALLERY.map((id, i) => {
      const p = DEMO_PHOTOS[id]
      return { id, filename: p.src, thumbSrc: p.thumb, width: p.width, height: p.height, alt: p.title, category: ceremonies[i % ceremonies.length]?.id || 'wedding' }
    }),
    invitation: {
      hosts: hostsFor(names),
      signedBy: { en: 'The Rahman and Chowdhury families', bn: 'রহমান ও চৌধুরী পরিবার' },
      photos: picks.story.map((id) => ({ url: photo(id) })),
      rsvp: { enabled: true, deadline, maxParty: 6, collectPhone: false },
    },
  }
  return { site, content, theme, tradition }
}
