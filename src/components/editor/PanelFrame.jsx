'use client'

import { useState } from 'react'
import { Button, Card, CardBody, CardHeader, useToast } from '@/ui'
import { ConflictError } from './useSiteEditor'

/**
 * Card with a sticky Save/Discard bar. `onSave` is async; errors are toasted.
 */
export default function PanelFrame({ title, description, actions, dirty, onSave, onDiscard, saveLabel = 'Save changes', children }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave()
      toast.success(`${title} saved`)
    } catch (err) {
      toast.error(err instanceof ConflictError ? `${err.message} Reload the page to continue.` : err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader title={title} description={description} actions={actions} />
      <CardBody>{children}</CardBody>
      {onSave && (
        <div className="sticky bottom-0 flex items-center justify-end gap-2 rounded-b-2xl border-t border-sb-line bg-sb-card/95 px-5 py-3 backdrop-blur sm:px-6">
          {dirty && <span className="mr-auto text-xs text-sb-marigold-deep">Unsaved changes</span>}
          {onDiscard && (
            <Button variant="ghost" onClick={onDiscard} disabled={!dirty || saving}>
              Discard
            </Button>
          )}
          <Button variant="primary" onClick={handleSave} disabled={!dirty} loading={saving}>
            {saveLabel}
          </Button>
        </div>
      )}
    </Card>
  )
}
