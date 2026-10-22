import SitePage from '@/site/SitePage'

/** /{slug}/invite — always the invitation, whatever the phase. */
export default async function InvitePage({ params, searchParams }) {
  const { slug } = await params
  return <SitePage slug={slug} query={(await searchParams) || {}} view="invite" />
}
