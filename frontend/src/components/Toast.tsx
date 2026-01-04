import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-900 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-900 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-900 border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-900 border-gray-200';
    }
  };

  const getIcon = (type: ToastType) => {
    const iconClass = 'h-5 w-5';
    switch (type) {
      case 'success':
        return <CheckCircle2 className={cn(iconClass, 'text-green-600')} />;
      case 'error':
        return <XCircle className={cn(iconClass, 'text-red-600')} />;
      case 'warning':
        return <AlertCircle className={cn(iconClass, 'text-yellow-600')} />;
      case 'info':
        return <Info className={cn(iconClass, 'text-blue-600')} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[10000] flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 rounded-lg border p-4 shadow-lg',
            'animate-in slide-in-from-right duration-300',
            getStyles(toast.type)
          )}
        >
          {getIcon(toast.type)}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
