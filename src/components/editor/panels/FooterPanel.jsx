'use client'

import { BilingualField, TextInput } from '@/ui'
import PanelFrame from '../PanelFrame'
import { usePanelDraft } from '../usePanelDraft'

export default function FooterPanel({ data, saveContent, saveSettings, onDirtyChange }) {
  const footer = data.content.footer || {}
  const contact = data.site.public_contact || {}
  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      thankYou: footer.thankYou || { en: '', bn: '' },
      photographer: footer.photographer || '',
      email: contact.email || '',
      whatsapp: contact.whatsapp || '',
    },
    onDirtyChange
  )

  async function save() {
    await saveContent('footer', { ...footer, thankYou: draft.thankYou, photographer: draft.photographer })
    await saveSettings({ public_contact: { email: draft.email.trim(), whatsapp: draft.whatsapp.trim() } })
    commit(draft)
  }

  return (
    <PanelFrame title="Closing & contact" description="The thank-you note at the end of the site, and optional contact details for guests." dirty={dirty} onSave={save} onDiscard={reset}>
      <BilingualField label="Thank-you note" multiline rows={3} value={draft.thankYou} onChange={(thankYou) => update({ thankYou })} />
      <TextInput label="Photographer credit" placeholder="Photos by …" value={draft.photographer} onChange={(e) => update({ photographer: e.target.value })} maxLength={200} />
      <div className="space-y-4 rounded-xl bg-sb-paper p-4">
        <div>
          <p className="text-sm font-medium text-sb-ink">Contact shown to guests</p>
          <p className="text-xs text-sb-muted">Leave both empty to show no contact details at all. Guests can always write in the guestbook.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Email" type="email" value={draft.email} onChange={(e) => update({ email: e.target.value })} />
          <TextInput label="WhatsApp number" type="tel" placeholder="+8801…" value={draft.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} maxLength={30} />
        </div>
      </div>
    </PanelFrame>
  )
}
