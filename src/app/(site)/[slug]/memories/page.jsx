import SitePage from '@/site/SitePage'

/** /{slug}/memories — the full site with the gallery, once the couple publishes it. */
export default async function MemoriesPage({ params, searchParams }) {
  const { slug } = await params
  return <SitePage slug={slug} query={(await searchParams) || {}} view="memories" />
}
