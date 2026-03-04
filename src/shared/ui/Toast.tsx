import { useCallback, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { ToastContext, type Toast, type ToastType } from '@/shared/hooks/useToast'
import { TOAST_DISMISS_MS } from '@/shared/constants'

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<readonly Toast[]>([])
  const [leavingIds, setLeavingIds] = useState<ReadonlySet<string>>(new Set())
  const autoTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const finalRemove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    setLeavingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const startLeave = useCallback(
    (id: string) => {
      // Cancel auto-dismiss timer if user closes manually
      const autoTimer = autoTimersRef.current.get(id)
      if (autoTimer) {
        clearTimeout(autoTimer)
        autoTimersRef.current.delete(id)
      }
      setLeavingIds((prev) => {
        if (prev.has(id)) return prev
        return new Set([...prev, id])
      })
      setTimeout(() => finalRemove(id), 200)
    },
    [finalRemove],
  )

  const removeToast = useCallback(
    (id: string) => {
      startLeave(id)
    },
    [startLeave],
  )

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, type, message }])
      // Start leave animation at TOAST_DISMISS_MS so element removes at ~3000ms total
      const timer = setTimeout(() => startLeave(id), TOAST_DISMISS_MS)
      autoTimersRef.current.set(id, timer)
    },
    [startLeave],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            isLeaving={leavingIds.has(toast.id)}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

interface ToastItemProps {
  toast: Toast
  isLeaving: boolean
  onClose: () => void
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
}

const ToastItem = ({ toast, isLeaving, onClose }: ToastItemProps) => {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border px-4 py-3 shadow-sm min-w-[300px] flex items-center justify-between',
        isLeaving ? 'animate-slide-out-right' : 'animate-slide-in-right',
        TOAST_STYLES[toast.type],
      )}
    >
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-current opacity-50 hover:opacity-100"
        aria-label="關閉"
      >
        ×
      </button>
    </div>
  )
}
