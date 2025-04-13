import { useCallback,useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface Toast extends ToastProps {
  id: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    ({ title, message, type, duration = 5000 }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = {
        id,
        title,
        message,
        type,
      };

      setToasts((currentToasts) => [...currentToasts, toast]);

      setTimeout(() => {
        setToasts((currentToasts) =>
          currentToasts.filter((t) => t.id !== toast.id)
        );
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
} 