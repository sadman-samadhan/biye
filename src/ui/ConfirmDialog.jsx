'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Button from './Button'

const ConfirmContext = createContext(null)

/**
 * Promise-based confirmation dialog that replaces window.confirm().
 * const confirm = useConfirm(); if (await confirm({ title, body, confirmLabel, tone: 'danger' })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const dialogRef = useRef(null)
  const resolver = useRef(null)

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve
        setRequest(options)
      }),
    []
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (request && !dialog.open) dialog.showModal()
    if (!request && dialog.open) dialog.close()
  }, [request])

  const close = (result) => {
    resolver.current?.(result)
    resolver.current = null
    setRequest(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault()
          close(false)
        }}
        className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-sb-line bg-sb-card p-0 text-sb-ink shadow-2xl backdrop:bg-sb-ink/40"
      >
        {request && (
          <div className="p-6">
            <h2 className="font-display text-xl font-semibold">{request.title}</h2>
            {request.body && <p className="mt-2 text-sm text-sb-muted">{request.body}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => close(false)}>
                {request.cancelLabel || 'Cancel'}
              </Button>
              <Button variant={request.tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus>
                {request.confirmLabel || 'Confirm'}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return ctx
}
