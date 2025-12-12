import React, { useState, useEffect } from 'react';
import { X, FastForward, CheckCircle2, AlertCircle } from 'lucide-react';
import { InstallmentPurchase } from '../types';

interface AnticipateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (monthsToAnticipate: number) => void;
  installment: InstallmentPurchase | null;
  themeColor: string;
  isDarkMode: boolean;
}

export const AnticipateModal: React.FC<AnticipateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  installment,
  themeColor,
  isDarkMode
}) => {
  const [anticipateAll, setAnticipateAll] = useState(false);
  const [monthsInput, setMonthsInput] = useState('1');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAnticipateAll(false);
      setMonthsInput('1');
    }
  }, [isOpen]);

  if (!isOpen || !installment) return null;

  const remainingInstallments = installment.totalInstallments - installment.paidInstallments;
  const installmentValue = installment.totalAmount / installment.totalInstallments;

  // Calculate safe values derived from input
  const parsedMonths = parseInt(monthsInput) || 0;
  // Ensure the calculation uses a valid number between 1 and remaining
  const validMonths = Math.min(remainingInstallments, Math.max(1, parsedMonths));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
        setMonthsInput('');
        return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
        if (num > remainingInstallments) {
            setMonthsInput(remainingInstallments.toString());
        } else if (num < 1) {
            setMonthsInput('1');
        } else {
            setMonthsInput(val);
        }
    }
  };

  const handleBlur = () => {
      if (monthsInput === '' || parseInt(monthsInput) === 0) {
          setMonthsInput('1');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(anticipateAll ? remainingInstallments : validMonths);
    onClose();
  };

  const totalValue = anticipateAll 
    ? remainingInstallments * installmentValue 
    : validMonths * installmentValue;

  const isMaxReached = parsedMonths === remainingInstallments;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    textHead: 'text-white',
    textMuted: 'text-slate-400',
    infoBg: 'bg-slate-950',
    infoBorder: 'border-slate-800',
    radioBg: 'bg-slate-900',
    radioBgActive: 'bg-slate-800',
    radioBorder: 'border-slate-600',
    inputBg: 'bg-slate-950',
    footerBg: 'bg-slate-800/50',
    closeHover: 'hover:text-white',
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
    infoBg: 'bg-slate-50',
    infoBorder: 'border-slate-200',
    radioBg: 'bg-white',
    radioBgActive: 'bg-slate-50',
    radioBorder: 'border-slate-300',
    inputBg: 'bg-white',
    footerBg: 'bg-slate-50',
    closeHover: 'hover:text-slate-700',
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 transition-colors`}>
        <div className={`flex justify-between items-center p-5 border-b ${styles.border}`}>
          <h2 className={`text-lg font-bold ${styles.textHead} flex items-center gap-2`}>
            <FastForward className={`text-${themeColor}-500`} size={20} />
            Antecipar Parcelas
          </h2>
          <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className={`${styles.infoBg} p-4 rounded-xl border ${styles.infoBorder}`}>
             <h3 className={`${styles.textHead} font-medium mb-1`}>{installment.description}</h3>
             <p className={`text-sm ${styles.textMuted}`}>Restam <strong>{remainingInstallments}</strong> parcelas de {formatCurrency(installmentValue)}</p>
          </div>

          <div className="space-y-4">
             <label className={`flex items-center gap-3 p-3 rounded-xl border ${styles.radioBorder} cursor-pointer hover:bg-opacity-80 transition-colors ${anticipateAll ? styles.radioBgActive : styles.radioBg}`}>
                <input 
                  type="radio" 
                  name="type" 
                  className={`text-${themeColor}-500 focus:ring-${themeColor}-500`}
                  checked={anticipateAll}
                  onChange={() => setAnticipateAll(true)}
                />
                <span className={`${styles.textHead} font-medium flex-1`}>Quitar Tudo (Antecipar Restante)</span>
             </label>

             <label className={`flex flex-col gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${!anticipateAll ? styles.radioBgActive : styles.radioBg} ${!anticipateAll ? styles.radioBorder : isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                    <input 
                    type="radio" 
                    name="type" 
                    className={`text-${themeColor}-500 focus:ring-${themeColor}-500`}
                    checked={!anticipateAll}
                    onChange={() => setAnticipateAll(false)}
                    />
                    <div className="flex-1">
                    <span className={`${styles.textHead} font-medium block`}>Antecipar Quantidade</span>
                    </div>
                </div>
                
                {!anticipateAll && (
                    <div className="pl-7 animate-in slide-in-from-top-2">
                        <input 
                            type="number"
                            min="1"
                            max={remainingInstallments}
                            value={monthsInput}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full ${styles.inputBg} border rounded-lg px-3 py-2 ${styles.textHead} text-sm focus:ring-0 transition-colors outline-none ${isMaxReached ? 'border-amber-500/50 text-amber-500' : styles.radioBorder}`}
                        />
                        {isMaxReached && (
                            <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                                <AlertCircle size={12} />
                                Limite atingido: restam apenas {remainingInstallments} parcelas.
                            </p>
                        )}
                    </div>
                )}
             </label>
          </div>

          <div className={`flex justify-between items-center ${styles.footerBg} p-4 rounded-xl`}>
             <span className={`${styles.textMuted} text-sm`}>Total a pagar agora:</span>
             <span className={`text-xl font-bold ${styles.textHead}`}>{formatCurrency(totalValue)}</span>
          </div>

          <button
            type="submit"
            className={`w-full py-3 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2`}
          >
            <CheckCircle2 size={18} />
            Confirmar Antecipação
          </button>
        </form>
      </div>
    </div>
  );
};