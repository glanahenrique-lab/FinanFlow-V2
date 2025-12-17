import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction | null;
  themeColor: string;
  isDarkMode: boolean;
  userCustomCards?: string[];
}

const DEFAULT_CARDS = ['Dinheiro', 'Sem Cartão', 'Nubank', 'Inter', 'Itaú', 'Bradesco', 'Santander', 'C6 Bank'];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  themeColor, 
  isDarkMode,
  userCustomCards = []
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCard, setSelectedCard] = useState('Dinheiro');

  // Combine default cards with user custom cards
  const availableCards = Array.from(new Set([...DEFAULT_CARDS, ...userCustomCards]));

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDescription(initialData.description);
        setAmount(initialData.amount.toString());
        setCategory(initialData.category);
        setType(initialData.type);
        setDate(initialData.date);
        setSelectedCard(initialData.card || 'Dinheiro');
      } else {
        setDescription('');
        setAmount('');
        setCategory('Alimentação');
        setType('expense');
        setDate(new Date().toISOString().split('T')[0]);
        setSelectedCard('Dinheiro');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      description,
      amount: Number(amount),
      category,
      type,
      date,
      card: selectedCard
    });
  };

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    textHead: 'text-white',
    textLabel: 'text-slate-400',
    inputBg: 'bg-slate-950',
    inputBorder: 'border-slate-800',
    inputText: 'text-white',
    closeHover: 'hover:text-white'
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    textHead: 'text-slate-900',
    textLabel: 'text-slate-500',
    inputBg: 'bg-slate-50',
    inputBorder: 'border-slate-200',
    inputText: 'text-slate-900',
    closeHover: 'hover:text-slate-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-colors duration-300 flex flex-col max-h-[90vh]`}>
        <div className={`flex justify-between items-center p-6 border-b ${styles.border}`}>
          <h2 className={`text-xl font-bold ${styles.textHead}`}>
            {initialData ? 'Editar Movimentação' : 'Nova Movimentação'}
          </h2>
          <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Tipo</label>
            <div className={`flex gap-2 p-1 rounded-lg ${styles.inputBg} border ${styles.inputBorder}`}>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-red-500/20 text-red-500 shadow-sm' : 'text-slate-500 hover:text-slate-400'}`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-emerald-500/20 text-emerald-500 shadow-sm' : 'text-slate-500 hover:text-slate-400'}`}
              >
                Receita
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Descrição</label>
            <input
              required
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none transition-all`}
              placeholder="Ex: Mercado, Salário"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Valor (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Data</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none appearance-none`}
            >
              <option>Alimentação</option>
              <option>Moradia</option>
              <option>Transporte</option>
              <option>Lazer</option>
              <option>Saúde</option>
              <option>Salário</option>
              <option>Investimento</option>
              <option>Outros</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Meio de Pagamento / Cartão</label>
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
                </select>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full mt-4 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-${themeColor}-900/20`}
          >
            {initialData ? 'Atualizar Movimentação' : 'Salvar Movimentação'}
          </button>
        </form>
      </div>
    </div>
  );
};