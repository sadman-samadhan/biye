import { z } from 'zod'
import { toHexColor } from '../palettes.js'

/**
 * Validation for everything couples and operators can write.
 *
 * Content is stored as JSONB and rendered as React text, so the main risks are
 * oversized payloads, script URLs and CSS injection. Known fields get explicit
 * schemas; unknown legacy keys inside nested objects are kept (to avoid data
 * loss) but every string still passes the deep safety check.
 */

const MAX_STRING = 5000
const MAX_DEPTH = 10
const UNSAFE_URL = /^\s*(javascript|vbscript|data:(?!image\/(png|jpe?g|webp|gif|svg\+xml);base64,))/i

/** Throws a ZodError-like issue list when a JSON value is unsafe. Returns issues array. */
export function deepSafetyIssues(value, path = [], depth = 0, issues = []) {
  if (depth > MAX_DEPTH) {
    issues.push({ path, message: 'Nested too deeply' })
    return issues
  }
  if (typeof value === 'string') {
    if (value.length > MAX_STRING && !value.startsWith('data:image/')) issues.push({ path, message: 'Text is too long' })
    if (UNSAFE_URL.test(value)) issues.push({ path, message: 'Unsafe URL' })
  } else if (Array.isArray(value)) {
    if (value.length > 500) issues.push({ path, message: 'Too many items' })
    value.forEach((v, i) => deepSafetyIssues(v, [...path, i], depth + 1, issues))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
        issues.push({ path: [...path, k], message: 'Forbidden key' })
        continue
      }
      deepSafetyIssues(v, [...path, k], depth + 1, issues)
    }
  }
  return issues
}

const str = (max) => z.string().max(max)
const optStr = (max) => str(max).optional().nullable()

export const bilingual = (max = 600) =>
  z.looseObject({ en: optStr(max), bn: optStr(max) })

/** An image/video reference: a URL/path today, a media id once the private media pipeline lands. */
export const mediaRef = z.union([
  z.string().max(2048).refine((v) => !v || /^(https?:\/\/|\/|data:image\/|[\w-]+\/)/.test(v) || /^[\w.-]+$/.test(v), 'Invalid media path'),
  z.looseObject({ mediaId: z.string().uuid(), position: optStr(40) }),
])

export const focalPosition = optStr(40).refine(
  (v) => !v || /^(center|top|bottom|left|right|[\d.]{1,6}%(\s+[\d.]{1,6}%)?|[a-z]+\s+[a-z]+)$/i.test(v),
  'Invalid focal position'
)

const httpsUrl = z
  .string()
  .max(2048)
  .refine((v) => !v || /^https:\/\//i.test(v), 'Must be an https:// link')

const blessingSchema = z.looseObject({
  ar: optStr(2000),
  sa: optStr(2000),
  en: optStr(2000),
  bn: optStr(2000),
  reference: optStr(200),
})

export const sectionSchemas = {
  hero: z.looseObject({
    coupleNames: bilingual(120).optional(),
    date: bilingual(120).optional(),
    openingInvocation: optStr(300),
    openingSub: optStr(300),
    blessing: blessingSchema.optional(),
    mediaType: z.enum(['image', 'photo', 'video']).optional().nullable(),
    posterPath: mediaRef.optional().nullable(),
    posterPosition: focalPosition,
    videoPath: mediaRef.optional().nullable(),
  }),
  brideReveal: z.looseObject({
    title: bilingual(200).optional(),
    description: bilingual(2000).optional(),
    imagePath: mediaRef.optional().nullable(),
    imagePosition: focalPosition,
  }),
  story: z.looseObject({
    title: bilingual(200).optional(),
    milestones: z
      .array(
        z.looseObject({
          year: optStr(40),
          title: bilingual(200).optional(),
          story: bilingual(3000).optional(),
          imagePath: mediaRef.optional().nullable(),
          imagePosition: focalPosition,
        })
      )
      .max(30),
  }),
  footer: z.looseObject({
    thankYou: bilingual(1000).optional(),
    photographer: optStr(200),
    copyright: optStr(200),
  }),
  blessing: blessingSchema,
  sectionToggles: z.record(z.string().max(40), z.boolean()),
  logoUrl: mediaRef.nullable(),
  ceremonies: z
    .array(
      z.looseObject({
        id: str(64).regex(/^[a-z0-9][a-z0-9-_]*$/i),
        slug: optStr(64),
        title: bilingual(200).optional(),
        subtitle: bilingual(300).optional(),
        description: bilingual(4000).optional(),
        culturalNote: bilingual(2000).optional(),
        date: bilingual(120).optional(),
        venue: z.looseObject({ en: optStr(300), bn: optStr(300), mapUrl: httpsUrl.optional().nullable() }).optional(),
        startsAt: optStr(40),
        endsAt: optStr(40),
        enabled: z.boolean().optional(),
        accentColor: optStr(40),
        heroImage: mediaRef.optional().nullable(),
        heroImagePosition: focalPosition,
        carouselImages: z.array(z.union([mediaRef, z.looseObject({ url: mediaRef, position: focalPosition })])).max(10).optional(),
        galleryImages: z.array(z.any()).max(100).optional(),
        beats: z.array(z.looseObject({ label: optStr(120), title: bilingual(200).optional(), description: bilingual(2000).optional() })).max(20).optional(),
        flow: z.array(z.any()).max(20).optional(),
        liveStreamUrl: httpsUrl.optional().nullable(),
      })
    )
    .max(20),
  duas: z.looseObject({
    duas: z.array(z.record(z.string(), z.any())).max(20).optional(),
    parentBlessings: z
      .looseObject({ title: bilingual(200).optional(), message: bilingual(3000).optional(), attribution: bilingual(300).optional() })
      .optional(),
  }),
  gallery: z
    .array(
      z.looseObject({
        filename: mediaRef.optional(),
        mediaId: z.string().uuid().optional(),
        category: optStr(64),
        alt: optStr(300),
        caption: bilingual(500).optional(),
        width: z.number().int().positive().max(20000).optional(),
        height: z.number().int().positive().max(20000).optional(),
      })
    )
    .max(1000),
  invitation: z.record(z.string(), z.any()),
}

/** Sections stored inside site_content.content vs. their own columns. */
export const CONTENT_SECTIONS = new Set(['hero', 'brideReveal', 'story', 'footer', 'blessing', 'sectionToggles', 'logoUrl'])
export const COLUMN_SECTIONS = new Set(['ceremonies', 'duas', 'gallery', 'invitation'])

export function validateSection(section, data) {
  const schema = sectionSchemas[section]
  if (!schema) return { ok: false, issues: [{ path: ['section'], message: `Unknown section "${section}"` }] }
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues.map(({ path, message }) => ({ path, message })) }
  }
  const issues = deepSafetyIssues(parsed.data)
  return issues.length ? { ok: false, issues } : { ok: true, data: parsed.data }
}

// ---- Site settings (columns on `sites`) ---------------------------------------

export const TRADITION_IDS = ['muslim', 'hindu', 'christian', 'buddhist', 'universal', 'general']

const paletteSchema = z
  .looseObject({
    id: optStr(64),
    name: optStr(80),
    description: optStr(300),
  })
  .transform((p, ctx) => {
    const roles = {}
    for (const [key, value] of Object.entries(p)) {
      if (['id', 'name', 'description'].includes(key)) continue
      if (value === undefined || value === null || value === '') continue
      const hex = toHexColor(value)
      if (!hex) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'Colors must be hex values like #a67c52' })
        return z.NEVER
      }
      roles[key] = hex
    }
    return { ...(p.id ? { id: p.id } : {}), ...(p.name ? { name: p.name } : {}), ...(p.description ? { description: p.description } : {}), ...roles }
  })

/** Settings a couple may change. Operators may additionally change ADMIN_SITE_FIELDS. */
export const memberSettingsSchema = z
  .object({
    palette: paletteSchema.optional(),
    palette_options: z.array(paletteSchema).max(12).optional(),
    selected_palette_index: z.number().int().min(0).max(20).optional(),
    wedding_type: z.enum(TRADITION_IDS).optional(),
    tradition_variant: optStr(40),
    template_id: z.string().regex(/^[a-z0-9-]{2,32}$/).optional(),
    theme_settings: z.record(z.string(), z.any()).optional(),
    default_locale: z.enum(['bn', 'en']).optional(),
    public_contact: z
      .object({ email: z.string().email().max(200).optional().or(z.literal('')), phone: optStr(30), whatsapp: optStr(30) })
      .optional(),
    memories_published: z.boolean().optional(),
  })
  .strict()

export const adminSiteSchema = z
  .object({
    slug: z.string().max(48).optional(),
    status: z.enum(['draft', 'live', 'expired', 'archived']).optional(),
    plan: z.string().regex(/^[a-z0-9-]{2,32}$/).optional(),
    products: z.array(z.enum(['invite', 'site'])).min(1).max(2).optional(),
    plan_expiry_date: z.string().datetime({ offset: true }).nullable().optional(),
    phase_override: z.enum(['invitation', 'live', 'memories']).nullable().optional(),
    storage_quota_bytes: z.number().int().positive().nullable().optional(),
    owner_name: optStr(200),
    owner_email: z.string().email().max(200).optional().nullable().or(z.literal('')),
    owner_phone: optStr(40),
  })
  .strict()

export function validateSettings(body, { isAdmin }) {
  const memberKeys = Object.keys(memberSettingsSchema.shape)
  const memberPart = {}
  const adminPart = {}
  for (const [key, value] of Object.entries(body || {})) {
    if (memberKeys.includes(key)) memberPart[key] = value
    else adminPart[key] = value
  }
  if (!isAdmin && Object.keys(adminPart).length) {
    return { ok: false, issues: Object.keys(adminPart).map((k) => ({ path: [k], message: 'Not allowed' })) }
  }
  const member = memberSettingsSchema.safeParse(memberPart)
  const admin = adminSiteSchema.safeParse(adminPart)
  const issues = [...(member.success ? [] : member.error.issues), ...(admin.success ? [] : admin.error.issues)].map(
    ({ path, message }) => ({ path, message })
  )
  if (issues.length) return { ok: false, issues }
  const data = { ...member.data, ...admin.data }
  const deep = deepSafetyIssues(data)
  return deep.length ? { ok: false, issues: deep } : { ok: true, data }
}
