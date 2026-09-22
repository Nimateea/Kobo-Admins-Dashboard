import { useEffect, useState } from 'react'

export interface SavedView<F> {
  name: string
  filters: F
}

/** Persists named filter presets per view id, e.g. "High-risk users in Nigeria". */
export function useSavedViews<F>(viewId: string) {
  const storageKey = `savedViews:${viewId}`
  const [views, setViews] = useState<SavedView<F>[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as SavedView<F>[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(views))
    } catch {
      // localStorage unavailable — saved views just won't persist across reloads.
    }
  }, [storageKey, views])

  function save(name: string, filters: F) {
    setViews((v) => [...v.filter((x) => x.name !== name), { name, filters }])
  }
  function remove(name: string) {
    setViews((v) => v.filter((x) => x.name !== name))
  }

  return { views, save, remove }
}
