#!/usr/bin/env node
/**
 * Creates a fully populated site through the real APIs (login → create → upload
 * → save sections), for reviewing themes locally.
 *
 *   node scripts/seed_preview.mjs <photosDir> [--base=http://localhost:3210] [--slug=theme-review] [--tradition=muslim]
 *
 * photosDir must contain 01.jpg … 12.jpg. Uses the operator account from
 * E2E_OPERATOR_EMAIL / E2E_OPERATOR_PASSWORD (defaults match the local stack).
 */
import fs from 'node:fs'
import path from 'node:path'
import { getTradition, sortCeremonies } from '../src/traditions/index.js'

const args = process.argv.slice(2)
const dir = args.find((a) => !a.startsWith('--'))
const opt = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] || fallback
const BASE = opt('base', 'http://localhost:3210')
const SLUG = opt('slug', 'theme-review')
const TRADITION = opt('tradition', 'muslim')
if (!dir) {
  console.error('Usage: seed_preview.mjs <photosDir> [--base=] [--slug=] [--tradition=]')
  process.exit(1)
}

const jar = new Map()
async function call(pathname, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers: { origin: BASE, cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; '), ...(body && !(body instanceof Uint8Array) ? { 'content-type': 'application/json' } : {}), ...headers },
    body: body && !(body instanceof Uint8Array) ? JSON.stringify(body) : body,
    redirect: 'manual',
  })
  for (const c of res.headers.getSetCookie?.() || []) {
    const [pair] = c.split(';')
    const i = pair.indexOf('=')
    jar.set(pair.slice(0, i), pair.slice(i + 1))
  }
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  if (!res.ok) throw new Error(`${method} ${pathname} → ${res.status}: ${typeof data === 'string' ? data.slice(0, 200) : data.error}`)
  return data
}

async function upload(siteId, file, slot, album) {
  const buffer = fs.readFileSync(path.join(dir, file))
  const start = await call(`/api/sites/${siteId}/uploads`, { method: 'POST', body: { kind: 'image', contentType: 'image/jpeg', bytes: buffer.length, name: file, slot, album } })
  const put = await fetch(start.upload.url, { method: 'PUT', headers: start.upload.headers, body: buffer })
  if (!put.ok) throw new Error(`PUT ${file} → ${put.status}`)
  const { media } = await call(`/api/sites/${siteId}/uploads/${start.mediaId}/complete`, { method: 'POST' })
  process.stdout.write('.')
  return media.token
}

await call('/auth/login', {
  method: 'POST',
  body: { email: process.env.E2E_OPERATOR_EMAIL || 'operator@shubhobiye.test', password: process.env.E2E_OPERATOR_PASSWORD || 'local-operator-pass-123' },
})

const existing = (await call('/api/admin/sites')).sites.find((s) => s.slug === SLUG)
if (existing) {
  await call(`/api/admin/sites/${existing.id}`, { method: 'DELETE' }).catch(() => {})
  await call(`/api/admin/sites/${existing.id}?permanent=true`, { method: 'DELETE' })
}

const { site } = await call('/api/admin/sites', {
  method: 'POST',
  body: { slug: SLUG, status: 'live', wedding_type: TRADITION, products: ['site'], owner_name: 'Ayesha & Rafiq', content: { hero: { coupleNames: { en: 'Ayesha & Rafiq', bn: 'আয়েশা ও রফিক' } } } },
})
console.log('site', site.id)

const t = {}
for (const [key, file, slot, album] of [
  ['hero', '03.jpg', 'hero'],
  ['spot', '05.jpg', 'spotlight'],
  ['s1', '07.jpg', 'story'],
  ['s2', '04.jpg', 'story'],
  ['s3', '09.jpg', 'story'],
  ['holud', '02.jpg', 'ceremony', 'gaye-holud'],
  ['akht', '01.jpg', 'ceremony', 'akht'],
  ['biye', '08.jpg', 'ceremony', 'biye'],
  ['bou', '10.jpg', 'ceremony', 'bou-bhat'],
  ['c1', '12.jpg', 'ceremony', 'gaye-holud'],
  ['c2', '11.jpg', 'ceremony', 'bou-bhat'],
  ['g6', '06.jpg', 'gallery', 'gaye-holud'],
]) {
  t[key] = await upload(site.id, file, slot, album)
}
console.log()

const save = async (section, data) => call(`/api/sites/${site.id}/content`, { method: 'PATCH', body: { section, data } })
await save('hero', {
  coupleNames: { en: 'Ayesha & Rafiq', bn: 'আয়েশা ও রফিক' },
  date: { en: '12 December 2026', bn: '১২ ডিসেম্বর ২০২৬' },
  mediaType: 'image',
  posterPath: t.hero,
  posterPosition: '50% 30%',
})
await save('brideReveal', {
  title: { en: 'Our Families Said Yes', bn: 'পরিবারের সম্মতিতে এক হলো দুটি মন' },
  description: {
    en: 'Two families, one table, a plate of mishti and a lot of happy tears. That evening our story became everyone’s.',
    bn: 'দুই পরিবার, এক টেবিল, এক থালা মিষ্টি আর অনেক আনন্দের অশ্রু। সেই সন্ধ্যায় আমাদের গল্প সবার হয়ে গেল।',
  },
  imagePath: t.spot,
  imagePosition: '50% 40%',
})
await save('story', {
  title: { en: 'Our Journey', bn: 'আমাদের পথচলা' },
  milestones: [
    { year: '2019', title: { en: 'A borrowed umbrella', bn: 'ধার করা ছাতা' }, story: { en: 'Monsoon in Dhanmondi, one umbrella, two strangers late for the same class.', bn: 'ধানমন্ডিতে বর্ষার দিন, একটি ছাতা, একই ক্লাসে দেরি করা দুজন।' }, imagePath: t.s1 },
    { year: '2022', title: { en: 'Chittagong by train', bn: 'ট্রেনে চট্টগ্রাম' }, story: { en: 'Six hours, endless cha, and the first time we talked about forever.', bn: 'ছয় ঘণ্টা, অফুরন্ত চা, আর প্রথমবার চিরদিনের কথা।' }, imagePath: t.s2 },
    { year: '2026', title: { en: 'The question', bn: 'প্রশ্নটা' }, story: { en: 'On the rooftop at sunset, with both mothers secretly watching.', bn: 'সূর্যাস্তে ছাদে, দুই মা লুকিয়ে দেখছিলেন।' }, imagePath: t.s3 },
  ],
})

const tradition = getTradition(TRADITION)
const traditionCeremonies = sortCeremonies(tradition.ceremonies)
await save('duas', { duas: tradition.defaultDuas, parentBlessings: tradition.parentBlessings })
await save('blessing', tradition.defaultBlessing)
const extras = {
  'gaye-holud': { heroImage: t.holud, carouselImages: [{ url: t.holud }, { url: t.c1 }, { url: t.g6 }], startsAt: '2026-12-10T17:00:00+06:00', venue: { en: 'Family home, Dhanmondi', bn: 'পারিবারিক বাসভবন, ধানমন্ডি', mapUrl: 'https://maps.app.goo.gl/example1' } },
  akht: { heroImage: t.akht, startsAt: '2026-12-11T11:00:00+06:00', venue: { en: 'Baitul Aman Mosque', bn: 'বায়তুল আমান মসজিদ', mapUrl: 'https://maps.app.goo.gl/example2' } },
  biye: { heroImage: t.biye, startsAt: '2026-12-12T19:30:00+06:00', venue: { en: 'Bashundhara Convention Centre', bn: 'বসুন্ধরা কনভেনশন সেন্টার', mapUrl: 'https://maps.app.goo.gl/example3' } },
  'bou-bhat': { heroImage: t.bou, carouselImages: [{ url: t.bou }, { url: t.c2 }], startsAt: '2026-12-14T13:00:00+06:00', venue: { en: 'Gulshan Club', bn: 'গুলশান ক্লাব' } },
}
await save(
  'ceremonies',
  traditionCeremonies.map((c) => ({ ...c, ...(extras[c.id] || {}), enabled: c.id === 'mehendi' ? false : c.enabled !== false }))
)
await save('gallery', [
  { filename: t.hero, category: 'biye', alt: 'Bride' },
  { filename: t.holud, category: 'gaye-holud', alt: 'Holud' },
  { filename: t.spot, category: 'bou-bhat', alt: 'Couple' },
  { filename: t.s1, category: 'biye', alt: 'Mala badal' },
  { filename: t.biye, category: 'biye', alt: 'Bride in red' },
  { filename: t.s3, category: 'bou-bhat', alt: 'Bride' },
  { filename: t.c1, category: 'gaye-holud', alt: 'Marigolds' },
  { filename: t.s2, category: 'akht', alt: 'Groom' },
  { filename: t.g6, category: 'gaye-holud', alt: 'Blessing' },
  { filename: t.c2, category: 'bou-bhat', alt: 'Stage' },
])
await call(`/api/sites/${site.id}/access`, { method: 'PATCH', body: { siteAccess: 'public', inviteAccess: 'public' } })
console.log(`ready: ${BASE}/${SLUG}`)
