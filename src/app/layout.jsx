import { Cormorant_Garamond, Inter, Amiri, Galada, Tiro_Devanagari_Sanskrit } from 'next/font/google'
import './globals.css'
import PageLoader from '@/components/PageLoader'

const cormorant = Cormorant_Garamond({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
})

const galada = Galada({
  weight: ['400'],
  subsets: ['bengali'],
  variable: '--font-bangla',
  display: 'swap',
})

const tiroSanskrit = Tiro_Devanagari_Sanskrit({
  weight: ['400'],
  subsets: ['devanagari', 'latin'],
  variable: '--font-sanskrit',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'AmarBiye — Bespoke Digital Wedding Websites | আমার বিয়ে',
  description: 'Create breathtaking, cinematic wedding websites for Bangladeshi & South Asian couples. Personalized color palettes, ceremony timelines, and digital guest blessings.',
  openGraph: {
    title: 'AmarBiye — Bespoke Digital Wedding Websites',
    description: 'Transform your wedding into a timeless digital heirloom.',
    images: ['/wedding-logo.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${amiri.variable} ${galada.variable} ${tiroSanskrit.variable}`}>
      <body className="antialiased bg-bone text-graphite">
        <PageLoader />
        {children}
      </body>
    </html>
  )
}