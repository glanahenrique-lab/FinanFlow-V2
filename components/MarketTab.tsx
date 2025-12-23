
import React, { useState, useEffect } from 'react';
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
  Cpu
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
      
      if (json.error && !json.news) {
          throw new Error(json.error);
      }
      
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
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Vasculhando a rede mundial em busca de dados...</p>
              </div>
              <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-500 rounded-full animate-[progress_2s_ease-in-out_infinite]`} style={{ width: '40%' }}></div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-black ${styles.textHead} flex items-center gap-3 tracking-tighter`}>
            <div className={`p-2 rounded-2xl bg-emerald-500/10`}>
                <Globe2 className="text-emerald-500" size={32} />
            </div>
            Radar Global
          </h2>
          <p className={`${styles.textMuted} text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1`}>
            <Clock size={12} /> Inteligência de Mercado Ativa
          </p>
        </div>
        <button 
          onClick={fetchMarketData}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black transition-all shadow-lg active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : `bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20`} uppercase text-[10px] tracking-widest`}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Sincronizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex items-center gap-4 text-rose-500 text-xs font-black uppercase tracking-tight">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Indices Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {data?.indices.map((idx, i) => {
          const isNegative = idx.change.includes('-');
          const isNeutral = idx.change === '0%' || idx.change === '0.0%';
          return (
            <div key={i} className={`${styles.card} border p-5 rounded-2xl shadow-sm group hover:-translate-y-1 transition-all relative overflow-hidden`}>
              <div className="flex justify-between items-start mb-3 relative z-10">
                 <p className={`${styles.textMuted} text-[9px] font-black uppercase tracking-widest`}>{idx.name}</p>
                 <BarChart3 className={`text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity`} size={12} />
              </div>
              <h3 className={`${styles.textHead} text-lg sm:text-xl font-black mb-1 relative z-10`}>{idx.value}</h3>
              <div className={`flex items-center gap-1 text-[10px] font-black relative z-10 ${isNeutral ? 'text-slate-500' : (isNegative ? 'text-rose-500' : 'text-emerald-500')}`}>
                {isNeutral ? <Clock size={12} /> : (isNegative ? <TrendingDown size={12} /> : <TrendingUp size={12} />)}
                {idx.change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className={`${styles.textHead} text-lg font-black flex items-center gap-3 uppercase tracking-widest`}>
            <Search className="text-emerald-500" size={20} />
            Radar de Notícias
          </h3>
          
          <div className="space-y-4">
            {data?.news.map((news, i) => (
              <div key={i} className={`${styles.newsCard} border p-6 rounded-[2rem] shadow-sm transition-all group relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`}></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-[0.2em]`}>
                    {news.source}
                  </span>
                </div>
                <h4 className={`${styles.textHead} text-base sm:text-lg font-black mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-tighter leading-tight`}>
                  {news.title}
                </h4>
                <p className={`${styles.textMuted} text-xs font-medium leading-relaxed`}>
                  {news.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Sources Grounding */}
          {data?.sources && data.sources.length > 0 && (
            <div className={`mt-8 p-6 rounded-3xl border border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} bg-slate-500/5`}>
                <h4 className={`text-[9px] font-black ${styles.textMuted} uppercase tracking-[0.4em] mb-4 flex items-center gap-2`}>
                    <LinkIcon size={12} className="text-emerald-500" /> Verificabilidade (IA Grounding)
                </h4>
                <div className="flex flex-wrap gap-2">
                    {data.sources.map((source, i) => (
                        <a 
                            key={i} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-[9px] font-black uppercase px-4 py-2 rounded-xl border ${styles.itemBg} ${styles.textHead} hover:border-emerald-500/50 transition-colors flex items-center gap-2 shadow-sm`}
                        >
                            {source.title.length > 40 ? source.title.substring(0, 40) + '...' : source.title}
                            <ExternalLink size={10} className="text-emerald-500" />
                        </a>
                    ))}
                </div>
            </div>
          )}
        </div>

        {/* Insight Card */}
        <div className="space-y-4">
           <h3 className={`${styles.textHead} text-lg font-black flex items-center gap-3 uppercase tracking-widest`}>
              <TrendingUp className="text-emerald-500" size={20} />
              Fox Insight
           </h3>
           <div className={`${styles.card} border p-8 rounded-[3rem] shadow-xl relative overflow-hidden h-fit group`}>
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-transparent`}></div>
              <div className="flex justify-center mb-8 relative">
                  <div className={`absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse`}></div>
                  <div className={`p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 relative z-10 group-hover:rotate-12 transition-transform`}>
                      <Zap className="text-emerald-500" size={32} />
                  </div>
              </div>
              <p className={`text-xs font-bold ${styles.textHead} leading-relaxed italic opacity-80 mb-8 text-center uppercase tracking-tight`}>
                "A volatilidade é a linguagem do mercado. Ouça com cuidado, diversifique com inteligência e deixe a raposa guiar sua estratégia."
              </p>
              
              <div className="space-y-3">
                 <div className={`flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10`}>
                    <div className="flex items-center gap-3">
                       <div className={`p-2 bg-emerald-500/20 rounded-xl text-emerald-500`}><ArrowUpRight size={16} /></div>
                       <span className={`text-[10px] font-black text-emerald-600 uppercase tracking-widest`}>Tendência</span>
                    </div>
                    <span className={`${styles.textHead} text-[10px] font-black uppercase`}>Alta</span>
                 </div>
              </div>

              <div className={`mt-10 p-5 rounded-2xl ${isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50'} border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} text-center`}>
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Módulo Analítico v3.0</p>
                 <p className={`text-[10px] ${styles.textHead} font-black uppercase tracking-tighter`}>Monitoramento Bio-Digital</p>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
          @keyframes progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
          }
      `}</style>
    </div>
  );
};
