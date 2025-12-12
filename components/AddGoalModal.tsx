import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FinancialGoal } from '../types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<FinancialGoal, 'id'>) => void;
  initialData?: FinancialGoal | null;
  themeColor: string;
  isDarkMode: boolean;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSave, initialData, themeColor, isDarkMode }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setTargetAmount(initialData.targetAmount.toString());
        setCurrentAmount(initialData.currentAmount.toString());
        setDeadline(initialData.deadline || '');
      } else {
        setTitle('');
        setTargetAmount('');
        setCurrentAmount('0');
        setDeadline('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline: deadline || undefined,
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
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl transition-colors duration-300`}>
        <div className={`flex justify-between items-center p-6 border-b ${styles.border}`}>
          <h2 className={`text-xl font-bold ${styles.textHead}`}>
            {initialData ? 'Editar Meta' : 'Nova Meta Financeira'}
          </h2>
          <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Nome da Meta</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
              placeholder="Ex: Comprar Carro, Viagem"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Valor Alvo (R$)</label>
            <input
              required
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
              placeholder="20000.00"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Valor Já Guardado (R$)</label>
            <input
              required
              type="number"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
              placeholder="0.00"
            />
          </div>

          <div>
            <div className="flex justify-between">
              <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Data Limite</label>
              <span className="text-xs text-slate-500 italic">Opcional</span>
            </div>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
            />
          </div>

          <button
            type="submit"
            className={`w-full mt-4 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-${themeColor}-900/20`}
          >
            {initialData ? 'Atualizar Meta' : 'Criar Meta'}
          </button>
        </form>
      </div>
    </div>
  );
};