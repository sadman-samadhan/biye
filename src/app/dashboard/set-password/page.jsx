import Link from 'next/link'
import { requireUserPage } from '@/lib/server/auth'
import SetPasswordForm from './SetPasswordForm'

export default async function SetPasswordPage() {
  const user = await requireUserPage('/dashboard/set-password')
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-3xl font-semibold">Choose your password</h1>
      <p className="mt-1 mb-8 text-sm text-[#6B625A]">
        You’ll use <strong className="font-medium text-[#1E1A17]">{user.email}</strong> and this password to sign in.
      </p>
      <SetPasswordForm />
      <p className="mt-6 text-xs text-[#6B625A]">
        By continuing you agree to the{' '}
        <Link href="/terms" className="underline">
          terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">
          privacy notice
        </Link>
        .
      </p>
    </div>
  )
}
