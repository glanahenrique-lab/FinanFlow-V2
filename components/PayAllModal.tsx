import React from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { InstallmentPurchase } from '../types';

interface PayAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  installments: InstallmentPurchase[];
  themeColor: string;
  isDarkMode: boolean;
}

export const PayAllModal: React.FC<PayAllModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  installments,
  themeColor,
  isDarkMode
}) => {
  if (!isOpen) return null;

  // Filtrar apenas as que não terminaram
  const activeInstallments = installments.filter(i => i.paidInstallments < i.totalInstallments);

  const totalToPay = activeInstallments.reduce((acc, inst) => {
    const base = inst.totalAmount / inst.totalInstallments;
    const interest = inst.accumulatedInterest || 0;
    return acc + base + interest;
  }, 0);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    textHead: 'text-white',
    textMuted: 'text-slate-400',
    itemBg: 'bg-slate-950',
    itemBorder: 'border-slate-800',
    footerBg: 'bg-slate-900',
    closeHover: 'hover:text-white',
    alertBg: 'bg-slate-800/50'
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
    itemBg: 'bg-slate-50',
    itemBorder: 'border-slate-200',
    footerBg: 'bg-white',
    closeHover: 'hover:text-slate-700',
    alertBg: 'bg-slate-50'
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] transition-colors`}>
        <div className={`flex justify-between items-center p-5 border-b ${styles.border}`}>
          <h2 className={`text-lg font-bold ${styles.textHead} flex items-center gap-2`}>
            <CheckCircle2 className="text-emerald-500" size={20} />
            Pagar Fatura Mensal
          </h2>
          <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {activeInstallments.length === 0 ? (
            <div className={`text-center ${styles.textMuted} py-8`}>
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Todas as parcelas já foram pagas!</p>
            </div>
          ) : (
            <>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-center">
                 <p className="text-sm text-emerald-500 mb-1 font-medium">Valor Total a Pagar</p>
                 <p className="text-3xl font-bold text-emerald-500">{formatCurrency(totalToPay)}</p>
              </div>

              <p className={`text-sm font-medium ${styles.textMuted} mb-3 uppercase tracking-wider`}>Detalhamento</p>
              <div className="space-y-3 mb-6">
                {activeInstallments.map(inst => {
                    const monthly = inst.totalAmount / inst.totalInstallments;
                    const interest = inst.accumulatedInterest || 0;
                    return (
                        <div key={inst.id} className={`flex justify-between items-center text-sm p-3 ${styles.itemBg} rounded-lg border ${styles.itemBorder}`}>
                            <div>
                                <p className={`${styles.textHead} font-medium`}>{inst.description}</p>
                                <p className={`${styles.textMuted} text-xs`}>
                                    {inst.paidInstallments + 1}ª de {inst.totalInstallments}
                                    {interest > 0 && <span className="text-rose-400 ml-1">(+Juros)</span>}
                                </p>
                            </div>
                            <span className={`${styles.textHead} font-mono`}>{formatCurrency(monthly + interest)}</span>
                        </div>
                    )
                })}
              </div>

              <div className={`${styles.alertBg} p-3 rounded-lg flex gap-3 items-start`}>
                 <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                 <p className={`text-xs ${styles.textMuted} leading-relaxed`}>
                    Confirmar esta ação irá registrar o pagamento de <strong>1 parcela</strong> para cada item listado acima e removerá quaisquer juros acumulados pendentes.
                 </p>
              </div>
            </>
          )}
        </div>

        {activeInstallments.length > 0 && (
            <div className={`p-5 border-t ${styles.border} ${styles.footerBg} rounded-b-2xl`}>
                <button
                    onClick={onConfirm}
                    className={`w-full py-3 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2`}
                >
                    <CheckCircle2 size={20} />
                    Confirmar Pagamento Geral
                </button>
            </div>
        )}
      </div>
    </div>
  );
};