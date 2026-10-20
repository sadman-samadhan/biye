'use client'

import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button, Select, Switch, TextInput, useConfirm, useToast } from '@/ui'
import { slugify, slugProblem } from '@/lib/slugs'
import PanelFrame from '../PanelFrame'
import { usePanelDraft } from '../usePanelDraft'

const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '')

export default function AdminSettingsPanel({ data, saveSettings, onDirtyChange }) {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  const site = data.site
  const { draft, update, dirty, reset, commit } = usePanelDraft(
    {
      slug: site.slug,
      status: site.status === 'archived' ? 'archived' : site.status,
      plan: site.plan || 'standard',
      invite: (site.products || ['site']).includes('invite'),
      memories: (site.products || ['site']).includes('site'),
      expiry: toDateInput(site.plan_expiry_date),
      ownerName: site.owner_name || '',
      ownerEmail: site.owner_email || '',
      ownerPhone: site.owner_phone || '',
    },
    onDirtyChange
  )
  const slugError = draft.slug !== site.slug ? slugProblem(draft.slug) : null

  async function save() {
    if (slugError) throw new Error(slugError)
    const products = [draft.invite && 'invite', draft.memories && 'site'].filter(Boolean)
    if (!products.length) throw new Error('Choose at least one product')
    await saveSettings({
      ...(draft.slug !== site.slug ? { slug: draft.slug } : {}),
      status: draft.status,
      plan: draft.plan,
      products,
      plan_expiry_date: draft.expiry ? `${draft.expiry}T23:59:59+06:00` : null,
      owner_name: draft.ownerName || null,
      owner_email: draft.ownerEmail.trim(),
      owner_phone: draft.ownerPhone || null,
    })
    commit(draft)
  }

  async function moveToTrash() {
    const ok = await confirm({
      title: `Move ${site.slug} to Trash?`,
      body: 'Guests will see a “not found” page. You can restore it from the Trash tab.',
      confirmLabel: 'Move to Trash',
      tone: 'danger',
    })
    if (!ok) return
    const res = await fetch(`/api/admin/sites/${site.id}`, { method: 'DELETE' })
    if (!res.ok) return toast.error((await res.json().catch(() => ({}))).error || 'Could not move to Trash')
    toast.success('Moved to Trash')
    router.push('/admin/sites')
  }

  return (
    <PanelFrame title="Site settings" description="Operator-only: address, status, plan and the client record." dirty={dirty} onSave={save} onDiscard={reset}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Address"
          value={draft.slug}
          error={slugError}
          hint={`shubhobiye.com/${draft.slug}`}
          onChange={(e) => update({ slug: slugify(e.target.value) || e.target.value.toLowerCase() })}
        />
        <Select
          label="Status"
          value={draft.status}
          onChange={(e) => update({ status: e.target.value })}
          options={[
            { value: 'draft', label: 'Draft (hidden from guests)' },
            { value: 'live', label: 'Live' },
            { value: 'expired', label: 'Expired' },
            { value: 'archived', label: 'In trash' },
          ]}
        />
        <TextInput label="Plan" value={draft.plan} onChange={(e) => update({ plan: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
        <TextInput label="Paid until" type="date" value={draft.expiry} onChange={(e) => update({ expiry: e.target.value })} hint="After this date the site behaves as expired." />
      </div>
      <div className="space-y-3 rounded-xl bg-sb-paper p-4">
        <p className="text-sm font-medium text-sb-ink">Products</p>
        <Switch label="Invitation" description="Pre-wedding invitation with RSVP." checked={draft.invite} onChange={(invite) => update({ invite })} />
        <Switch label="Memories site" description="Ceremonies, gallery and guestbook." checked={draft.memories} onChange={(memories) => update({ memories })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextInput label="Client name" value={draft.ownerName} onChange={(e) => update({ ownerName: e.target.value })} />
        <TextInput label="Client email" type="email" value={draft.ownerEmail} onChange={(e) => update({ ownerEmail: e.target.value })} />
        <TextInput label="Client phone" type="tel" value={draft.ownerPhone} onChange={(e) => update({ ownerPhone: e.target.value })} />
      </div>
      {site.status !== 'archived' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-sb-alta/20 p-4">
          <div>
            <p className="text-sm font-medium text-sb-ink">Move to Trash</p>
            <p className="text-xs text-sb-muted">Hides the site from guests. Permanent deletion happens from the Trash tab.</p>
          </div>
          <Button variant="danger" size="sm" icon={Trash2} onClick={moveToTrash}>
            Move to Trash
          </Button>
        </div>
      )}
    </PanelFrame>
  )
}
