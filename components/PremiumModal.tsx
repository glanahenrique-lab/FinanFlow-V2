import React, { useState } from 'react';
import { X, Check, Crown, Star, Shield, Zap, TrendingUp } from 'lucide-react';
import { ThemeColor } from './ThemeSelectionModal';
import { auth } from '../services/firebase'; // Importar auth para pegar o UID

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void; // Mantemos como fallback ou para atualização otimista
  themeColor: string;
  isDarkMode: boolean;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade,
  themeColor, 
  isDarkMode 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsLoading(true);
    const user = auth.currentUser;

    if (!user) {
        alert("Você precisa estar logado para assinar.");
        setIsLoading(false);
        return;
    }

    try {
        console.log("Iniciando checkout para:", user.email);
        
        // Chamada à API para criar a sessão de pagamento do Stripe
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email
            }),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
             console.error("Resposta inválida do servidor:", await response.text());
             throw new Error("Erro de comunicação com o servidor de pagamento.");
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao processar pedido.");
        }

        if (data.url) {
            console.log("Redirecionando para:", data.url);
            // Redireciona o usuário para o checkout do Stripe
            window.location.href = data.url;
        } else {
            throw new Error("URL de pagamento não recebida.");
        }

    } catch (error: any) {
        console.error("Erro no fluxo de pagamento:", error);
        alert(`Não foi possível iniciar o pagamento: ${error.message}`);
        setIsLoading(false);
    }
  };

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    textHead: 'text-white',
    textMuted: 'text-slate-400',
    cardFree: 'bg-slate-800/50 border-slate-700',
    cardPro: 'bg-gradient-to-b from-slate-800 to-slate-900 border-yellow-500/30',
    closeHover: 'hover:text-white',
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
    cardFree: 'bg-slate-50 border-slate-200',
    cardPro: 'bg-white border-yellow-400',
    closeHover: 'hover:text-slate-700',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[85vh] md:h-auto`}>
        
        {/* Lado Esquerdo (Benefícios Visuais) */}
        <div className="hidden md:flex w-2/5 bg-slate-950 relative overflow-hidden flex-col justify-between p-8">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className={`absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-${themeColor}-500/20 rounded-full blur-[80px]`}></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <Crown size={14} /> Premium
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Desbloqueie o poder total das suas finanças.</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                    O FinanFlow Pro oferece ferramentas avançadas de IA e gestão de investimentos para quem leva o dinheiro a sério.
                </p>
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 text-white/80 text-sm">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10"><Zap size={16} /></div>
                    <span>IA Financeira Ilimitada</span>
                </div>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10"><TrendingUp size={16} /></div>
                    <span>Gestão de Carteira (Invest)</span>
                </div>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10"><Shield size={16} /></div>
                    <span>Backup Prioritário na Nuvem</span>
                </div>
            </div>
        </div>

        {/* Lado Direito (Planos) */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${styles.textHead}`}>Escolha seu plano</h3>
                <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
                    <X size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                
                {/* Plano Free */}
                <div className={`p-5 rounded-2xl border ${styles.cardFree} opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className={`font-bold ${styles.textHead}`}>Básico</h4>
                            <p className="text-xs text-slate-500">Para iniciantes</p>
                        </div>
                        <span className={`text-xl font-bold ${styles.textHead}`}>Grátis</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                        <li className="flex items-center gap-2 text-xs text-slate-500"><Check size={14} /> Controle de Gastos Mensal</li>
                        <li className="flex items-center gap-2 text-xs text-slate-500"><Check size={14} /> Gestão de Assinaturas</li>
                        <li className="flex items-center gap-2 text-xs text-slate-500"><X size={14} className="text-red-400" /> Sem acesso a Investimentos</li>
                        <li className="flex items-center gap-2 text-xs text-slate-500"><X size={14} className="text-red-400" /> Relatórios IA limitados</li>
                    </ul>
                    <button className={`w-full py-2.5 rounded-xl text-sm font-bold border ${isDarkMode ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'} bg-transparent`} disabled>
                        Plano Atual
                    </button>
                </div>

                {/* Plano PRO */}
                <div className={`relative p-6 rounded-2xl border-2 ${styles.cardPro} shadow-xl transform hover:scale-[1.02] transition-all`}>
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl rounded-tr-lg">
                        Recomendado
                    </div>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                FinanFlow PRO <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            </h4>
                            <p className="text-xs text-slate-400">Acesso total</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-white">R$ 19,90</span>
                            <span className="text-xs text-slate-400 block">/mês</span>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/10 mb-4"></div>

                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="bg-yellow-500/20 p-1 rounded text-yellow-400"><Check size={12} /></div> Acesso à aba Investimentos</li>
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="bg-yellow-500/20 p-1 rounded text-yellow-400"><Check size={12} /></div> Consultor Gemini IA Ilimitado</li>
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="bg-yellow-500/20 p-1 rounded text-yellow-400"><Check size={12} /></div> Gráficos Avançados</li>
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="bg-yellow-500/20 p-1 rounded text-yellow-400"><Check size={12} /></div> Suporte Prioritário</li>
                    </ul>

                    <button 
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:to-amber-500 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>Aguarde...</>
                        ) : (
                            <>Assinar Agora <Zap size={16} /></>
                        )}
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-3">
                        Será redirecionado para o pagamento seguro.
                    </p>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};