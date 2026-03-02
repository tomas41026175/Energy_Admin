import { useEffect } from 'react'

export const useKeyboard = (key: string, handler: () => void, enabled = true): void => {
  useEffect(() => {
    if (!enabled) return

    const listener = (e: KeyboardEvent): void => {
      if (e.key === key) handler()
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [key, handler, enabled])
}
