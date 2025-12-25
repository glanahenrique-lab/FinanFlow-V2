
import React from 'react';
/* Fixed: Added missing Sparkles import from lucide-react */
import { X, PieChart as PieIcon, TrendingUp, AlertTriangle, Target, Lightbulb, ShieldCheck, Zap, BarChart3, Activity, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiAnalysis: string;
  isAnalyzing: boolean;
  chartData: { name: string; value: number }[];
  totalIncome: number;
  totalExpense: number;
  themeColor: string;
  isDarkMode: boolean;
  isPrivacyMode?: boolean;
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#3b82f6'];

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({ 
  isOpen, 
  onClose, 
  aiAnalysis, 
  isAnalyzing, 
  chartData,
  totalIncome,
  totalExpense,
  themeColor,
  isDarkMode,
  isPrivacyMode = false
}) => {
  if (!isOpen) return null;

  const comparisonData = [
    { name: 'Receitas', amount: totalIncome },
    { name: 'Despesas', amount: totalExpense },
  ];

  const formatValue = (val: number) => {
      if (isPrivacyMode) return '••••';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const styles = isDarkMode ? {
    bg: 'bg-slate-950',
    border: 'border-slate-800',
    headerBg: 'bg-slate-900/50',
    textHead: 'text-white',
    textMuted: 'text-slate-400',
    textBody: 'text-slate-300',
    cardBg: 'bg-slate-900/40',
    cardBorder: 'border-slate-800/60',
    sectionBg: 'bg-slate-900/60',
    sectionBorder: 'border-slate-800',
    closeBg: 'bg-slate-800',
    closeHover: 'hover:text-white',
  } : {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    headerBg: 'bg-white',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
    textBody: 'text-slate-700',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200',
    sectionBg: 'bg-white',
    sectionBorder: 'border-slate-200',
    closeBg: 'bg-slate-200',
    closeHover: 'hover:text-slate-900',
  };

  const renderAnalysisContent = () => {
    if (isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-8">
                <div className="relative">
                    <div className={`w-20 h-20 border-4 border-${themeColor}-500/20 border-t-${themeColor}-500 rounded-full animate-spin`}></div>
                    <Activity className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-${themeColor}-500 animate-pulse`} size={32} />
                </div>
                <div className="text-center">
                    <p className={`text-xl font-black ${styles.textHead} uppercase tracking-tighter`}>Processando Neurônios Financeiros</p>
                    <p className={`${styles.textMuted} text-xs font-bold uppercase tracking-[0.2em] mt-2`}>Foxy está calculando seu score de saúde...</p>
                </div>
            </div>
        );
    }

    if (!aiAnalysis) return null;

    // Split by numeric headers like "1. ", "2. ", etc.
    const sections = aiAnalysis.split(/\n(?=\d\.\s)/); 
    
    const getIconAndColor = (text: string) => {
        if (text.includes('SCORE')) return { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
        if (text.includes('50/30/20')) return { icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
        if (text.includes('RISCO')) return { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
        if (text.includes('AÇÃO')) return { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
        if (text.includes('INVESTIMENTOS')) return { icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
        return { icon: Lightbulb, color: `text-${themeColor}-500`, bg: `bg-${themeColor}-500/10`, border: `border-${themeColor}-500/20` };
    };

    return (
        <div className={`space-y-6 pb-12 ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
            {sections.map((section, index) => {
                if (!section.trim()) return null;
                const lines = section.trim().split('\n');
                const titleLine = lines[0];
                const content = lines.slice(1).join('\n');
                const style = getIconAndColor(titleLine.toUpperCase());
                const Icon = style.icon;

                return (
                    <div key={index} className={`${styles.sectionBg} border ${style.border} rounded-[2rem] p-6 sm:p-8 shadow-sm transition-all hover:scale-[1.01]`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-2xl ${style.bg} ${style.color}`}>
                                <Icon size={24} />
                            </div>
                            <h3 className={`text-lg font-black ${styles.textHead} uppercase tracking-tighter`}>
                                {titleLine.replace(/^\d\.\s/, '').trim()}
                            </h3>
                        </div>
                        <div className={`${styles.textBody} text-sm whitespace-pre-wrap leading-relaxed font-medium`}>
                            {content.split('- ').map((item, i) => (
                                item.trim() ? (
                                    <div key={i} className="flex gap-3 mb-3 group">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${style.color} group-hover:scale-150 transition-transform`}></div>
                                        <span>{item}</span>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-[3rem] w-full max-w-6xl h-[92vh] shadow-2xl flex flex-col overflow-hidden transition-colors duration-500`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center p-6 sm:p-8 border-b ${styles.border} ${styles.headerBg} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 bg-${themeColor}-600 rounded-2xl text-white shadow-lg`}>
                <Activity size={28} />
            </div>
            <div>
                <h2 className={`text-2xl sm:text-3xl font-black ${styles.textHead} tracking-tight uppercase`}>Check-up Financeiro</h2>
                <p className={`${styles.textMuted} text-[10px] font-black uppercase tracking-[0.2em]`}>Inteligência Analítica Foxy V3.5</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-3 ${styles.closeBg} hover:opacity-80 rounded-2xl text-slate-500 ${styles.closeHover} transition-all active:scale-90 relative z-10`}>
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Visual Stats Column */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`${styles.cardBg} border ${styles.cardBorder} rounded-[2.5rem] p-6 shadow-sm`}>
                        <h3 className={`${styles.textHead} text-[10px] font-black uppercase tracking-widest mb-6 text-center opacity-60`}>Fluxo de Caixa</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold', fontSize: 10}} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                                    />
                                    <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={40}>
                                        {comparisonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === 'Receitas' ? '#10b981' : '#f43f5e'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={`${styles.cardBg} border ${styles.cardBorder} rounded-[2.5rem] p-6 shadow-sm`}>
                        <h3 className={`${styles.textHead} text-[10px] font-black uppercase tracking-widest mb-6 text-center opacity-60`}>Categorias Críticas</h3>
                        <div className="h-[220px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} cornerRadius={10} dataKey="value" stroke="none">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className={`h-full flex items-center justify-center ${styles.textMuted} text-xs font-bold uppercase`}>Dados Insuficientes</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Report Column */}
                <div className="lg:col-span-8">
                     <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="text-amber-500" size={20} />
                            <h3 className={`text-xl font-black ${styles.textHead} uppercase tracking-tighter`}>Diagnóstico da Inteligência</h3>
                        </div>
                        {renderAnalysisContent()}
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
