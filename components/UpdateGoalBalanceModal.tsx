import React, { useState } from 'react';
import { X, Plus, Minus, ArrowRight } from 'lucide-react';

interface UpdateGoalBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, type: 'add' | 'remove') => void;
  goalTitle: string;
  currentBalance: number;
  themeColor: string;
}

export const UpdateGoalBalanceModal: React.FC<UpdateGoalBalanceModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  goalTitle,
  currentBalance,
  themeColor
}) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'add' | 'remove'>('add');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onConfirm(Number(amount), type);
    setAmount('');
    setType('add');
    onClose();
  };

  const newBalance = type === 'add' 
    ? currentBalance + Number(amount) 
    : currentBalance - Number(amount);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-950/50">
          <h2 className="text-lg font-bold text-white">Atualizar Saldo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Meta</p>
            <p className="text-xl font-bold text-white">{goalTitle}</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('add')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                type === 'add' 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Plus size={16} />
              Aportar
            </button>
            <button
              type="button"
              onClick={() => setType('remove')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                type === 'remove' 
                  ? 'bg-rose-500 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Minus size={16} />
              Retirar
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 text-center">
              Valor {type === 'add' ? 'do Aporte' : 'da Retirada'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className={`w-full bg-slate-950 border-2 rounded-xl pl-12 pr-4 py-3 text-2xl font-bold text-white outline-none transition-colors text-center ${
                    type === 'add' 
                    ? `border-slate-800 focus:border-${themeColor}-500` 
                    : `border-slate-800 focus:border-rose-500`
                }`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Preview do Saldo */}
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center justify-between text-sm">
             <div className="text-slate-400">Saldo Atual:</div>
             <div className="text-slate-300 font-medium">R$ {currentBalance.toFixed(2)}</div>
          </div>
          <div className="flex justify-center">
             <ArrowRight className="text-slate-600 rotate-90" size={20} />
          </div>
          <div className={`rounded-xl p-3 flex items-center justify-between text-sm border ${type === 'add' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
             <div className={type === 'add' ? 'text-emerald-200' : 'text-rose-200'}>Novo Saldo:</div>
             <div className={`font-bold text-lg ${type === 'add' ? 'text-emerald-400' : 'text-rose-400'}`}>
                R$ {Math.max(0, newBalance).toFixed(2)}
             </div>
          </div>

          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-transform active:scale-95 ${
                type === 'add'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
            }`}
          >
            Confirmar {type === 'add' ? 'Aporte' : 'Retirada'}
          </button>
        </form>
      </div>
    </div>
  );
};