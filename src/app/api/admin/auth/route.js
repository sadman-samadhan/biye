import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'amarbiye_admin_session'

export async function POST(req) {
  try {
    const { password } = await req.json()
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (password === adminPassword) {
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)

  return NextResponse.json({
    authenticated: session?.value === 'authenticated'
  })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ success: true })
}
