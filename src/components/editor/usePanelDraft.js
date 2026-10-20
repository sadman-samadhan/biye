'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Local draft for one editor panel. `dirty` compares against the last saved
 * value; `reset` discards edits; `commit` adopts a freshly saved value.
 */
export function usePanelDraft(saved, onDirtyChange) {
  const [baseline, setBaseline] = useState(saved)
  const [draft, setDraft] = useState(saved)

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline])

  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  const reset = useCallback(() => setDraft(baseline), [baseline])
  const commit = useCallback((value) => {
    setBaseline(value)
    setDraft(value)
  }, [])

  const update = useCallback((patch) => setDraft((d) => ({ ...d, ...patch })), [])

  return { draft, setDraft, update, dirty, reset, commit }
}
