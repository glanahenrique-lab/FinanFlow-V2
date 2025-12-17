import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Subscription } from '../types';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Omit<Subscription, 'id'>) => void;
  initialData?: Subscription | null;
  themeColor: string;
  isDarkMode: boolean;
  userCustomCards?: string[];
}

const DEFAULT_CARDS = ['Dinheiro', 'Sem Cartão', 'Nubank', 'Inter', 'Itaú', 'Bradesco', 'Santander', 'C6 Bank'];

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  themeColor, 
  isDarkMode,
  userCustomCards = []
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [category, setCategory] = useState('Serviços');
  const [selectedCard, setSelectedCard] = useState('Sem Cartão');

  const availableCards = Array.from(new Set([...DEFAULT_CARDS, ...userCustomCards]));

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setAmount(initialData.amount.toString());
        setPaymentDay(initialData.paymentDay.toString());
        setCategory(initialData.category);
        setSelectedCard(initialData.card || 'Sem Cartão');
      } else {
        setName('');
        setAmount('');
        setPaymentDay('');
        setCategory('Serviços');
        setSelectedCard('Sem Cartão');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      amount: Number(amount),
      paymentDay: Number(paymentDay),
      category,
      card: selectedCard
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
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl transition-colors duration-300 flex flex-col max-h-[90vh]`}>
        <div className={`flex justify-between items-center p-6 border-b ${styles.border}`}>
          <h2 className={`text-xl font-bold ${styles.textHead}`}>
            {initialData ? 'Editar Assinatura' : 'Nova Assinatura'}
          </h2>
          <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Nome da Assinatura</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
              placeholder="Ex: Netflix, Internet, Academia"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Valor Mensal (R$)</label>
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
              <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Dia do Vencimento</label>
              <input
                required
                type="number"
                min="1"
                max="31"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
                placeholder="Ex: 10"
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
              <option>Serviços</option>
              <option>Moradia</option>
              <option>Lazer</option>
              <option>Educação</option>
              <option>Saúde</option>
              <option>Outros</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Debitar de qual cartão?</label>
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
            {initialData ? 'Salvar Alterações' : 'Criar Assinatura'}
          </button>
        </form>
      </div>
    </div>
  );
};