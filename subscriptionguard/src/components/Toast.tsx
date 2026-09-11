import React from 'react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            className={`pointer-events-auto cursor-pointer p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 transition-all transform animate-in fade-in slide-in-from-top-2 duration-200 ${
              isSuccess
                ? 'bg-[#1E2640]/95 border-[#10B981] text-white shadow-[#10B981]/10'
                : isError
                ? 'bg-[#1E2640]/95 border-[#EF4444] text-white shadow-[#EF4444]/10'
                : isWarning
                ? 'bg-[#1E2640]/95 border-amber-500 text-white shadow-amber-500/10'
                : 'bg-[#1E2640]/95 border-[#2D3748] text-white'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isSuccess
                  ? 'bg-[#10B981]/20 text-[#10B981]'
                  : isError
                  ? 'bg-[#EF4444]/20 text-[#EF4444]'
                  : isWarning
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {isSuccess ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : isError ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : isWarning ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs tracking-tight text-white leading-tight">{toast.title}</h5>
              {toast.message && <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{toast.message}</p>}
            </div>

            <button
              type="button"
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#0B0F17] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};
