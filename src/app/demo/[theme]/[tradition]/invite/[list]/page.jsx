import DemoPage, { demoMetadata } from '@/demo/DemoPage'
import { DEMO_LISTS, DEMO_THEMES, DEMO_TRADITIONS } from '@/demo/packs'

export const dynamicParams = false
export const revalidate = 86400

export function generateStaticParams() {
  return DEMO_THEMES.flatMap((theme) => DEMO_TRADITIONS.flatMap((tradition) => DEMO_LISTS.map((list) => ({ theme, tradition, list }))))
}

export async function generateMetadata({ params }) {
  const { theme, tradition } = await params
  return { ...demoMetadata(theme, tradition, 'invite'), robots: { index: false, follow: true } }
}

/** The demo invitation as one sample guest list sees it. */
export default function DemoGuestListPage({ params }) {
  return <DemoPage params={params} view="invite" />
}
