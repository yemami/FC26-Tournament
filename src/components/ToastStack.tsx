import type { ToastKind } from '../lib/toastBus'

interface ToastItem {
  id: string
  message: string
  kind?: ToastKind
}

interface ToastStackProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-card border px-4 py-3 shadow-card ${
            toast.kind === 'error'
              ? 'border-red-200 dark:border-red-600/40 bg-red-50/80 dark:bg-red-900/30'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {toast.kind === 'error' ? 'Alert' : 'Activity'}
              </div>
              <div className={`text-sm font-semibold ${toast.kind === 'error' ? 'text-red-700 dark:text-red-200' : 'text-gray-900 dark:text-gray-100'}`}>
                {toast.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
