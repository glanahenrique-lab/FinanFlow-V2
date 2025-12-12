import React from 'react';
import { X, Check, Moon, Sun } from 'lucide-react';

export type ThemeColor = 'indigo' | 'emerald' | 'violet' | 'rose' | 'cyan' | 'amber' | 'sky' | 'lime' | 'slate' | 'orange' | 'pink' | 'fuchsia' | 'teal';

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  currentTheme, 
  onSelectTheme,
  isDarkMode,
  onToggleDarkMode
}) => {
  if (!isOpen) return null;

  const themes: { id: ThemeColor; name: string; colorClass: string }[] = [
    { id: 'indigo', name: 'Indigo Profundo', colorClass: 'bg-indigo-600' },
    { id: 'violet', name: 'Violeta Ultra', colorClass: 'bg-violet-600' },
    { id: 'fuchsia', name: 'Fúcsia Neon', colorClass: 'bg-fuchsia-600' },
    { id: 'pink', name: 'Pink Pop', colorClass: 'bg-pink-500' },
    { id: 'rose', name: 'Rosa Vibrante', colorClass: 'bg-rose-600' },
    { id: 'orange', name: 'Laranja Solar', colorClass: 'bg-orange-500' },
    { id: 'amber', name: 'Âmbar', colorClass: 'bg-amber-500' },
    { id: 'emerald', name: 'Esmeralda', colorClass: 'bg-emerald-600' },
    { id: 'teal', name: 'Turquesa', colorClass: 'bg-teal-500' },
    { id: 'cyan', name: 'Ciano Futuro', colorClass: 'bg-cyan-600' },
    { id: 'sky', name: 'Céu de Verão', colorClass: 'bg-sky-500' },
    { id: 'lime', name: 'Lima Ácida', colorClass: 'bg-lime-500' },
    { id: 'slate', name: 'Monocromático', colorClass: 'bg-slate-500' },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`border rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center p-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Personalizar Visual</h2>
          <button onClick={onClose} className={`transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
            
            {/* Mode Toggle */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                        <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                        </p>
                        <p className="text-xs text-slate-500">Altere a aparência geral do app</p>
                    </div>
                </div>
                
                <button 
                    onClick={onToggleDarkMode}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>

            <div className={`h-px w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

            {/* Colors Grid */}
            <div>
                <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cor de Destaque</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                {themes.map((theme) => (
                    <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`relative p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 group ${
                        currentTheme === theme.id 
                        ? (isDarkMode ? 'bg-slate-800 border-white/20 ring-1 ring-white/20' : 'bg-slate-50 border-slate-300 ring-1 ring-slate-300 shadow-sm') 
                        : (isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-300')
                    }`}
                    >
                    <div className={`w-8 h-8 rounded-full ${theme.colorClass} shadow-md flex items-center justify-center`}>
                        {currentTheme === theme.id && <Check size={14} className="text-white" />}
                    </div>
                    <span className={`text-[10px] font-medium text-center ${
                        currentTheme === theme.id 
                        ? (isDarkMode ? 'text-white' : 'text-slate-900') 
                        : 'text-slate-400'
                    }`}>
                        {theme.name}
                    </span>
                    </button>
                ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};