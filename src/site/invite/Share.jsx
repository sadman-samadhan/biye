'use client'

import { useState } from 'react'
import { CalendarPlus, Check, Link2, MessageCircle } from 'lucide-react'
import { Bilingual } from '../primitives/text'

const button =
  'inline-flex items-center justify-center gap-2 rounded-full border border-t-accent/50 px-5 py-2.5 text-sm text-t-accent-strong transition hover:bg-t-accent hover:text-t-on-accent'

/** WhatsApp, copy link, calendar file and a QR code for opening the invitation on another phone. */
export default function Share({ url, text, icsUrl, qr, copy }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt?.(copy['invite.share.copy'].en, url)
    }
  }

  return (
    <section id="share" className="bg-t-bg px-5 py-20 text-center md:py-24">
      <Bilingual value={copy['invite.share.title']} as="h2" enClassName="t-display text-3xl md:text-4xl" bnClassName="mt-1 font-t-bn-display text-lg text-t-ink-muted" />
      <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-3">
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={button}>
          <MessageCircle size={16} /> {copy['invite.share.whatsapp'].en}
        </a>
        <button type="button" onClick={copyLink} className={button}>
          {copied ? <Check size={16} /> : <Link2 size={16} />} {copied ? copy['invite.share.copied'].en : copy['invite.share.copy'].en}
        </button>
        {icsUrl && (
          <a href={icsUrl} download className={button}>
            <CalendarPlus size={16} /> {copy['invite.share.ics'].en}
          </a>
        )}
      </div>
      {qr && (
        <figure className="mx-auto mt-10 hidden w-40 md:block">
          {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URI */}
          <img src={qr} alt="" width={160} height={160} className="h-40 w-40 rounded bg-white p-2" />
          <figcaption className="mt-2 text-xs text-t-ink-muted">{copy['invite.share.qr'].en}</figcaption>
        </figure>
      )}
    </section>
  )
}
