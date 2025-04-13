import dynamic from 'next/dynamic';
import * as React from 'react';

const ToastContainer = dynamic(
  () => import('@/components/Toast').then((mod) => mod.ToastContainer),
  { ssr: false }
);

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

const ToastProvider = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const removeToast = React.useCallback((id: string) => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, []);

    const showToast = React.useCallback(
      ({ message, type, title, duration = 5000 }: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = {
          id,
          title,
          message,
          type,
          duration,
        };

        setToasts((currentToasts) => [...currentToasts, newToast]);

        if (duration > 0) {
          setTimeout(() => {
            removeToast(id);
          }, duration);
        }
      },
      [removeToast]
    );

    return (
      <ToastContext.Provider value={{ showToast, removeToast }}>
        {children}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </ToastContext.Provider>
    );
  }),
  { ssr: false }
);

export { ToastProvider };

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 