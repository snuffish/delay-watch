import { useState, useEffect, Dispatch, SetStateAction } from 'react'

/**
 * useState that persists to localStorage, so the value survives reloads and new
 * sessions. Tolerates unavailable/malformed storage (private mode, quota) by
 * falling back to `initialValue` and silently ignoring write failures.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw) as T
    } catch {
      // ignore — fall back to the initial value
    }
    return initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore — private mode / quota exceeded
    }
  }, [key, value])

  return [value, setValue]
}
