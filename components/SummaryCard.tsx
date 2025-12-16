import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type SummaryVariant = 'income' | 'expense' | 'balance' | 'default' | 'alert' | 'investment';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: SummaryVariant;
  formatter: (value: number) => string;
  details?: React.ReactNode;
  isDarkMode: boolean;
  isPrivacyMode?: boolean;
  themeColor?: string;
  trend?: number; // Percentual change (e.g. 15.5 for +15.5%)
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default', 
  formatter, 
  details,
  isDarkMode,
  isPrivacyMode = false,
  themeColor = 'lime',
  trend
}) => {
  // Mapeamento de cores baseado no variant ou no tema global
  const getStyles = () => {
      const isBalance = variant === 'balance';
      
      // Se for 'balance' ou 'default', usa a cor do tema. Se for income/expense, usa cores semânticas.
      let colorKey = themeColor; 
      if (variant === 'income') colorKey = 'emerald';
      if (variant === 'expense') colorKey = 'rose';
      if (variant === 'alert') colorKey = 'orange';
      if (variant === 'default') colorKey = 'slate'; // Previsão usa neutro ou azulado
      if (variant === 'investment') colorKey = 'violet';

      // Classes dinâmicas baseadas na cor resolvida
      const colors: Record<string, any> = {
          lime: { text: 'text-lime-500', bg: 'bg-lime-500', border: 'border-lime-500/30', shadow: 'shadow-lime-500/20', from: 'from-lime-500/20', to: 'to-lime-500/5' },
          emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/20', from: 'from-emerald-500/20', to: 'to-emerald-500/5' },
          green: { text: 'text-green-500', bg: 'bg-green-600', border: 'border-green-500/30', shadow: 'shadow-green-500/20', from: 'from-green-500/20', to: 'to-green-500/5' },
          teal: { text: 'text-teal-400', bg: 'bg-teal-400', border: 'border-teal-500/30', shadow: 'shadow-teal-500/20', from: 'from-teal-500/20', to: 'to-teal-500/5' },
          cyan: { text: 'text-cyan-500', bg: 'bg-cyan-500', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/20', from: 'from-cyan-500/20', to: 'to-cyan-500/5' },
          yellow: { text: 'text-yellow-400', bg: 'bg-yellow-400', border: 'border-yellow-500/30', shadow: 'shadow-yellow-500/20', from: 'from-yellow-500/20', to: 'to-yellow-500/5' },
          amber: { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/30', shadow: 'shadow-amber-500/20', from: 'from-amber-500/20', to: 'to-amber-500/5' },
          rose: { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500/30', shadow: 'shadow-rose-500/20', from: 'from-rose-500/20', to: 'to-rose-500/5' },
          orange: { text: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500/30', shadow: 'shadow-orange-500/20', from: 'from-orange-500/20', to: 'to-orange-500/5' },
          slate: { text: isDarkMode ? 'text-slate-200' : 'text-slate-700', bg: 'bg-slate-500', border: 'border-slate-500/20', shadow: 'shadow-slate-500/10', from: isDarkMode ? 'from-slate-800/50' : 'from-slate-100', to: 'to-transparent' },
          violet: { text: 'text-violet-400', bg: 'bg-violet-500', border: 'border-violet-500/30', shadow: 'shadow-violet-500/20', from: 'from-violet-500/20', to: 'to-violet-500/5' },
      };

      const c = colors[colorKey] || colors['lime'];

      // Base Styles
      const baseBg = isDarkMode ? 'bg-slate-900/60' : 'bg-white/80';
      const hoverTransform = 'hover:shadow-md hover:-translate-y-0.5';
      
      return {
          container: `${baseBg} backdrop-blur-xl border ${c.border} rounded-3xl transition-all duration-300 group relative overflow-hidden ${hoverTransform} ${isBalance ? c.shadow + ' shadow-lg' : ''}`,
          gradient: `absolute inset-0 bg-gradient-to-br ${c.from} ${c.to} opacity-30 group-hover:opacity-50 transition-opacity duration-500`,
          iconWrapper: `p-3 rounded-2xl ${isDarkMode ? 'bg-slate-950/50' : 'bg-white/80'} border ${isDarkMode ? 'border-white/5' : 'border-black/5'} shadow-sm backdrop-blur-md`,
          iconColor: c.text,
          valueColor: isBalance || variant === 'income' || variant === 'expense' || variant === 'investment' ? c.text : (isDarkMode ? 'text-white' : 'text-slate-900'),
          labelColor: isDarkMode ? 'text-slate-400' : 'text-slate-500',
          watermark: c.text
      };
  };

  const style = getStyles();

  return (
    <div className={style.container}>
      {/* Background Gradient */}
      <div className={style.gradient}></div>
      
      {/* Decorative Watermark Icon (Absolute) */}
      <div className={`absolute -right-8 -bottom-8 opacity-[0.07] rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 ${style.watermark}`}>
         <Icon size={140} />
      </div>

      {/* Glow Effect Top Left */}
      <div className={`absolute -top-10 -left-10 w-32 h-32 ${style.watermark.replace('text-', 'bg-')} opacity-20 blur-[50px] rounded-full pointer-events-none`}></div>

      <div className="p-6 relative z-10 flex flex-col h-full justify-between gap-4">
        
        {/* Top Section */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className={style.iconWrapper}>
              <Icon className={`w-6 h-6 ${style.iconColor}`} strokeWidth={2} />
            </div>
            {/* Trend Indicator */}
            {trend !== undefined && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : (trend < 0 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20')}`}>
                    {trend > 0 ? <TrendingUp size={12} /> : (trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />)}
                    <span>{Math.abs(trend).toFixed(1)}%</span>
                </div>
            )}
          </div>

          <div>
            <p className={`${style.labelColor} text-xs font-bold uppercase tracking-wider mb-1`}>{title}</p>
            <div className="flex items-baseline gap-1">
              <h3 className={`text-2xl lg:text-3xl font-black tracking-tight ${style.valueColor} drop-shadow-sm ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                  {isPrivacyMode ? '••••••' : formatter(value)}
              </h3>
            </div>
          </div>
        </div>

        {/* Details Section - Always Visible */}
        {details && (
          <div className={`mt-auto pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
            <div className={`text-sm relative z-20 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
               {details}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};