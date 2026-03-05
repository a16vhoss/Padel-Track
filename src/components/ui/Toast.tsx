'use client';

import { useToastStore, ToastType } from '@/stores/toastStore';

const typeStyles: Record<ToastType, string> = {
  success: 'bg-primary/15 border-primary/30 text-primary',
  error: 'bg-danger/15 border-danger/30 text-danger',
  info: 'bg-secondary/15 border-secondary/30 text-secondary',
};

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-lg border
            shadow-lg backdrop-blur-sm text-sm font-medium
            animate-slide-in-right cursor-pointer
            ${typeStyles[toast.type]}
          `}
          onClick={() => removeToast(toast.id)}
        >
          <span className="text-base font-bold">{typeIcons[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
