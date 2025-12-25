import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  Target, 
  History,
  Trash2,
  Edit3,
  RefreshCw,
  Gem,
  AlertCircle
} from 'lucide-react';
import { Investment } from '../types';
import { SummaryCard } from './SummaryCard';
import { FoxyMascot } from '../App';

interface InvestmentsTabProps {
  investments: Investment[];
  onAddClick: () => void;
  onDelete: (id: string, data: Investment) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  themeColor: string;
  isDarkMode: boolean;
  isPrivacyMode: boolean;
}

export const InvestmentsTab: React.FC<InvestmentsTabProps> = ({ 
  investments, 
  onAddClick, 
  onDelete, 
  onUpdatePrice,
  themeColor, 
  isDarkMode,
  isPrivacyMode 
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newPriceInput, setNewPriceInput] = useState('');

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Cálculos do Dashboard baseados na lista filtrada recebida
  const totalApplied = investments.reduce((acc, inv) => acc + (inv.totalInvested || 0), 0);
  const currentMarketValue = investments.reduce((acc, inv) => acc + (inv.quantity * (inv.currentPrice || inv.purchasePrice)), 0);
  const profitLoss = currentMarketValue - totalApplied;
  const profitPercentage = totalApplied > 0 ? (profitLoss / totalApplied) * 100 : 0;

  const handleUpdatePrice = (e: React.FormEvent, id: string) => {
      e.preventDefault();
      const price = Number(newPriceInput);
      if (isNaN(price) || price < 0) return;
      onUpdatePrice(id, price);
      setUpdatingId(null);
      setNewPriceInput('');
  };

  const styles = isDarkMode ? {
    card: 'bg-slate-900 border-slate-800',
    textHead: 'text-white',
    textMuted: 'text-slate-400',
    itemBg: 'bg-slate-950/50 hover:bg-slate-950',
    input: 'bg-slate-900 border-slate-700 text-white'
  } : {
    card: 'bg-white border-slate-200',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
    itemBg: 'bg-slate-50 hover:bg-slate-100',
    input: 'bg-white border-slate-200 text-slate-900'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* DASHBOARD TOP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Aplicado" 
          value={totalApplied} 
          icon={Wallet} 
          variant="default" 
          formatter={formatCurrency} 
          isDarkMode={isDarkMode} 
          isPrivacyMode={isPrivacyMode} 
          themeColor={themeColor} 
        />
        <SummaryCard 
          title="Valor de Mercado" 
          value={currentMarketValue} 
          icon={Target} 
          variant="investment" 
          formatter={formatCurrency} 
          isDarkMode={isDarkMode} 
          isPrivacyMode={isPrivacyMode} 
          themeColor={themeColor} 
        />
        <SummaryCard 
          title="Resultado (Lucro/Prej)" 
          value={profitLoss} 
          icon={profitLoss >= 0 ? TrendingUp : TrendingDown} 
          variant={profitLoss >= 0 ? 'income' : 'expense'} 
          formatter={formatCurrency} 
          isDarkMode={isDarkMode} 
          isPrivacyMode={isPrivacyMode} 
          themeColor={themeColor} 
          details={
            <div className={`flex items-center gap-1 font-black ${profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {profitLoss >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {profitPercentage.toFixed(2)}% de rentabilidade
            </div>
          }
        />
      </div>

      {/* LISTA DE ATIVOS */}
      <div className={`${styles.card} border rounded-[3rem] p-6 lg:p-8 shadow-sm overflow-hidden relative group`}>
        <div className="flex justify-between items-center mb-8">
            <h3 className={`text-sm lg:text-base font-black ${styles.textHead} flex items-center gap-3 uppercase tracking-widest`}>
                <Coins className={`text-${themeColor}-500`} size={18} /> Carteira Detalhada
            </h3>
        </div>

        {investments.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
                <Gem size={48} className="text-slate-400 mb-4 opacity-20" />
                <p className={`${styles.textMuted} text-xs font-black uppercase tracking-widest`}>Não há ativos registrados até esta data.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {investments.map((inv) => {
                    const marketVal = inv.quantity * (inv.currentPrice || inv.purchasePrice);
                    const perf = marketVal - inv.totalInvested;
                    const isPositive = perf >= 0;

                    return (
                        <div key={inv.id} className={`${styles.itemBg} border ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} p-5 rounded-3xl transition-all group/item flex flex-col md:flex-row md:items-center justify-between gap-6`}>
                            <div className="flex items-center gap-5 flex-1 min-w-0">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-${themeColor}-500/10 text-${themeColor}-500 border border-${themeColor}-500/20`}>
                                    <Gem size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`font-black ${styles.textHead} truncate text-sm uppercase tracking-tighter`}>{inv.name}</h4>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-500/10 ${styles.textMuted}`}>{inv.category}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>{inv.quantity} UNIDADES</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 flex-1 md:justify-items-end items-center">
                                <div className="text-left md:text-right">
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${styles.textMuted} mb-1`}>Custo Médio</p>
                                    <p className={`text-sm font-black ${styles.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>{formatCurrency(inv.purchasePrice)}</p>
                                </div>

                                <div className="text-left md:text-right">
                                    <div className="flex items-center gap-1 md:justify-end mb-1">
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${styles.textMuted}`}>Preço Atual</p>
                                        <button onClick={() => { setUpdatingId(inv.id); setNewPriceInput(inv.currentPrice.toString()); }} className={`p-1 rounded hover:bg-${themeColor}-500/10 text-${themeColor}-500 transition-colors`}>
                                            <Edit3 size={12} />
                                        </button>
                                    </div>
                                    {updatingId === inv.id ? (
                                        <form onSubmit={(e) => handleUpdatePrice(e, inv.id)} className="flex items-center gap-2">
                                            <input 
                                                autoFocus
                                                type="number" 
                                                step="0.01" 
                                                value={newPriceInput}
                                                onChange={(e) => setNewPriceInput(e.target.value)}
                                                className={`w-24 px-2 py-1 text-xs font-black rounded-lg border ${styles.input} outline-none focus:ring-2 focus:ring-${themeColor}-500`}
                                            />
                                            <button type="submit" className="p-1 bg-emerald-500 text-white rounded-md"><RefreshCw size={10} /></button>
                                        </form>
                                    ) : (
                                        <p className={`text-sm font-black ${styles.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>{formatCurrency(inv.currentPrice || inv.purchasePrice)}</p>
                                    )}
                                </div>

                                <div className="text-left md:text-right col-span-2 md:col-span-1 border-t md:border-t-0 pt-4 md:pt-0">
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${styles.textMuted} mb-1`}>Posição Atual</p>
                                    <p className={`text-lg font-black ${styles.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>{formatCurrency(marketVal)}</p>
                                    <div className={`flex items-center gap-1 md:justify-end text-[10px] font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {isPositive ? '+' : ''}{formatCurrency(perf)} ({((perf / inv.totalInvested) * 100).toFixed(1)}%)
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => onDelete(inv.id, inv)} 
                                className="p-3 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all self-center"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
      
      <div className={`flex items-center gap-4 p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-amber-500/5 border-amber-500/10 text-amber-200/60' : 'bg-amber-50 border-amber-200 text-amber-700'} text-xs font-medium italic`}>
          <AlertCircle size={20} className="shrink-0" />
          <p>Dica da Foxy: Navegue entre os meses para ver a evolução da sua carteira. Ativos criados em meses passados permanecem no radar!</p>
      </div>
    </div>
  );
};