import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { deleteMediaRows } from '@/lib/server/media/gc'

const patchSchema = z
  .object({
    alt: z.string().max(300).optional(),
    caption: z.object({ en: z.string().max(500).optional(), bn: z.string().max(500).optional() }).optional(),
    album: z.string().max(64).nullable().optional(),
    isPublic: z.boolean().optional(),
  })
  .strict()

export async function PATCH(req, { params }) {
  const { siteId, mediaId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { isPublic, ...rest } = parsed.data
  const update = { ...rest, ...(isPublic !== undefined ? { is_public: isPublic } : {}), updated_at: new Date().toISOString() }

  const { data, error } = await serviceClient().from('media').update(update).eq('id', mediaId).eq('site_id', siteId).select('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

/** Deletes the file immediately. Content that still references it simply stops showing it. */
export async function DELETE(req, { params }) {
  const { siteId, mediaId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const { data: row } = await serviceClient()
    .from('media')
    .select('id, storage_key, variants, bytes_total')
    .eq('id', mediaId)
    .eq('site_id', siteId)
    .maybeSingle()
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await deleteMediaRows(siteId, [row])
  return NextResponse.json({ success: true })
}
