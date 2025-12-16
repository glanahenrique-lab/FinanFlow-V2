import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDarkMode?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  isDarkMode = true,
  confirmText = 'Excluir',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  const styles = isDarkMode ? {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      textHead: 'text-white',
      textBody: 'text-slate-400',
      cancelBg: 'bg-slate-800 hover:bg-slate-700',
      cancelText: 'text-slate-300'
  } : {
      bg: 'bg-white',
      border: 'border-slate-200',
      textHead: 'text-slate-900',
      textBody: 'text-slate-500',
      cancelBg: 'bg-slate-100 hover:bg-slate-200',
      cancelText: 'text-slate-700'
  };
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 transition-colors`}>
        <h3 className={`text-xl font-bold ${styles.textHead} mb-2`}>{title}</h3>
        <p className={`${styles.textBody} mb-6 leading-relaxed`}>{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className={`flex-1 py-2.5 ${styles.cancelBg} ${styles.cancelText} rounded-lg font-medium transition-colors`}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};