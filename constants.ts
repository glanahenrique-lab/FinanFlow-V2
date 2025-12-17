
import { Crown, Sparkles, LayoutDashboard, ArrowDownRight, Layers, Repeat, PiggyBank, TrendingUp, Bell, LucideIcon, Zap, MessageSquare } from 'lucide-react';
import { ThemeColor } from './components/ThemeSelectionModal';

export interface AppUpdate {
    version: string;
    date: string;
    title: string;
    description: string;
    features: string[];
    icon: LucideIcon;
}

export const appUpdates: AppUpdate[] = [
    {
        version: "3.4.0",
        date: "Hoje",
        title: "Sua opinião importa! 📣",
        description: "Adicionamos um canal direto para você nos enviar feedbacks e sugestões de melhoria.",
        features: [
            "Novo sistema de feedback: Envie sugestões direto para os desenvolvedores.",
            "Melhorias na estabilidade: Ajustes finos no processamento de dados.",
        ],
        icon: MessageSquare
    },
    {
        version: "3.3.0",
        date: "Recente",
        title: "Tudo Liberado! 🚀",
        description: "O FinanFlow agora é 100% gratuito para todos os usuários.",
        features: [
            "Investimentos Liberados: Gerencie sua carteira sem custos.",
            "IA Ilimitada: Use o consultor financeiro quantas vezes quiser.",
            "Sem restrições: Acesso total a todas as ferramentas."
        ],
        icon: Zap
    },
];

export const themes: Record<ThemeColor, { 
    primary: string; 
    hover: string; 
    text: string; 
    lightText: string;
    bgSoft: string;
    border: string;
    shadow: string;
    gradient: string;
    glowFrom: string;
    glowTo: string;
    selection: string;
    stroke: string;
}> = {
    lime: { primary: 'bg-lime-500', hover: 'hover:bg-lime-400', text: 'text-lime-500', lightText: 'text-lime-400', bgSoft: 'bg-lime-500/10', border: 'border-lime-500/20', shadow: 'shadow-lime-500/20', gradient: 'from-lime-500 to-green-500', glowFrom: 'bg-lime-500/20', glowTo: 'bg-green-600/10', selection: 'selection:bg-lime-500/30 selection:text-lime-200', stroke: '#84cc16' },
    emerald: { primary: 'bg-emerald-600', hover: 'hover:bg-emerald-500', text: 'text-emerald-500', lightText: 'text-emerald-400', bgSoft: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/20', gradient: 'from-emerald-600 to-teal-600', glowFrom: 'bg-emerald-600/20', glowTo: 'bg-teal-600/10', selection: 'selection:bg-emerald-500/30 selection:text-emerald-200', stroke: '#059669' },
    green: { primary: 'bg-green-600', hover: 'hover:bg-green-500', text: 'text-green-500', lightText: 'text-green-400', bgSoft: 'bg-green-500/10', border: 'border-green-500/20', shadow: 'shadow-green-500/20', gradient: 'from-green-600 to-emerald-600', glowFrom: 'bg-green-600/20', glowTo: 'bg-emerald-600/10', selection: 'selection:bg-green-500/30 selection:text-green-200', stroke: '#16a34a' },
    teal: { primary: 'bg-teal-400', hover: 'hover:bg-teal-300', text: 'text-teal-400', lightText: 'text-teal-300', bgSoft: 'bg-teal-500/10', border: 'border-teal-500/20', shadow: 'shadow-teal-500/20', gradient: 'from-teal-400 to-cyan-500', glowFrom: 'bg-teal-500/20', glowTo: 'to-teal-500/5', selection: 'selection:bg-teal-500/30 selection:text-teal-200', stroke: '#2dd4bf' },
    cyan: { primary: 'bg-cyan-500', hover: 'hover:bg-cyan-400', text: 'text-cyan-500', lightText: 'text-cyan-400', bgSoft: 'bg-cyan-500/10', border: 'border-cyan-500/20', shadow: 'shadow-cyan-500/20', gradient: 'from-cyan-500 to-sky-500', glowFrom: 'bg-cyan-500/20', glowTo: 'bg-sky-600/10', selection: 'selection:bg-cyan-500/30 selection:text-cyan-200', stroke: '#06b6d4' },
    yellow: { primary: 'bg-yellow-400', hover: 'hover:bg-yellow-300', text: 'text-yellow-400', lightText: 'text-yellow-300', bgSoft: 'bg-yellow-500/10', border: 'border-yellow-500/20', shadow: 'shadow-yellow-500/20', gradient: 'from-yellow-400 to-orange-500', glowFrom: 'bg-yellow-500/20', glowTo: 'to-teal-500/5', selection: 'selection:bg-yellow-500/30 selection:text-yellow-200', stroke: '#facc15' },
    amber: { primary: 'bg-amber-500', hover: 'hover:bg-amber-400', text: 'text-amber-500', lightText: 'text-amber-400', bgSoft: 'bg-amber-500/10', border: 'border-amber-500/20', shadow: 'shadow-amber-500/20', gradient: 'from-amber-500 to-orange-500', glowFrom: 'bg-amber-500/20', glowTo: 'bg-orange-600/10', selection: 'selection:bg-amber-500/30 selection:text-amber-200', stroke: '#f59e0b' },
    slate: { primary: 'bg-slate-500', hover: 'hover:bg-slate-400', text: 'text-slate-400', lightText: 'text-slate-300', bgSoft: 'bg-slate-500/10', border: 'border-slate-500/20', shadow: 'shadow-slate-500/20', gradient: 'from-slate-500 to-gray-500', glowFrom: 'bg-slate-500/20', glowTo: 'bg-gray-400/10', selection: 'selection:bg-slate-500/30 selection:text-slate-200', stroke: '#64748b' },
};

export const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
  { id: 'transactions', icon: ArrowDownRight, label: 'Fluxo' },
  { id: 'installments', icon: Layers, label: 'Parcelas' },
  { id: 'subscriptions', icon: Repeat, label: 'Fixos' },
  { id: 'goals', icon: PiggyBank, label: 'Metas' },
  { id: 'investments', icon: TrendingUp, label: 'Invest' },
  { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
  { id: 'updates', icon: Bell, label: 'Avisos' },
];
