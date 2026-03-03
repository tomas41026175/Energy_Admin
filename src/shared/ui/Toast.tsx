import { useCallback, useState, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { ToastContext, type Toast, type ToastType } from '@/shared/hooks/useToast'

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<readonly Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => removeToast(id), 3000)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
}

const ToastItem = ({ toast, onClose }: ToastItemProps) => {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border px-4 py-3 shadow-sm min-w-[300px] flex items-center justify-between',
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
