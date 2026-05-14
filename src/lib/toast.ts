export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastPayload {
  title: string;
  message?: string;
  variant?: ToastVariant;
}

export const TOAST_EVENT = 'healthreserve:toast';

export function showToast(payload: ToastPayload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}
