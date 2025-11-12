'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

export const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = { id, title, description, variant };
  toasts = [...toasts, newToast];
  listeners.forEach((listener) => listener(toasts));

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(toasts));
  }, 5000);
};

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(toasts));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] animate-in slide-in-from-top ${
            toast.variant === 'destructive'
              ? 'bg-red-600 text-white'
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-semibold">{toast.title}</div>
              {toast.description && (
                <div className="text-sm mt-1 opacity-90">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
