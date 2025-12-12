import React from 'react';
import { X, PieChart as PieIcon, TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';
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
  isDarkMode
}) => {
  if (!isOpen) return null;

  const comparisonData = [
    { name: 'Receitas', amount: totalIncome },
    { name: 'Despesas', amount: totalExpense },
  ];

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    headerBg: 'bg-slate-900',
    textHead: 'text-white',
    textMuted: 'text-slate-400',
    textBody: 'text-slate-300',
    cardBg: 'bg-slate-950',
    cardBorder: 'border-slate-800',
    sectionBg: 'bg-slate-800/50',
    sectionBorder: 'border-slate-700',
    closeBg: 'bg-slate-800',
    closeHover: 'hover:text-white',
    chartTooltipBg: '#1e293b',
    chartTooltipBorder: '#334155',
    chartText: '#f1f5f9',
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    headerBg: 'bg-slate-50',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
    textBody: 'text-slate-700',
    cardBg: 'bg-slate-50',
    cardBorder: 'border-slate-200',
    sectionBg: 'bg-slate-50',
    sectionBorder: 'border-slate-200',
    closeBg: 'bg-slate-200',
    closeHover: 'hover:text-slate-900',
    chartTooltipBg: '#ffffff',
    chartTooltipBorder: '#e2e8f0',
    chartText: '#1e293b',
  };

  // Função simples para formatar o texto da IA em seções visuais
  const renderAnalysisContent = () => {
    if (isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className={`w-16 h-16 border-4 border-${themeColor}-500 border-t-transparent rounded-full animate-spin`}></div>
                <p className={`text-${themeColor}-400 font-medium animate-pulse text-lg`}>Consultando a IA...</p>
                <p className={styles.textMuted + " text-sm"}>Analisando gastos, parcelas e metas.</p>
            </div>
        );
    }

    if (!aiAnalysis) return null;

    // Divide o texto baseado nos cabeçalhos esperados do prompt
    const sections = aiAnalysis.split(/\d\.\s/); 
    
    // Mapeamento de ícones para seções (heurística simples)
    const getIconForSection = (text: string) => {
        if (text.includes('gastou') || text.includes('Gastos')) return <TrendingUp className="text-red-400" />;
        if (text.includes('melhorar') || text.includes('Melhoria')) return <AlertTriangle className="text-orange-400" />;
        if (text.includes('Metas')) return <Target className="text-teal-400" />;
        if (text.includes('Renda') || text.includes('Extra')) return <Lightbulb className="text-yellow-400" />;
        return <PieIcon className={`text-${themeColor}-400`} />;
    };

    return (
        <div className="space-y-6">
            {sections.map((section, index) => {
                if (!section.trim()) return null;
                // Tenta extrair um título da primeira linha
                const lines = section.trim().split('\n');
                const title = lines[0];
                const content = lines.slice(1).join('\n');

                return (
                    <div key={index} className={`${styles.sectionBg} border ${styles.sectionBorder} rounded-xl p-5 hover:border-${themeColor}-500/30 transition-colors`}>
                        <h3 className={`text-lg font-bold ${styles.textHead} mb-3 flex items-center gap-2`}>
                            {getIconForSection(title)}
                            {title.replace(/[:|📊|💡|🎯|🚀]/g, '').trim()}
                        </h3>
                        <div className={`${styles.textBody} text-sm whitespace-pre-wrap leading-relaxed`}>
                            {content}
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden transition-colors duration-300`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${styles.border} ${styles.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${themeColor}-600 rounded-lg text-white`}>
                <PieIcon size={24} />
            </div>
            <div>
                <h2 className={`text-2xl font-bold ${styles.textHead}`}>Relatório Financeiro Inteligente</h2>
                <p className={`text-sm ${styles.textMuted}`}>Análise de dados + Sugestões da IA</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 ${styles.closeBg} hover:opacity-80 rounded-full text-slate-500 ${styles.closeHover} transition-colors`}>
            <X size={24} />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Visuals */}
                <div className="space-y-6">
                    {/* Pie Chart Card */}
                    <div className={`${styles.cardBg} border ${styles.cardBorder} rounded-2xl p-6 shadow-lg`}>
                        <h3 className={`${styles.textHead} font-semibold mb-6 text-center`}>Distribuição de Gastos do Mês</h3>
                        <div className="h-[300px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                                        contentStyle={{ backgroundColor: styles.chartTooltipBg, borderColor: styles.chartTooltipBorder, borderRadius: '8px', color: styles.chartText }}
                                        itemStyle={{ color: styles.chartText }}
                                    />
                                </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className={`h-full flex items-center justify-center ${styles.textMuted}`}>Sem dados suficientes</div>
                            )}
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            {chartData.map((entry, index) => (
                                <div key={index} className={`flex items-center gap-2 text-xs ${styles.textMuted}`}>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="truncate flex-1">{entry.name}</span>
                                    <span className={`font-bold ${styles.textHead}`}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bar Chart Comparison */}
                    <div className={`${styles.cardBg} border ${styles.cardBorder} rounded-2xl p-6 shadow-lg`}>
                        <h3 className={`${styles.textHead} font-semibold mb-6 text-center`}>Balanço: Receitas vs Despesas</h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b'}} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                                        contentStyle={{ backgroundColor: styles.chartTooltipBg, borderColor: styles.chartTooltipBorder, borderRadius: '8px', color: styles.chartText }}
                                        itemStyle={{ color: styles.chartText }}
                                    />
                                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                                        {comparisonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === 'Receitas' ? '#10b981' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Content */}
                <div>
                     <div className="sticky top-0">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className={`text-xl font-bold text-${themeColor}-400`}>Análise do Consultor IA</h3>
                            {!isAnalyzing && aiAnalysis && (
                                <span className={`text-xs bg-${themeColor}-500/20 text-${themeColor}-500 px-3 py-1 rounded-full border border-${themeColor}-500/30`}>
                                    Atualizado agora
                                </span>
                            )}
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