import { NextResponse } from 'next/server'
import { checkAdminPassword, endAdminSession, isAdminRequest, startAdminSession } from '@/lib/server/admin-session'
import { isAdminAuthConfigured } from '@/lib/server/admin-token'
import { clientIp, hitLimit, isLimited } from '@/lib/server/rate-limit'

const FAILURE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 }

export async function POST(req) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: 'Admin login is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.' },
      { status: 503 }
    )
  }

  const key = `admin-login:${clientIp(req)}`
  if (isLimited(key, FAILURE_LIMIT)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  let password
  try {
    ;({ password } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!checkAdminPassword(password)) {
    hitLimit(key, FAILURE_LIMIT)
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  await startAdminSession()
  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminRequest() })
}

export async function DELETE() {
  await endAdminSession()
  return NextResponse.json({ success: true })
}
