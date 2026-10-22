import Link from 'next/link'
import { DEMO_PHOTOS } from '@/demo/photos'

export const metadata = { title: 'Demo photo credits | ShubhoBiye' }

/** Attribution for the openly licensed photos used on demo sites. */
export default function DemoCreditsPage() {
  return (
    <main className="min-h-screen bg-sb-paper px-5 py-16 text-sb-ink">
      <div className="mx-auto max-w-4xl">
        <Link href="/themes" className="text-sm text-sb-muted hover:text-sb-ink">
          ← All themes
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold">Demo photo credits</h1>
        <p className="mt-3 max-w-2xl text-sb-ink-soft">
          The demo sites use photos from Wikimedia Commons under the licences below. They show details such as hands, flowers, rings and decoration, and no identifiable people. We resized them and removed their metadata; they are otherwise unchanged.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {Object.entries(DEMO_PHOTOS).map(([id, p]) => (
            <li key={id} className="flex gap-4 rounded-xl border border-sb-line bg-sb-card p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- small static thumbnails */}
              <img src={p.thumb} alt="" width={96} height={96} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 text-sm">
                <a href={p.page} target="_blank" rel="noopener noreferrer" className="font-medium underline-offset-2 hover:underline">
                  {p.title}
                </a>
                <p className="mt-1 text-sb-muted">{p.artist || 'Unknown author'}</p>
                <p className="mt-1 text-sb-muted">{p.license}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
