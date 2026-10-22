import Shell from '@/marketing/Shell'
import ThemeGallery from '@/marketing/ThemeGallery'
import { themeCards, traditionList } from '@/marketing/data'
import { MARKETING, MOODS } from '@/i18n/marketing'

export const metadata = {
  title: 'Themes | ShubhoBiye',
  description: 'Six wedding website themes, each with its own layout, typefaces, ornaments and opening. Try every theme with Muslim, Hindu, Christian, Buddhist or non-religious wording.',
}

export default function ThemesPage() {
  const t = MARKETING.en
  return (
    <Shell locale="en">
      <main className="px-5 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-5xl font-semibold">{t.gallery.title}</h1>
          <p className="mt-3 max-w-2xl text-sb-ink-soft">{t.gallery.body}</p>
          <div className="mt-10">
            <ThemeGallery themes={themeCards()} traditions={traditionList()} moods={MOODS} labels={t.gallery} />
          </div>
        </div>
      </main>
    </Shell>
  )
}
