import Link from 'next/link'
import { redirect } from 'next/navigation'
import BrandLogo from '@/components/brand/BrandLogo'
import DeveloperCredit from '@/components/brand/DeveloperCredit'
import { getCurrentUser } from '@/lib/server/auth'
import { safeNextPath } from '@/lib/server/redirects'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Sign in | ShubhoBiye',
  robots: { index: false, follow: false },
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const next = safeNextPath(params?.next, '')
  const user = await getCurrentUser()
  if (user) redirect(next || (user.isAdmin ? '/admin' : '/dashboard'))

  return (
    <main className="min-h-screen bg-[#FBF6EE] text-[#1E1A17] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block mb-10" aria-label="ShubhoBiye home">
          <BrandLogo height={44} priority />
        </Link>

        <h1 className="font-display text-3xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-[#6B625A] mb-8">
          For couples managing their wedding site, and the ShubhoBiye team.
        </p>

        {params?.error === 'link' && (
          <p role="alert" className="mb-6 rounded-lg border border-[#E9C7C9] bg-[#FBEDEE] px-4 py-3 text-sm text-[#7A2229]">
            That link has expired or was already used. Ask us for a new one on WhatsApp.
          </p>
        )}

        <LoginForm next={next} />

        <p className="mt-8 text-xs text-[#6B625A]">
          Forgot your password? Message us on WhatsApp and we’ll send you a new sign-in link.
        </p>
      </div>
      <footer className="mt-16 text-xs text-[#6B625A]">
        <DeveloperCredit />
      </footer>
    </main>
  )
}
