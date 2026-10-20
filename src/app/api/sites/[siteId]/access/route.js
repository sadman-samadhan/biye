import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { getSiteById, writeAudit } from '@/lib/server/site-data'
import { describeAccess, ensureSiteAccess, siteOrigin } from '@/lib/server/site-access'

const patchSchema = z
  .object({
    inviteAccess: z.enum(['public', 'passcode']).optional(),
    siteAccess: z.enum(['public', 'passcode']).optional(),
    messageModeration: z.enum(['auto', 'manual']).optional(),
    watermarkMode: z.enum(['off', 'site']).optional(),
  })
  .strict()

export async function GET(req, { params }) {
  const { siteId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const site = await getSiteById(siteId)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const row = await ensureSiteAccess(siteId)
  return NextResponse.json(describeAccess(row, site, siteOrigin(req)), { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function PATCH(req, { params }) {
  const { siteId } = await params
  const { denied, user, isAdmin } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid settings' }, { status: 400 })
  const { inviteAccess, siteAccess, messageModeration, watermarkMode } = parsed.data

  await ensureSiteAccess(siteId)
  const update = {
    ...(inviteAccess ? { invite_access: inviteAccess } : {}),
    ...(siteAccess ? { site_access: siteAccess } : {}),
    ...(messageModeration ? { message_moderation: messageModeration } : {}),
    ...(watermarkMode ? { watermark_mode: watermarkMode } : {}),
    updated_at: new Date().toISOString(),
  }
  const { data: row, error } = await serviceClient().from('site_access').update(update).eq('site_id', siteId).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({ actorKind: isAdmin ? 'admin' : 'member', actorId: user.id, siteId, action: 'access.update', meta: parsed.data })
  const site = await getSiteById(siteId)
  return NextResponse.json(describeAccess(row, site, siteOrigin(req)))
}
