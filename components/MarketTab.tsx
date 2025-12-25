
import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe2, 
  Newspaper, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Link as LinkIcon, 
  AlertCircle,
  Zap,
  BarChart3,
  Search,
  Cpu,
  Radio
} from 'lucide-react';
import { FoxyMascot } from '../App';

interface MarketData {
  indices: Array<{ name: string; value: string; change: string }>;
  news: Array<{ title: string; summary: string; source: string }>;
  sources: Array<{ title: string; uri: string }>;
  timestamp: string;
}

interface MarketTabProps {
  themeColor: string;
  isDarkMode: boolean;
}

// Sub-componente para o Widget do TradingView
const TradingViewNewsWidget = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Limpa o container antes de adicionar para evitar duplicatas em re-renders
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.type = 'text/javascript';
    script.async = true;
    
    // Configuração do Widget focado em Brasil e Economia
    const config = {
      "feedMode": "all_symbols",
      "colorTheme": isDarkMode ? "dark" : "light",
      "isTransparent": true,
      "displayMode": "regular",
      "width": "100%",
      "height": "600",
      "locale": "br"
    };

    script.innerHTML = JSON.stringify(config);
    
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  }, [isDarkMode]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export const MarketTab: React.FC<MarketTabProps> = ({ themeColor, isDarkMode }) => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/market', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Falha na resposta do servidor.');
      const json = await res.json();
      if (json.error && !json.news) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError("Foxy não conseguiu captar os sinais do mercado agora. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const styles = isDarkMode ? {
    card: 'bg-slate-900 border-slate-800',
    textHead: 'text-white',
    textMuted: 'text-slate-400',
    itemBg: 'bg-slate-950/50 hover:bg-slate-950',
    newsCard: 'bg-slate-900 border-slate-800 hover:border-slate-700'
  } : {
    card: 'bg-white border-slate-200',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
    itemBg: 'bg-slate-50 hover:bg-slate-100',
    newsCard: 'bg-white border-slate-200 hover:border-slate-300'
  };

  if (loading && !data) {
      return (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in duration-500">
              <FoxyMascot face="analytical" themeColor={themeColor} size="lg" />
              <div className="text-center">
                  <h3 className={`text-xl font-black ${styles.textHead} uppercase tracking-tighter flex items-center justify-center gap-2`}>
                      <Cpu className="animate-spin text-emerald-500" size={20} />
                      Processando Radar
                  </h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Vasculhando a rede mundial...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-2xl bg-emerald-500/10`}>
                <Globe2 className="text-emerald-500" size={32} />
            </div>
            <div>
              <h2 className={`text-3xl font-black ${styles.textHead} tracking-tight`}>Radar Global</h2>
              <p className={`${styles.textMuted} text-[10px] font-black uppercase tracking-[0.2em] mt-1`}>Inteligência de Mercado Ativa</p>
            </div>
        </div>
        <button 
          onClick={fetchMarketData}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black transition-all shadow-lg active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : `bg-emerald-600 hover:bg-emerald-500 text-white`} uppercase text-[10px] tracking-widest`}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Sincronizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex items-center gap-4 text-rose-500 text-[10px] font-black uppercase">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {data?.indices.map((idx, i) => {
          const isNegative = idx.change.includes('-');
          const isNeutral = idx.change === '0%' || idx.change === '0.0%';
          return (
            <div key={i} className={`${styles.card} border p-5 rounded-2xl shadow-sm transition-all relative overflow-hidden`}>
              <p className={`${styles.textMuted} text-[9px] font-black uppercase tracking-widest mb-3`}>{idx.name}</p>
              <h3 className={`${styles.textHead} text-lg font-black mb-1`}>{idx.value}</h3>
              <div className={`flex items-center gap-1 text-[10px] font-black ${isNeutral ? 'text-slate-500' : (isNegative ? 'text-rose-500' : 'text-emerald-500')}`}>
                {isNeutral ? <Clock size={12} /> : (isNegative ? <TrendingDown size={12} /> : <TrendingUp size={12} />)}
                {idx.change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className={`${styles.textHead} text-sm font-black flex items-center gap-3 uppercase tracking-widest px-2`}>
              <Search className="text-emerald-500" size={18} /> Resumo IA (Brasil)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.news.map((news, i) => (
                <div key={i} className={`${styles.newsCard} border p-6 rounded-[2rem] shadow-sm transition-all group relative overflow-hidden flex flex-col justify-between`}>
                  <div>
                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-[0.2em] mb-4 inline-block`}>{news.source}</span>
                    <h4 className={`${styles.textHead} text-base font-black mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-tighter`}>{news.title}</h4>
                    <p className={`${styles.textMuted} text-xs font-medium leading-relaxed mb-4`}>{news.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção TradingView - Widget de Notícias em Tempo Real */}
          <section className="space-y-4">
            <h3 className={`${styles.textHead} text-sm font-black flex items-center gap-3 uppercase tracking-widest px-2`}>
              <Radio className="text-emerald-500 animate-pulse" size={18} /> Feed Global em Tempo Real
            </h3>
            <div className={`${styles.card} border p-2 rounded-[2.5rem] shadow-xl overflow-hidden`}>
              <TradingViewNewsWidget isDarkMode={isDarkMode} />
            </div>
          </section>

          {/* Renderização de Fontes de Grounding */}
          {data?.sources && data.sources.length > 0 && (
            <div className="mt-8 px-2 animate-in fade-in duration-700">
               <h4 className={`${styles.textHead} text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2`}>
                  <LinkIcon size={14} className="text-emerald-500" /> Fontes de Verificação
               </h4>
               <div className="flex flex-wrap gap-2">
                  {data.sources.map((src, i) => (
                     <a 
                        key={i} 
                        href={src.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`text-[9px] font-black uppercase tracking-tight px-3 py-1.5 rounded-lg border ${styles.itemBg} ${styles.textMuted} hover:text-emerald-500 hover:border-emerald-500/30 transition-all flex items-center gap-1.5`}
                     >
                        {src.title} <ExternalLink size={10} />
                     </a>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <h3 className={`${styles.textHead} text-sm font-black flex items-center gap-3 uppercase tracking-widest px-2`}>
              <TrendingUp className="text-emerald-500" size={18} /> Fox Insight
           </h3>
           <div className={`${styles.card} border p-8 rounded-[3rem] shadow-xl relative overflow-hidden group`}>
              <div className="flex justify-center mb-8">
                  <div className={`p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 relative z-10`}>
                      <Zap className="text-emerald-500" size={32} />
                  </div>
              </div>
              <p className={`text-[11px] font-bold ${styles.textHead} leading-relaxed italic opacity-80 mb-8 text-center uppercase tracking-tight`}>"A volatilidade é a linguagem do mercado. Ouça com cuidado, diversifique com inteligência."</p>
              <div className={`p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center`}>
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Módulo Analítico</p>
                 <p className={`text-[10px] ${styles.textHead} font-black uppercase tracking-tighter`}>Monitoramento Bio-Digital</p>
              </div>
           </div>
           
           <div className={`${styles.card} border p-6 rounded-[2.5rem] shadow-sm`}>
              <h4 className={`${styles.textHead} text-[10px] font-black uppercase tracking-widest mb-4 opacity-60`}>Status do Radar</h4>
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                    <span className={styles.textMuted}>Sinal Gemini</span>
                    <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativo</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                    <span className={styles.textMuted}>TradingView Live</span>
                    <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Conectado</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
