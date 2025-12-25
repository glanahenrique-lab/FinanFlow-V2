
import React, { useState, useEffect } from 'react';
import { X, CreditCard, User } from 'lucide-react';
import { InstallmentPurchase } from '../types';

interface AddInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (installment: Omit<InstallmentPurchase, 'id'>, saveNewCard?: boolean) => void;
  themeColor: string;
  isDarkMode: boolean;
  userCustomCards?: string[];
}

const DEFAULT_CARDS = ['Nubank', 'Inter', 'Itaú', 'Bradesco', 'Santander', 'C6 Bank', 'Dinheiro', 'Sem Cartão'];

export const AddInstallmentModal: React.FC<AddInstallmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  themeColor, 
  isDarkMode,
  userCustomCards = []
}) => {
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidFor, setPaidFor] = useState('');
  const [reimbursed, setReimbursed] = useState(false);
  
  const [selectedCard, setSelectedCard] = useState('Nubank');
  const [customCardName, setCustomCardName] = useState('');
  const [saveCustomCard, setSaveCustomCard] = useState(false);

  const availableCards = Array.from(new Set([...DEFAULT_CARDS, ...userCustomCards]));

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setTotalAmount('');
      setTotalInstallments('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setSelectedCard('Nubank');
      setCustomCardName('');
      setSaveCustomCard(false);
      setPaidFor('');
      setReimbursed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCardName = selectedCard === 'Outro' ? customCardName : selectedCard;
    if (selectedCard === 'Outro' && !finalCardName.trim()) {
        alert("Por favor, digite o nome do cartão.");
        return;
    }

    onSave({
      description,
      totalAmount: Number(totalAmount),
      totalInstallments: Number(totalInstallments),
      paidInstallments: 0,
      purchaseDate,
      card: finalCardName,
      paidFor: paidFor.trim() || null as any,
      reimbursed: paidFor.trim() ? reimbursed : null as any
    }, saveCustomCard && selectedCard === 'Outro');
    
    onClose();
  };

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    textHead: 'text-white',
    textLabel: 'text-slate-400',
    inputBg: 'bg-slate-950',
    inputBorder: 'border-slate-800',
    inputText: 'text-white',
    closeHover: 'hover:text-white',
    checkboxBorder: 'border-slate-600',
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    textHead: 'text-slate-900',
    textLabel: 'text-slate-500',
    inputBg: 'bg-slate-50',
    inputBorder: 'border-slate-200',
    inputText: 'text-slate-900',
    closeHover: 'hover:text-slate-700',
    checkboxBorder: 'border-slate-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-colors duration-300 flex flex-col max-h-[90vh]`}>
        <div className={`flex justify-between items-center p-6 border-b ${styles.border}`}>
          <h2 className={`text-xl font-bold ${styles.textHead}`}>Nova Compra Parcelada</h2>
          <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>O que comprou?</label>
            <input
              required
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
              placeholder="Ex: TV Nova, Geladeira"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Pago para quem? (Opcional)</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                    type="text"
                    value={paidFor}
                    onChange={(e) => setPaidFor(e.target.value)}
                    className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg pl-10 pr-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                    placeholder="Ex: Amigo, Mãe, Trabalho"
                />
            </div>
            {paidFor.trim() && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-950/30' : 'border-slate-200 bg-slate-50'} cursor-pointer hover:border-emerald-500/50 transition-colors`}>
                        <input
                            type="checkbox"
                            checked={reimbursed}
                            onChange={(e) => setReimbursed(e.target.checked)}
                            className={`w-5 h-5 rounded border-slate-700 text-${themeColor}-500 focus:ring-${themeColor}-500`}
                        />
                        <div>
                            <p className={`text-sm font-bold ${styles.textHead}`}>A pessoa já me pagou tudo?</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Controle de reembolso total</p>
                        </div>
                    </label>
                </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Valor Total (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                placeholder="2500.00"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Data da Compra</label>
              <input
                required
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
              />
            </div>
          </div>

          <div>
             <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Número de Parcelas</label>
             <input
                required
                type="number"
                min="1"
                max="99"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                placeholder="Ex: 10"
              />
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Cartão utilizado</label>
            <div className="relative">
                <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 text-${themeColor}-500`} size={18} />
                <select
                    value={selectedCard}
                    onChange={(e) => setSelectedCard(e.target.value)}
                    className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg pl-10 pr-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none appearance-none`}
                >
                    {availableCards.map(card => (
                        <option key={card} value={card}>{card}</option>
                    ))}
                    <option value="Outro">Outro (Criar novo)</option>
                </select>
            </div>
          </div>

          {selectedCard === 'Outro' && (
              <div className="animate-in slide-in-from-top-2 duration-300 space-y-2 bg-black/5 p-3 rounded-xl border border-black/5">
                  <div>
                    <label className={`block text-xs font-medium ${styles.textLabel} mb-1`}>Nome do Cartão</label>
                    <input
                        required
                        type="text"
                        value={customCardName}
                        onChange={(e) => setCustomCardName(e.target.value)}
                        className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-3 py-2 text-sm ${styles.inputText} focus:ring-1 focus:ring-${themeColor}-500 outline-none`}
                        placeholder="Ex: XP Visa Infinite"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={saveCustomCard}
                        onChange={(e) => setSaveCustomCard(e.target.checked)}
                        className={`w-4 h-4 rounded ${styles.inputBg} ${styles.checkboxBorder} text-${themeColor}-600 focus:ring-${themeColor}-500`}
                      />
                      <span className={`text-xs ${styles.textLabel}`}>Salvar na minha lista de cartões?</span>
                  </label>
              </div>
          )}

          <button
            type="submit"
            className={`w-full mt-4 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-${themeColor}-900/20`}
          >
            Salvar Parcelamento
          </button>
        </form>
      </div>
    </div>
  );
};
