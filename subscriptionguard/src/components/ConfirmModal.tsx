import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isDestructive ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#10B981]/20 text-[#10B981]'
            }`}
          >
            {isDestructive ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-white leading-snug">{title}</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-[#2D3748] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2D3748] text-xs font-bold text-gray-400 hover:text-white transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow active:scale-95 ${
              isDestructive
                ? 'bg-[#EF4444] text-white hover:bg-red-600'
                : 'bg-[#10B981] text-black hover:bg-[#4EDEA3]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
