import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, History, Calendar, ArrowUpRight, ArrowDownRight, Target, Trash2, BarChart3, List } from 'lucide-react';
import { FinancialGoal, GoalTransaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GoalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
  transactions: GoalTransaction[];
  onUpdateBalance: (amount: number, type: 'add' | 'remove') => void;
  onDeleteTransaction?: (transactionId: string) => void;
  themeColor: string;
  isDarkMode: boolean;
}

export const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  goal, 
  transactions,
  onUpdateBalance,
  onDeleteTransaction,
  themeColor,
  isDarkMode
}) => {
  const [mode, setMode] = useState<'view' | 'add' | 'remove'>('view');
  const [historyView, setHistoryView] = useState<'list' | 'chart'>('list');
  const [amount, setAmount] = useState('');

  // Process data for Chart (Monthly net change)
  const chartData = useMemo(() => {
    if (!goal) return [];
    
    const monthlyData: Record<string, number> = {};
    const sorted = transactions
        .filter(t => t.goalId === goal.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Chronological for chart building

    sorted.forEach(t => {
        const date = new Date(t.date);
        // Key ex: "out/23"
        const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        const val = t.type === 'deposit' ? t.amount : -t.amount;
        monthlyData[key] = (monthlyData[key] || 0) + val;
    });

    return Object.entries(monthlyData).map(([name, value]) => ({ name, value }));
  }, [transactions, goal]);

  if (!isOpen || !goal) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onUpdateBalance(Number(amount), mode === 'add' ? 'add' : 'remove');
    setAmount('');
    setMode('view');
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  // Filter transactions for this goal and sort by date descending (for List View)
  const history = transactions
    .filter(t => t.goalId === goal.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  // Map theme string to hex color approx for chart
  const getThemeHex = () => {
     const colors: Record<string, string> = {
         indigo: '#6366f1', emerald: '#10b981', violet: '#8b5cf6', rose: '#f43f5e',
         cyan: '#06b6d4', amber: '#f59e0b', sky: '#0ea5e9', lime: '#84cc16', slate: '#64748b'
     };
     return colors[themeColor] || '#6366f1';
  };

  // Theme styles
  const styles = isDarkMode ? {
      modalBg: 'bg-slate-900 border-slate-800',
      headerBorder: 'border-slate-800 bg-slate-950/50',
      textHead: 'text-white',
      textMuted: 'text-slate-400',
      cardBg: 'bg-slate-950 border-slate-800',
      inputBg: 'bg-slate-950 border-slate-800',
      itemBg: 'bg-slate-950/50 border-slate-800',
      chartTooltipBg: '#0f172a',
      chartTooltipBorder: '#334155',
      chartText: '#f8fafc',
  } : {
      modalBg: 'bg-white border-slate-200',
      headerBorder: 'border-slate-100 bg-slate-50/80',
      textHead: 'text-slate-900',
      textMuted: 'text-slate-500',
      cardBg: 'bg-slate-50 border-slate-200',
      inputBg: 'bg-white border-slate-200',
      itemBg: 'bg-slate-50 border-slate-100',
      chartTooltipBg: '#ffffff',
      chartTooltipBorder: '#e2e8f0',
      chartText: '#1e293b',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.modalBg} border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center p-5 border-b ${styles.headerBorder} shrink-0`}>
          <div className="flex items-center gap-2">
            <Target className={`text-${themeColor}-500`} size={20} />
            <h2 className={`text-lg font-bold ${styles.textHead} truncate max-w-[200px]`}>{goal.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
            
            {/* INPUT MODE */}
            {mode !== 'view' && (
                <form onSubmit={handleConfirm} className="p-6 space-y-6 animate-in slide-in-from-right duration-200">
                    <div className="text-center">
                        <p className={`text-sm ${styles.textMuted} mb-1`}>
                            {mode === 'add' ? 'Quanto você quer guardar?' : 'Quanto você vai retirar?'}
                        </p>
                    </div>

                    <div>
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
                            className={`w-full border-2 rounded-xl pl-12 pr-4 py-4 text-3xl font-bold outline-none transition-colors text-center ${styles.inputBg} ${isDarkMode ? 'text-white' : 'text-slate-900'} ${
                                mode === 'add' 
                                ? `focus:border-emerald-500` 
                                : `focus:border-rose-500`
                            }`}
                            placeholder="0.00"
                        />
                        </div>
                        {mode === 'add' && (
                            <p className="text-xs text-center text-emerald-500/80 mt-2">
                                * Este valor será descontado do seu saldo mensal atual.
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setMode('view'); setAmount(''); }}
                            className={`flex-1 py-3 ${styles.textMuted} hover:${styles.textHead} font-medium`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 py-3 font-bold text-white rounded-xl shadow-lg transition-transform active:scale-95 ${
                                mode === 'add'
                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
                            }`}
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            )}

            {/* VIEW MODE */}
            {mode === 'view' && (
                <div className="p-6 space-y-6 animate-in slide-in-from-left duration-200">
                    
                    {/* Status Card */}
                    <div className={`${styles.cardBg} rounded-xl p-5 border text-center relative overflow-hidden`}>
                        <div className={`absolute top-0 left-0 h-1 bg-${themeColor}-500 transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                        <p className={`text-sm ${styles.textMuted} mb-1`}>Saldo Acumulado</p>
                        <p className={`text-3xl font-bold ${styles.textHead} mb-4`}>{formatCurrency(goal.currentAmount)}</p>
                        
                        <div className={`grid grid-cols-2 gap-4 text-xs border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pt-4`}>
                            <div>
                                <span className="text-slate-500 block">Meta Total</span>
                                <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} font-mono`}>{formatCurrency(goal.targetAmount)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Falta</span>
                                <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} font-mono`}>{formatCurrency(remaining)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setMode('add')}
                            className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors"
                        >
                            <Plus size={18} /> Aportar
                        </button>
                        <button 
                            onClick={() => setMode('remove')}
                            className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors"
                        >
                            <Minus size={18} /> Resgatar
                        </button>
                    </div>

                    {/* History Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-sm font-bold ${styles.textHead} flex items-center gap-2`}>
                                <History size={16} className={`text-${themeColor}-500`} />
                                Histórico
                            </h3>
                            
                            {/* Toggle View Icons */}
                            <div className={`flex p-1 rounded-lg border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                                <button 
                                    onClick={() => setHistoryView('list')}
                                    className={`p-1.5 rounded-md transition-all ${historyView === 'list' ? `bg-${themeColor}-500/20 text-${themeColor}-500` : 'text-slate-400 hover:text-slate-500'}`}
                                    title="Lista"
                                >
                                    <List size={16} />
                                </button>
                                <button 
                                    onClick={() => setHistoryView('chart')}
                                    className={`p-1.5 rounded-md transition-all ${historyView === 'chart' ? `bg-${themeColor}-500/20 text-${themeColor}-500` : 'text-slate-400 hover:text-slate-500'}`}
                                    title="Gráfico Mensal"
                                >
                                    <BarChart3 size={16} />
                                </button>
                            </div>
                        </div>
                        
                        {/* CHART VIEW */}
                        {historyView === 'chart' ? (
                            <div className={`h-[200px] w-full ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50'} rounded-xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} p-2`}>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10 }} 
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10 }}
                                            />
                                            <Tooltip 
                                                formatter={(val: number) => formatCurrency(val)}
                                                contentStyle={{ backgroundColor: styles.chartTooltipBg, borderColor: styles.chartTooltipBorder, borderRadius: '8px', color: styles.chartText, fontSize: '12px' }}
                                                cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
                                            />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? getThemeHex() : '#f43f5e'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                                        Sem dados suficientes para gráfico.
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* LIST VIEW */
                            <div className="space-y-3">
                                {history.length === 0 ? (
                                    <div className={`text-center py-8 text-slate-500 text-xs border border-dashed rounded-xl ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                                        Nenhuma movimentação registrada ainda.
                                    </div>
                                ) : (
                                    history.map(t => (
                                        <div key={t.id} className={`flex items-center justify-between p-3 ${styles.itemBg} rounded-xl border`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${t.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {t.type === 'deposit' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${styles.textHead}`}>
                                                        {t.type === 'deposit' ? 'Aporte' : 'Retirada'}
                                                    </p>
                                                    <p className={`text-[10px] ${styles.textMuted}`}>{formatDate(t.date)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-bold ${t.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {t.type === 'deposit' ? '+' : '-'} {formatCurrency(t.amount)}
                                                </span>
                                                {onDeleteTransaction && (
                                                    <button 
                                                        onClick={() => onDeleteTransaction(t.id)} 
                                                        className="text-slate-500 hover:text-rose-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};