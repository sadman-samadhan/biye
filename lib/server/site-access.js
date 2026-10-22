import 'server-only'
import { headers } from 'next/headers'
import { serviceClient } from './supabase'
import { decryptPasscode, encryptPasscode, newPasscode, unlockKey } from './guest-access'

export function siteOrigin(req) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(req.url).origin
}

/** Same as siteOrigin, for server components (no request object). */
export async function pageOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (configured) return configured
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host')
  return host ? `${h.get('x-forwarded-proto') || 'https'}://${host}` : ''
}

/** The site_access row, created with a fresh passcode if this site predates it. */
export async function ensureSiteAccess(siteId) {
  const supabase = serviceClient()
  const { data } = await supabase.from('site_access').select('*').eq('site_id', siteId).maybeSingle()
  if (data?.passcode_enc) return data
  const passcode_enc = encryptPasscode(newPasscode())
  const { data: row, error } = await supabase
    .from('site_access')
    .upsert({ site_id: siteId, passcode_enc }, { onConflict: 'site_id' })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

/** What the couple sees in "Privacy & sharing". */
export function describeAccess(row, site, origin) {
  return {
    inviteAccess: row.invite_access,
    siteAccess: row.site_access,
    messageModeration: row.message_moderation,
    watermarkMode: row.watermark_mode,
    passcode: decryptPasscode(row.passcode_enc),
    passcodeVersion: row.passcode_version,
    siteUrl: `${origin}/${site.slug}`,
    unlockUrl: `${origin}/${site.slug}/u/${unlockKey(site.id, row.passcode_version)}`,
  }
}
