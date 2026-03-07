export type ToastKind = 'info' | 'error'

export interface ToastPayload {
  id?: string
  message: string
  kind?: ToastKind
}

const EVENT_NAME = 'fc26-toast'

export function emitToast(message: string, kind: ToastKind = 'info', id?: string): void {
  if (typeof window === 'undefined') return
  const payload: ToastPayload = { id, message, kind }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }))
}

export function onToast(handler: (payload: ToastPayload) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const listener = (event: Event) => {
    const custom = event as CustomEvent<ToastPayload>
    if (custom.detail) handler(custom.detail)
  }
  window.addEventListener(EVENT_NAME, listener)
  return () => window.removeEventListener(EVENT_NAME, listener)
}
