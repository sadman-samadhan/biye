import { NextResponse } from 'next/server'
import { authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { getSiteAccess, getSiteContent } from '@/lib/server/site-data'
import { loadMedia, signMedia } from '@/lib/server/media/resolve'
import { collectMediaIds } from '@/lib/media-ref'

// Columns a couple can see about their own site (operator CRM fields stay hidden)
const MEMBER_SITE_FIELDS = [
  'id', 'slug', 'status', 'wedding_type', 'tradition_variant', 'template_id', 'palette', 'palette_options',
  'selected_palette_index', 'theme_settings', 'default_locale', 'products', 'plan', 'plan_expiry_date',
  'phase_override', 'memories_published', 'public_contact', 'storage_used_bytes', 'storage_quota_bytes',
  'created_at', 'updated_at',
]

/** Editor payload for the couple dashboard / operator editor. */
export async function GET(req, { params }) {
  const { siteId } = await params
  const { denied, isAdmin, role } = await authorizeSite(siteId)
  if (denied) return denied

  const supabase = serviceClient()
  const { data: site } = await supabase
    .from('sites')
    .select(isAdmin ? '*' : MEMBER_SITE_FIELDS.join(','))
    .eq('id', siteId)
    .maybeSingle()
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [content, access, { data: messages }] = await Promise.all([
    getSiteContent(siteId),
    getSiteAccess(siteId),
    supabase
      .from('messages')
      .select('id, name, name_bn, message, message_bn, approved, created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  // Preview URLs for every photo the content references (the editor shows tokens as images)
  const rows = await loadMedia(siteId, collectMediaIds(content))
  const mediaUrls = await signMedia([...rows.values()])

  return NextResponse.json({
    role,
    site,
    ...content,
    mediaUrls,
    access: access
      ? {
          inviteAccess: access.invite_access,
          siteAccess: access.site_access,
          messageModeration: access.message_moderation,
          watermarkMode: access.watermark_mode,
          hasPasscode: Boolean(access.passcode_enc),
        }
      : null,
    messages: messages || [],
  })
}
