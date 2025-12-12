import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  // Note: ConfirmModal is often used inside contexts or directly, so we might need to pass theme or assume it inherits. 
  // However, since it is rendered at root level usually, we need to pass style props or use a context.
  // For consistency with other modals in this refactor, let's assume parent passes simple logic or we use a basic dark/light check if prop provided, but usually App.tsx passes props.
  // Let's check App.tsx usage. It is `<ConfirmModal ... />` without isDarkMode in the provided file.
  // I will assume for now we keep it simple or update App.tsx to pass it if needed, but since I cannot edit App.tsx again in this turn without valid reason (I can, but user didn't ask to change logic flow, just visuals).
  // Wait, I CAN update App.tsx implicitly if I update the component definition, I just need to make sure App.tsx passes it. 
  // In the previous turn I did NOT see ConfirmModal getting isDarkMode in App.tsx. 
  // I will add a default fallback or update App.tsx usage? 
  // Actually, I can rely on a class on the body if I set it? No, we are using React state.
  // I'll update the component to accept `isDarkMode?` and default to true (current behavior) to avoid breaking, but I really should update App.tsx to pass it.
  // Since I am already updating App.tsx consumers in other files, I'll update ConfirmModal to accept it and Update App.tsx logic is handled in the big block.
  // Wait, the user didn't give me App.tsx to edit again in THIS prompt, but I have the context.
  // I will update ConfirmModal to accept the prop.
}

// Extended props
interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDarkMode?: boolean; // Optional to avoid breaking if not passed immediately, but we want it.
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel, isDarkMode = true }) => {
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
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};