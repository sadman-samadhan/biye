import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { getSiteAccess, getSiteById } from '@/lib/server/site-data'
import { keys, storage } from '@/lib/server/storage'
import { rebuildWebVariant, variantMime } from '@/lib/server/media/process'

export const maxDuration = 60
const BATCH = 12

/**
 * Re-renders the guest-facing size of every photo from its master copy, e.g.
 * after turning the watermark on or off. Call repeatedly while `remaining > 0`.
 * Body: { after?: mediaId } to continue from the last processed item.
 */
export async function POST(req, { params }) {
  const { siteId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const { after } = await req.json().catch(() => ({}))
  const [site, access] = await Promise.all([getSiteById(siteId), getSiteAccess(siteId)])
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const watermarkText = access?.watermark_mode === 'site' ? `shubhobiye.com/${site.slug}` : undefined

  let query = serviceClient()
    .from('media')
    .select('id, storage_key, variants, bytes_total')
    .eq('site_id', siteId)
    .eq('status', 'ready')
    .eq('kind', 'image')
    .order('id')
    .limit(BATCH + 1)
  if (after) query = query.gt('id', after)
  const { data: rows } = await query
  const batch = (rows || []).filter((r) => r.variants?.master).slice(0, BATCH)

  let lastId = after || null
  for (const row of batch) {
    const master = await storage().get(keys.variant(row.storage_key, 'master', row.variants.master.ext))
    lastId = row.id
    if (!master) continue
    const web = await rebuildWebVariant(master, { watermarkText })
    await storage().put(keys.variant(row.storage_key, 'web', web.ext), web.buffer, { contentType: variantMime(web.format) })
    const variants = { ...row.variants, web: { w: web.w, h: web.h, bytes: web.bytes, ext: web.ext } }
    await serviceClient().from('media').update({ variants, updated_at: new Date().toISOString() }).eq('id', row.id)
  }

  return NextResponse.json({ processed: batch.length, after: lastId, remaining: (rows || []).length > BATCH })
}
