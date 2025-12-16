import { Landmark, TrendingUp, Building2, Banknote, ShieldAlert, Gem } from 'lucide-react';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatMonth = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

export const getCategoryStyle = (category: string) => {
    const cat = category || 'Outros';
    const styles: Record<string, string> = {
        'Salário': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'Investimento': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
        'Renda Extra': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
        'Alimentação': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        'Moradia': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'Saúde': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        'Transporte': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        'Educação': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
        'Lazer': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        'Serviços': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'Compras': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        'Investimentos': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
        'Metas': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        'Outros': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    };
    return styles[cat] || styles['Outros'];
};

export const getInvestmentStyle = (type: string) => {
    switch (type) {
        case 'Renda Fixa (CDB, Tesouro)': return { icon: Landmark, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
        case 'Ações (Bolsa)': return { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
        case 'FIIs (Fundos Imobiliários)': return { icon: Building2, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
        case 'Criptomoedas': return { icon: Banknote, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
        case 'Reserva de Emergência': return { icon: ShieldAlert, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
        default: return { icon: Gem, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
    }
};

export const getInvestmentColor = (type: string) => {
    switch (type) {
        case 'Renda Fixa (CDB, Tesouro)': return '#facc15'; // Yellow-400
        case 'Ações (Bolsa)': return '#60a5fa'; // Blue-400
        case 'FIIs (Fundos Imobiliários)': return '#fb923c'; // Orange-400
        case 'Criptomoedas': return '#c084fc'; // Purple-400
        case 'Reserva de Emergência': return '#34d399'; // Emerald-400
        default: return '#94a3b8'; // Slate-400
    }
};
