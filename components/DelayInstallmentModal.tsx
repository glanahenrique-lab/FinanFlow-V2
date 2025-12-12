import React, { useState } from 'react';
import { X, CalendarClock, AlertCircle } from 'lucide-react';

interface DelayInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (interestAmount: number) => void;
  installmentName: string;
  themeColor: string;
  isDarkMode: boolean;
}

export const DelayInstallmentModal: React.FC<DelayInstallmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  installmentName,
  themeColor,
  isDarkMode
}) => {
  const [hasInterest, setHasInterest] = useState(false);
  const [interestAmount, setInterestAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(hasInterest ? Number(interestAmount) : 0);
    setInterestAmount('');
    setHasInterest(false);
    onClose();
  };

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    textHead: 'text-white',
    textBody: 'text-slate-300',
    inputBg: 'bg-slate-950',
    inputBorder: 'border-slate-800',
    inputText: 'text-white',
    cardBg: 'bg-slate-800', // checkbox container
    cardBorder: 'border-slate-600',
    closeHover: 'hover:text-white',
    labelColor: 'text-slate-400'
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    textHead: 'text-slate-900',
    textBody: 'text-slate-600',
    inputBg: 'bg-slate-50',
    inputBorder: 'border-slate-200',
    inputText: 'text-slate-900',
    cardBg: 'bg-slate-100',
    cardBorder: 'border-slate-300',
    closeHover: 'hover:text-slate-700',
    labelColor: 'text-slate-500'
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 transition-colors`}>
        <div className={`flex justify-between items-center p-5 border-b ${styles.border}`}>
          <h2 className={`text-lg font-bold ${styles.textHead} flex items-center gap-2`}>
            <CalendarClock className="text-amber-500" size={20} />
            Adiar Parcela
          </h2>
          <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
             <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
             <div className={`text-sm ${styles.textBody}`}>
                Você está pulando o pagamento de <strong>{installmentName}</strong> este mês. Isso não contará como pago.
             </div>
          </div>

          <div>
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${hasInterest ? `bg-${themeColor}-600 border-${themeColor}-600` : `${styles.cardBorder} ${styles.cardBg}`}`}>
                    {hasInterest && <X className="rotate-45 text-white" size={14} />}
                </div>
                <input 
                   type="checkbox" 
                   className="hidden" 
                   checked={hasInterest} 
                   onChange={(e) => setHasInterest(e.target.checked)} 
                />
                <span className={`${styles.textHead} font-medium`}>Haverá cobrança de juros?</span>
             </label>
          </div>

          {hasInterest && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className={`block text-sm font-medium ${styles.labelColor} mb-2`}>Valor dos Juros (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                autoFocus
                value={interestAmount}
                onChange={(e) => setInterestAmount(e.target.value)}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-xl px-4 py-3 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                placeholder="Ex: 15.50"
              />
              <p className="text-xs text-slate-500 mt-2">
                 Este valor será adicionado ao montante total e cobrado na próxima fatura.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-slate-400 hover:text-slate-500 font-medium"
            >
                Cancelar
            </button>
            <button
                type="submit"
                className={`flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 transition-all`}
            >
                Confirmar Adiamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};