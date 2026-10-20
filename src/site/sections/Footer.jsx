import Link from 'next/link'
import { Mail, MessageCircle } from 'lucide-react'
import DeveloperCredit from '@/components/brand/DeveloperCredit'
import { Bilingual } from '../primitives/text'

export default function Footer({ names, thankYou, photographer, contact = {}, copy, year, scheme = 'dark' }) {
  const phone = (contact.whatsapp || contact.phone || '').replace(/[^\d+]/g, '')
  return (
    <footer className="bg-t-inverse px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-20 text-t-on-inverse">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="t-display text-3xl md:text-4xl">{names?.en}</p>
        {names?.bn && (
          <p lang="bn" className="mt-1 font-t-bn-display text-xl text-t-accent-warm">
            {names.bn}
          </p>
        )}
        <Bilingual value={thankYou?.en || thankYou?.bn ? thankYou : copy['footer.thanks']} className="mt-6 max-w-lg space-y-1" enClassName="text-t-on-inverse/80" bnClassName="text-sm text-t-on-inverse/60" />

        {(contact.email || phone) && (
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 rounded-full border border-t-on-inverse/20 px-4 py-2 text-sm hover:border-t-accent-warm">
                <Mail size={15} /> {contact.email}
              </a>
            )}
            {phone && (
              <a href={`https://wa.me/${phone.replace(/^\+/, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-t-on-inverse/20 px-4 py-2 text-sm hover:border-t-accent-warm">
                <MessageCircle size={15} /> WhatsApp
              </a>
            )}
          </div>
        )}

        <div className="mt-16 flex w-full flex-col items-center justify-between gap-3 border-t border-t-on-inverse/10 pt-6 text-xs text-t-on-inverse/55 sm:flex-row">
          <p>
            © {year} {names?.en}
            {photographer && ` · ${photographer}`}
          </p>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-5">
            <p>
              {copy['footer.madeWith'].en}{' '}
              <Link href="/" className="font-medium text-t-accent-warm hover:underline">
                ShubhoBiye
              </Link>
            </p>
            <DeveloperCredit tone={scheme === 'light' ? 'light' : 'dark'} />
          </div>
        </div>
      </div>
    </footer>
  )
}
