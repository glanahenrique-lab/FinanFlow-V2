
import React, { useState, useEffect } from 'react';
import { X, Calculator, Info } from 'lucide-react';
import { Investment } from '../types';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investment: Omit<Investment, 'id'>) => void;
  themeColor: string;
  isDarkMode: boolean;
}

export const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ isOpen, onClose, onSave, themeColor, isDarkMode }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Renda Fixa');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  // Cálculo automático do total investido (exibido apenas visualmente no modal)
  const totalInvested = (Number(quantity) || 0) * (Number(purchasePrice) || 0);

  useEffect(() => {
      if (isOpen) {
          setName('');
          setCategory('Renda Fixa');
          setDate(new Date().toISOString().split('T')[0]);
          setQuantity('');
          setPurchasePrice('');
          setCurrentPrice('');
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalInvested <= 0) {
        alert("O valor total do investimento deve ser maior que zero.");
        return;
    }

    onSave({
      name,
      category,
      date,
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      currentPrice: Number(currentPrice) || Number(purchasePrice),
      totalInvested: totalInvested
    });
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
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    textHead: 'text-slate-900',
    textLabel: 'text-slate-500',
    inputBg: 'bg-slate-50',
    inputBorder: 'border-slate-200',
    inputText: 'text-slate-900',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden transition-colors duration-300 flex flex-col`}>
        <div className={`flex justify-between items-center p-6 border-b ${styles.border}`}>
          <h2 className={`text-xl font-black ${styles.textHead} uppercase tracking-tighter`}>Registrar Ativo</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={`block text-[10px] font-black uppercase tracking-widest ${styles.textLabel} mb-1.5 ml-1`}>Nome do Ativo</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-xl px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                  placeholder="Ex: Bitcoin, PETR4, Tesouro"
                />
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest ${styles.textLabel} mb-1.5 ml-1`}>Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-xl px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none appearance-none`}
                >
                  <option>Cripto</option>
                  <option>Ações</option>
                  <option>FIIs</option>
                  <option>Renda Fixa</option>
                  <option>Outros</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest ${styles.textLabel} mb-1.5 ml-1`}>Data do Aporte</label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-xl px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest ${styles.textLabel} mb-1.5 ml-1`}>Quantidade</label>
              <input
                required
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-xl px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest ${styles.textLabel} mb-1.5 ml-1`}>Preço Unitário (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-xl px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'} border flex items-center justify-between`}>
             <div className="flex items-center gap-2">
                <Calculator className="text-emerald-500" size={18} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Total Aplicado</span>
             </div>
             <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested)}
             </span>
          </div>

          <div className="flex items-start gap-2 p-2 opacity-60">
             <Info size={14} className="shrink-0 mt-0.5" />
             <p className="text-[9px] font-medium leading-relaxed">Você poderá atualizar o preço atual do ativo manualmente na lista após salvar.</p>
          </div>

          <button
            type="submit"
            className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs`}
          >
            Confirmar Investimento
          </button>
        </form>
      </div>
    </div>
  );
};
