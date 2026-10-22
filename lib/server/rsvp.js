import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { serviceClient } from './supabase'
import { guestSessionSecret } from './secrets'

/**
 * A guest's own RSVP is remembered with a signed cookie per site holding the
 * reply id, so the same phone can change its answer without an account.
 */

const AUDIENCE = 'shb-rsvp'
const COOKIE_DAYS = 180

export const rsvpCookieName = (siteId) => `shb_r_${String(siteId).replace(/-/g, '')}`

const key = () => new Uint8Array(guestSessionSecret())

export async function readRsvpCookie(siteId) {
  const token = (await cookies()).get(rsvpCookieName(siteId))?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { audience: AUDIENCE, algorithms: ['HS256'] })
    return payload.sid === siteId && typeof payload.rid === 'string' ? payload.rid : null
  } catch {
    return null
  }
}

export async function setRsvpCookie(siteId, rsvpId) {
  const token = await new SignJWT({ sid: siteId, rid: rsvpId })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_DAYS}d`)
    .sign(key())
  ;(await cookies()).set(rsvpCookieName(siteId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_DAYS * 86400,
  })
}

const FIELDS = 'id, name, phone, side, attending, party_size, events, note, created_at, updated_at'

/** The reply this browser sent for a site, or null. */
export async function getOwnRsvp(siteId) {
  const id = await readRsvpCookie(siteId)
  if (!id) return null
  const { data } = await serviceClient().from('rsvps').select(FIELDS).eq('id', id).eq('site_id', siteId).maybeSingle()
  return data || null
}

/** Inserts a reply, or updates this browser's earlier one. Returns the row. */
export async function saveRsvp(siteId, input) {
  const row = {
    name: input.name,
    phone: input.phone || null,
    side: input.side || null,
    attending: input.attending,
    party_size: input.attending ? Math.max(1, input.partySize) : 0,
    events: input.attending ? input.events : [],
    note: input.note || null,
  }
  const supabase = serviceClient()
  const existingId = await readRsvpCookie(siteId)
  if (existingId) {
    const { data } = await supabase
      .from('rsvps')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', existingId)
      .eq('site_id', siteId)
      .select(FIELDS)
      .maybeSingle()
    if (data) return data
  }
  const { data, error } = await supabase.from('rsvps').insert({ site_id: siteId, ...row }).select(FIELDS).single()
  if (error) throw new Error(error.message)
  await setRsvpCookie(siteId, data.id)
  return data
}

/** Public shape for the guest's own reply. */
export const toGuestRsvp = (r) =>
  r && { name: r.name, phone: r.phone || '', side: r.side, attending: r.attending, partySize: r.party_size, events: r.events || [], note: r.note || '' }
