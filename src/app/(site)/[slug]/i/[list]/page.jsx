import SitePage from '@/site/SitePage'

/**
 * /{slug}/i/{list} — the link for one guest list. Same as /{slug}, but the
 * invitation lists only the events those guests are invited to.
 */
export default async function GuestListPage({ params, searchParams }) {
  const { slug, list } = await params
  return <SitePage slug={slug} query={(await searchParams) || {}} listId={list} />
}
