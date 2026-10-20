import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { getSiteById, writeAudit } from '@/lib/server/site-data'
import { describeAccess, ensureSiteAccess, siteOrigin } from '@/lib/server/site-access'
import { encryptPasscode, newPasscode } from '@/lib/server/guest-access'
import { normalizePasscode, passcodeProblem } from '@/lib/passcode'

/**
 * Set a custom passcode ({ passcode }) or generate a new one ({}).
 * Either way the passcode version increases: every guest is signed out and old
 * unlock links stop working.
 */
export async function POST(req, { params }) {
  const { siteId } = await params
  const { denied, user, isAdmin } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const body = await req.json().catch(() => ({}))
  let passcode = newPasscode()
  if (typeof body.passcode === 'string' && body.passcode.trim()) {
    const problem = passcodeProblem(body.passcode)
    if (problem) return NextResponse.json({ error: problem }, { status: 400 })
    passcode = normalizePasscode(body.passcode)
  }

  const current = await ensureSiteAccess(siteId)
  const { data: row, error } = await serviceClient()
    .from('site_access')
    .update({ passcode_enc: encryptPasscode(passcode), passcode_version: current.passcode_version + 1, updated_at: new Date().toISOString() })
    .eq('site_id', siteId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({ actorKind: isAdmin ? 'admin' : 'member', actorId: user.id, siteId, action: 'access.passcode' })
  return NextResponse.json(describeAccess(row, await getSiteById(siteId), siteOrigin(req)))
}
