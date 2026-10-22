import SitePage from '@/site/SitePage'

/**
 * /{slug} — one link for the whole celebration. What it shows depends on the
 * phase (invitation → live → memories) and on who is looking.
 */
export default async function WeddingSitePage({ params, searchParams }) {
  const { slug } = await params
  return <SitePage slug={slug} query={(await searchParams) || {}} />
}
