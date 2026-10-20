'use client'

import { useCallback, useEffect, useState } from 'react'
import { Copy, Send, UserMinus } from 'lucide-react'
import { Badge, Button, EmptyState, Select, TextInput, useConfirm, useToast } from '@/ui'
import PanelFrame from '../PanelFrame'

/** Operator-only: who can sign in to manage this site, and invite links to send. */
export default function MembersPanel({ data }) {
  const toast = useToast()
  const confirm = useConfirm()
  const siteId = data.site.id
  const [members, setMembers] = useState(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('owner')
  const [sending, setSending] = useState(false)
  const [link, setLink] = useState(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/sites/${siteId}/members`, { cache: 'no-store' })
    const result = await res.json().catch(() => ({}))
    setMembers(result.members || [])
  }, [siteId])

  useEffect(() => {
    load()
  }, [load])

  async function invite(e) {
    e.preventDefault()
    setSending(true)
    setLink(null)
    try {
      const res = await fetch(`/api/admin/sites/${siteId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Could not create the invite')
      setLink({ url: result.link, email, existing: result.existingAccount })
      setEmail('')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  async function remove(member) {
    const ok = await confirm({ title: `Remove ${member.email}?`, body: 'They will no longer be able to edit this site.', confirmLabel: 'Remove', tone: 'danger' })
    if (!ok) return
    const res = await fetch(`/api/admin/sites/${siteId}/members?userId=${member.userId}`, { method: 'DELETE' })
    if (!res.ok) return toast.error('Could not remove access')
    setMembers((list) => list.filter((m) => m.userId !== member.userId))
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link copied')
    } catch {
      toast.error('Copy failed — select the link and copy it manually')
    }
  }

  const whatsappText = link
    ? `Your ShubhoBiye wedding site is ready to edit. Open this link to choose your password (it works once): ${link.url}`
    : ''

  return (
    <PanelFrame title="Couple access" description="Give the couple their own login to edit content, photos and guest settings for this site only.">
      <form onSubmit={invite} className="flex flex-wrap items-end gap-3 rounded-xl bg-sb-paper p-4">
        <TextInput className="min-w-56 flex-1" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Select
          className="w-36"
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: 'owner', label: 'Owner' },
            { value: 'editor', label: 'Editor' },
          ]}
        />
        <Button type="submit" variant="primary" icon={Send} loading={sending} disabled={!email}>
          Create invite link
        </Button>
      </form>

      {link && (
        <div className="space-y-2 rounded-xl border border-sb-holud/40 bg-[#FCF3E6] p-4 text-sm">
          <p className="font-medium text-sb-ink">
            {link.existing ? 'Sign-in link' : 'Invite link'} for {link.email}. It works once; send it on WhatsApp or email.
          </p>
          <p className="break-all rounded-md bg-sb-card px-3 py-2 font-mono text-xs text-sb-ink-soft">{link.url}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" icon={Copy} onClick={() => copy(link.url)}>
              Copy link
            </Button>
            <Button size="sm" href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noopener">
              Share on WhatsApp
            </Button>
          </div>
        </div>
      )}

      {members === null ? (
        <p className="text-sm text-sb-muted">Loading…</p>
      ) : members.length === 0 ? (
        <EmptyState title="No one has access yet">Invite the couple above. They’ll only ever see this site.</EmptyState>
      ) : (
        <ul className="divide-y divide-sb-line">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-sb-ink">{m.email}</p>
                <p className="text-xs text-sb-muted">{m.lastSignInAt ? `Last signed in ${new Date(m.lastSignInAt).toLocaleDateString('en-GB')}` : 'Has not signed in yet'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={m.role === 'owner' ? 'accent' : 'neutral'}>{m.role === 'owner' ? 'Owner' : 'Editor'}</Badge>
                <Button size="sm" variant="ghost" icon={UserMinus} aria-label={`Remove ${m.email}`} onClick={() => remove(m)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelFrame>
  )
}
