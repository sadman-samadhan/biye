import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertSameOrigin, getCurrentUser, requireAdmin } from '@/lib/server/auth'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'
import { writeAudit } from '@/lib/server/site-data'

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  role: z.enum(['owner', 'editor']).default('owner'),
})

function siteOrigin(req) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(req.url).origin
}

async function loadSite(id) {
  const { data } = await serviceClient().from('sites').select('id, slug').eq('id', id).maybeSingle()
  return data
}

export async function GET(req, { params }) {
  const denied = await requireAdmin()
  if (denied) return denied
  if (!isSupabaseConfigured()) return NextResponse.json({ members: [] })
  const { id } = await params

  const supabase = serviceClient()
  const { data: rows, error } = await supabase
    .from('site_members')
    .select('user_id, role, created_at')
    .eq('site_id', id)
    .order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const members = await Promise.all(
    (rows || []).map(async (row) => {
      const { data } = await supabase.auth.admin.getUserById(row.user_id)
      return {
        userId: row.user_id,
        role: row.role,
        email: data?.user?.email || null,
        lastSignInAt: data?.user?.last_sign_in_at || null,
        createdAt: row.created_at,
      }
    })
  )
  return NextResponse.json({ members })
}

/**
 * Invite a couple member. Returns a one-time link for the operator to send
 * (WhatsApp/email). New accounts get an invite link; existing accounts get a
 * sign-in link. Either lands on /dashboard/set-password.
 */
export async function POST(req, { params }) {
  const denied = (await requireAdmin()) || (await assertSameOrigin())
  if (denied) return denied
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  const { id } = await params

  const parsed = inviteSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  const { email, role } = parsed.data

  const site = await loadSite(id)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const supabase = serviceClient()
  let type = 'invite'
  let { data, error } = await supabase.auth.admin.generateLink({ type, email })
  if (error && /already|registered|exists/i.test(error.message)) {
    type = 'magiclink'
    ;({ data, error } = await supabase.auth.admin.generateLink({ type, email }))
  }
  if (error || !data?.user || !data?.properties?.hashed_token) {
    return NextResponse.json({ error: error?.message || 'Could not create the invite' }, { status: 500 })
  }

  const operator = await getCurrentUser()
  const { error: memberError } = await supabase
    .from('site_members')
    .upsert({ site_id: id, user_id: data.user.id, role, invited_by: operator?.id || null }, { onConflict: 'site_id,user_id' })
  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 })

  const link = new URL('/auth/confirm', siteOrigin(req))
  link.searchParams.set('token_hash', data.properties.hashed_token)
  link.searchParams.set('type', type)
  link.searchParams.set('next', '/dashboard/set-password')

  await writeAudit({ actorKind: 'admin', actorId: operator?.id, siteId: id, action: 'member.invite', meta: { email, role } })
  return NextResponse.json({ success: true, link: link.toString(), existingAccount: type === 'magiclink' })
}

export async function DELETE(req, { params }) {
  const denied = (await requireAdmin()) || (await assertSameOrigin())
  if (denied) return denied
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  const { id } = await params
  const userId = req.nextUrl.searchParams.get('userId')
  if (!z.string().uuid().safeParse(userId).success) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { error } = await serviceClient().from('site_members').delete().eq('site_id', id).eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const operator = await getCurrentUser()
  await writeAudit({ actorKind: 'admin', actorId: operator?.id, siteId: id, action: 'member.remove', meta: { userId } })
  return NextResponse.json({ success: true })
}
