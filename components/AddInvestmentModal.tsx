import React, { useState } from 'react';
import { X } from 'lucide-react';
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
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Renda Fixa');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      amount: Number(amount),
      type,
      date,
    });
    setName('');
    setAmount('');
    setType('Renda Fixa');
    setDate(new Date().toISOString().split('T')[0]);
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
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl transition-colors duration-300`}>
        <div className={`flex justify-between items-center p-6 border-b ${styles.border}`}>
          <h2 className={`text-xl font-bold ${styles.textHead}`}>Novo Investimento</h2>
          <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Nome do Ativo / Investimento</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
              placeholder="Ex: Tesouro Direto, AAPL, Bitcoin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Valor Aportado (R$)</label>
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
              <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Data do Aporte</label>
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
            <label className={`block text-sm font-medium ${styles.textLabel} mb-1`}>Tipo de Investimento</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-lg px-4 py-2.5 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none appearance-none`}
            >
              <option>Renda Fixa (CDB, Tesouro)</option>
              <option>Ações (Bolsa)</option>
              <option>FIIs (Fundos Imobiliários)</option>
              <option>Criptomoedas</option>
              <option>Fundos de Investimento</option>
              <option>Reserva de Emergência</option>
              <option>Outros</option>
            </select>
          </div>

          <button
            type="submit"
            className={`w-full mt-4 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-${themeColor}-900/20`}
          >
            Registrar Aporte
          </button>
        </form>
      </div>
    </div>
  );
};