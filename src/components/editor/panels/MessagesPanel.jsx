'use client'

import { useState } from 'react'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { Badge, Button, EmptyState, useConfirm, useToast } from '@/ui'
import PanelFrame from '../PanelFrame'

export default function MessagesPanel({ data, setMessages }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [busy, setBusy] = useState(null)
  const messages = data.messages || []
  const pending = messages.filter((m) => !m.approved).length

  async function call(messageId, init) {
    setBusy(messageId)
    try {
      const res = await fetch(`/api/sites/${data.site.id}/messages/${messageId}`, {
        headers: { 'Content-Type': 'application/json' },
        ...init,
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not update the message')
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setBusy(null)
    }
  }

  async function setApproved(message, approved) {
    if (await call(message.id, { method: 'PATCH', body: JSON.stringify({ approved }) })) {
      setMessages((list) => list.map((m) => (m.id === message.id ? { ...m, approved } : m)))
    }
  }

  async function remove(message) {
    const ok = await confirm({ title: 'Delete this message?', body: `From ${message.name}. This can't be undone.`, confirmLabel: 'Delete', tone: 'danger' })
    if (ok && (await call(message.id, { method: 'DELETE' }))) {
      setMessages((list) => list.filter((m) => m.id !== message.id))
    }
  }

  return (
    <PanelFrame title="Guestbook" description={`${messages.length} message${messages.length === 1 ? '' : 's'}${pending ? `, ${pending} hidden` : ''}. Hidden messages are only visible here.`}>
      {messages.length === 0 ? (
        <EmptyState title="No messages yet">Blessings guests leave on the site will appear here.</EmptyState>
      ) : (
        <ul className="divide-y divide-sb-line">
          {messages.map((m) => (
            <li key={m.id} className="flex flex-wrap items-start gap-3 py-4 first:pt-0">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-sb-ink">{m.name}</span>
                  {m.name_bn && <span lang="bn" className="text-sm text-sb-muted">{m.name_bn}</span>}
                  {!m.approved && <Badge tone="draft">Hidden</Badge>}
                  <span className="text-xs text-sb-muted">{new Date(m.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <p className="mt-1 text-sm text-sb-ink-soft">{m.message}</p>
                {m.message_bn && <p lang="bn" className="mt-1 text-sm text-sb-muted">{m.message_bn}</p>}
              </div>
              <div className="flex gap-1">
                {m.approved ? (
                  <Button size="sm" variant="ghost" icon={EyeOff} loading={busy === m.id} onClick={() => setApproved(m, false)}>
                    Hide
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" icon={Eye} loading={busy === m.id} onClick={() => setApproved(m, true)}>
                    Show
                  </Button>
                )}
                <Button size="sm" variant="ghost" icon={Trash2} aria-label="Delete message" onClick={() => remove(m)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelFrame>
  )
}
