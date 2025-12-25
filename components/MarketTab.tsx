
import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe2, 
  RefreshCw, 
  Clock, 
  AlertCircle,
  Zap,
  Cpu,
  Radio
} from 'lucide-react';
import { FoxyMascot } from '../App';

interface MarketData {
  indices: Array<{ name: string; value: string; change: string }>;
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
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.type = 'text/javascript';
    script.async = true;
    
    const config = {
      "feedMode": "all_symbols",
      "colorTheme": isDarkMode ? "dark" : "light",
      "isTransparent": true,
      "displayMode": "regular",
      "width": "100%",
      "height": "650",
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
      // Filtramos apenas os índices, ignorando notícias da IA se retornadas
      setData({
        indices: json.indices || [],
        timestamp: json.timestamp || new Date().toISOString()
      });
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
  } : {
    card: 'bg-white border-slate-200',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
  };

  if (loading && !data) {
      return (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in duration-500">
              <FoxyMascot face="analytical" themeColor={themeColor} size="lg" />
              <div className="text-center">
                  <h3 className={`text-xl font-black ${styles.textHead} uppercase tracking-tighter flex items-center justify-center gap-2`}>
                      <Cpu className="animate-spin text-emerald-500" size={20} />
                      Sincronizando Radar
                  </h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Conectando aos terminais financeiros...</p>
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
              <h2 className={`text-3xl font-black ${styles.textHead} tracking-tight`}>Radar OnFlow</h2>
              <p className={`${styles.textMuted} text-[10px] font-black uppercase tracking-[0.2em] mt-1`}>Monitoramento de Ativos e Notícias</p>
            </div>
        </div>
        <button 
          onClick={fetchMarketData}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black transition-all shadow-lg active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : `bg-emerald-600 hover:bg-emerald-500 text-white`} uppercase text-[10px] tracking-widest`}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Atualizando...' : 'Atualizar Índices'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex items-center gap-4 text-rose-500 text-[10px] font-black uppercase">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Grid de Índices (Data em tempo real via API) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {data?.indices.map((idx, i) => {
          const isNegative = idx.change.includes('-');
          const isNeutral = idx.change === '0%' || idx.change === '0.0%' || idx.value === '---';
          return (
            <div key={i} className={`${styles.card} border p-5 rounded-2xl shadow-sm transition-all relative overflow-hidden group hover:border-emerald-500/30`}>
              <p className={`${styles.textMuted} text-[9px] font-black uppercase tracking-widest mb-3`}>{idx.name}</p>
              <h3 className={`${styles.textHead} text-lg font-black mb-1`}>{idx.value}</h3>
              <div className={`flex items-center gap-1 text-[10px] font-black ${isNeutral ? 'text-slate-500' : (isNegative ? 'text-rose-500' : 'text-emerald-500')}`}>
                {isNeutral ? <Clock size={12} /> : (isNegative ? <TrendingDown size={12} /> : <TrendingUp size={12} />)}
                {idx.change}
              </div>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-500 w-0 group-hover:w-full opacity-30`}></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Único feed de notícias: TradingView Timeline */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className={`${styles.textHead} text-sm font-black flex items-center gap-3 uppercase tracking-widest`}>
                <Radio className="text-emerald-500 animate-pulse" size={18} /> Feed de Notícias em Tempo Real
              </h3>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Powered by TradingView</span>
            </div>
            <div className={`${styles.card} border p-2 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[600px]`}>
              <TradingViewNewsWidget isDarkMode={isDarkMode} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
           <h3 className={`${styles.textHead} text-sm font-black flex items-center gap-3 uppercase tracking-widest px-2`}>
              <TrendingUp className="text-emerald-500" size={18} /> Módulo OnFlow
           </h3>
           <div className={`${styles.card} border p-8 rounded-[3rem] shadow-xl relative overflow-hidden group`}>
              <div className="flex justify-center mb-8">
                  <div className={`p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 relative z-10`}>
                      <Zap className="text-emerald-500" size={32} />
                  </div>
              </div>
              <p className={`text-[11px] font-bold ${styles.textHead} leading-relaxed italic opacity-80 mb-8 text-center uppercase tracking-tight`}>
                "A informação é o ativo mais valioso do mercado. Acompanhe a tendência, decida com dados."
              </p>
              <div className={`p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center`}>
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Status da Sessão</p>
                 <p className={`text-[10px] ${styles.textHead} font-black uppercase tracking-tighter`}>Conexão Criptografada</p>
              </div>
           </div>
           
           <div className={`${styles.card} border p-6 rounded-[2.5rem] shadow-sm`}>
              <h4 className={`${styles.textHead} text-[10px] font-black uppercase tracking-widest mb-4 opacity-60`}>Sinal de Dados</h4>
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                    <span className={styles.textMuted}>API de Índices</span>
                    <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Online</span>
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
