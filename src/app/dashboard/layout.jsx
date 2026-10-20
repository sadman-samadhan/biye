import Link from 'next/link'
import BrandLogo from '@/components/brand/BrandLogo'
import DeveloperCredit from '@/components/brand/DeveloperCredit'
import { requireUserPage } from '@/lib/server/auth'

export const metadata = {
  title: 'Your wedding | ShubhoBiye',
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }) {
  const user = await requireUserPage('/dashboard')

  return (
    <div className="min-h-screen bg-[#FBF6EE] text-[#1E1A17] flex flex-col">
      <header className="border-b border-[#E8DFD2] bg-[#FBF6EE]/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" aria-label="Your sites">
            <BrandLogo height={34} />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {user.isAdmin && (
              <Link href="/admin" className="rounded-md px-3 py-1.5 text-[#6B625A] hover:bg-[#F1E8DA] hover:text-[#1E1A17]">
                Admin console
              </Link>
            )}
            <span className="hidden text-[#6B625A] sm:inline">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="rounded-md border border-[#E2D8C9] px-3 py-1.5 hover:bg-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">{children}</main>
      <footer className="border-t border-[#E8DFD2] py-6 text-center text-xs text-[#6B625A]">
        <DeveloperCredit />
      </footer>
    </div>
  )
}
