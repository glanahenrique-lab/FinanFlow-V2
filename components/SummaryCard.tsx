import React, { useState } from 'react';
import { LucideIcon, ChevronDown, ChevronUp } from 'lucide-react';

export type SummaryVariant = 'income' | 'expense' | 'balance' | 'default' | 'alert';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: SummaryVariant;
  formatter: (value: number) => string;
  details?: React.ReactNode;
  isDarkMode: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default', 
  formatter, 
  details,
  isDarkMode
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Styles logic
  const getStyles = () => {
      // Common base for dark/light
      const base = isDarkMode ? {
          bg: 'bg-slate-900',
          borderBase: 'border-slate-800'
      } : {
          bg: 'bg-white',
          borderBase: 'border-slate-200'
      };

      if (variant === 'income') return {
          bg: base.bg,
          border: 'border-emerald-500/30',
          text: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
          iconBg: 'bg-emerald-500/20',
          gradient: 'from-emerald-500/5 to-transparent',
          glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
      };
      if (variant === 'expense') return {
          bg: base.bg,
          border: 'border-rose-500/30',
          text: isDarkMode ? 'text-rose-400' : 'text-rose-600',
          iconBg: 'bg-rose-500/20',
          gradient: 'from-rose-500/5 to-transparent',
          glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]'
      };
      if (variant === 'balance') return {
          bg: base.bg,
          border: 'border-indigo-500/30',
          text: isDarkMode ? 'text-indigo-400' : 'text-indigo-600',
          iconBg: 'bg-indigo-500/20',
          gradient: 'from-indigo-500/5 to-transparent',
          glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]'
      };
      if (variant === 'alert') return {
          bg: base.bg,
          border: 'border-orange-500/30',
          text: isDarkMode ? 'text-orange-400' : 'text-orange-600',
          iconBg: 'bg-orange-500/20',
          gradient: 'from-orange-500/5 to-transparent',
          glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]'
      };
      
      return {
          bg: base.bg,
          border: isDarkMode ? 'border-slate-700' : 'border-slate-300',
          text: isDarkMode ? 'text-slate-200' : 'text-slate-800',
          iconBg: isDarkMode ? 'bg-slate-800' : 'bg-slate-100',
          gradient: 'from-slate-500/5 to-transparent',
          glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(148,163,184,0.1)]'
      };
  };

  const currentStyle = getStyles();

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow} transition-all duration-300 group
      ${details ? 'cursor-pointer' : ''}`}
      onClick={() => details && setIsExpanded(!isExpanded)}
    >
      {/* Background Gradient Mesh */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentStyle.gradient} opacity-50`}></div>
      
      {/* Large Watermark Icon */}
      <div className={`absolute -right-6 -bottom-6 opacity-5 rotate-12 transition-transform duration-500 group-hover:scale-110 ${currentStyle.text}`}>
         <Icon size={100} />
      </div>

      <div className="p-5 relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-2">
          <div className={`p-2.5 rounded-xl ${currentStyle.iconBg} backdrop-blur-sm ${isDarkMode ? 'border border-white/5' : 'border border-black/5'}`}>
            <Icon className={`w-5 h-5 ${currentStyle.text}`} />
          </div>
          {details && (
             <div className="text-slate-400 group-hover:text-slate-500 transition-colors">
                 {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
             </div>
          )}
        </div>

        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
          <h3 className={`text-2xl md:text-3xl font-black tracking-tight ${currentStyle.text} drop-shadow-sm`}>
            {formatter(value)}
          </h3>
        </div>
      </div>

      {/* Detail Panel */}
      <div 
        className={`${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50/50 border-black/5'} border-t backdrop-blur-md transition-all duration-300 ease-out overflow-hidden ${isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className={`p-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
           {details}
        </div>
      </div>
    </div>
  );
};