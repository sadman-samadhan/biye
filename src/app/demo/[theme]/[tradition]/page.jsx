import DemoPage, { demoMetadata } from '@/demo/DemoPage'
import { DEMO_THEMES, DEMO_TRADITIONS } from '@/demo/packs'

export const dynamicParams = false
export const revalidate = 86400 // demo dates move forward with the calendar

export function generateStaticParams() {
  return DEMO_THEMES.flatMap((theme) => DEMO_TRADITIONS.map((tradition) => ({ theme, tradition })))
}

export async function generateMetadata({ params }) {
  const { theme, tradition } = await params
  return demoMetadata(theme, tradition, 'site')
}

export default function DemoSitePage({ params }) {
  return <DemoPage params={params} view="site" />
}
