import 'server-only'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, createAdminToken, verifyAdminToken } from './admin-token'

export function checkAdminPassword(input) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || typeof input !== 'string' || !input) return false
  const a = createHash('sha256').update(input).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function isAdminRequest() {
  const cookieStore = await cookies()
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value)
}

/**
 * Route-handler guard. Returns a 401 response when the caller is not an admin, otherwise null.
 * Usage: const denied = await requireAdmin(); if (denied) return denied
 */
export async function requireAdmin() {
  if (await isAdminRequest()) return null
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function startAdminSession() {
  const token = await createAdminToken()
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_SECONDS,
  })
}

export async function endAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
}
