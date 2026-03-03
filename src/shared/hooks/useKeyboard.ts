import { useEffect } from 'react'

export const useKeyboard = (key: string, handler: () => void, enabled = true): void => {
  // useEffect allowed: window event listener is a DOM side effect with cleanup; no Query alternative
  useEffect(() => {
    if (!enabled) return

    const listener = (e: KeyboardEvent): void => {
      if (e.key === key) handler()
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [key, handler, enabled])
}
