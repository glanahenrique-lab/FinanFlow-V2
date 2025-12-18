
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Globe, Newspaper, RefreshCw, ExternalLink, Clock, Flame, ArrowUpRight, ArrowDownRight, Link as LinkIcon, AlertCircle } from 'lucide-react';

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
      
      if (!res.ok) throw new Error('Falha na resposta do servidor');
      
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível carregar os dados agora. Tente novamente em instantes.");
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-black ${styles.textHead} flex items-center gap-3`}>
            <Globe className={`text-${themeColor}-500`} size={32} />
            Radar do Mercado
          </h2>
          <p className={`${styles.textMuted} text-sm flex items-center gap-1.5 mt-1`}>
            <Clock size={14} /> Dados em tempo real via Google Search & Gemini IA
          </p>
        </div>
        <button 
          onClick={fetchMarketData}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : `bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white shadow-${themeColor}-900/20`}`}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Sincronizando...' : 'Atualizar Radar'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-500 text-sm">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Indices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading && !data ? (
           Array(5).fill(0).map((_, i) => (
             <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
           ))
        ) : (
          data?.indices.map((idx, i) => {
            const isNegative = idx.change.includes('-');
            return (
              <div key={i} className={`${styles.card} border p-5 rounded-2xl shadow-sm group hover:-translate-y-1 transition-all`}>
                <p className={`${styles.textMuted} text-[10px] font-black uppercase tracking-widest mb-1`}>{idx.name}</p>
                <h3 className={`${styles.textHead} text-xl font-black mb-2`}>{idx.value}</h3>
                <div className={`flex items-center gap-1 text-sm font-bold ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {isNegative ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  {idx.change}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className={`${styles.textHead} text-xl font-bold flex items-center gap-2`}>
            <Newspaper className={`text-${themeColor}-500`} size={22} />
            Destaques Financeiros
          </h3>
          
          <div className="space-y-4">
            {loading && !data ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
              ))
            ) : (
              data?.news.map((news, i) => (
                <div key={i} className={`${styles.newsCard} border p-6 rounded-3xl shadow-sm transition-all group relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-${themeColor}-500/5 rounded-full -mr-8 -mt-8`}></div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded bg-${themeColor}-500/10 text-${themeColor}-500 uppercase`}>
                      {news.source}
                    </span>
                    <Flame className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                  </div>
                  <h4 className={`${styles.textHead} text-lg font-bold mb-2 group-hover:text-${themeColor}-500 transition-colors`}>
                    {news.title}
                  </h4>
                  <p className={`${styles.textMuted} text-sm leading-relaxed mb-4`}>
                    {news.summary}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Search Grounding Sources (Mandatory) */}
          {data?.sources && data.sources.length > 0 && (
            <div className={`mt-8 p-6 rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                <h4 className={`text-xs font-bold ${styles.textMuted} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                    <LinkIcon size={14} /> Fontes de Pesquisa
                </h4>
                <div className="flex flex-wrap gap-3">
                    {data.sources.map((source, i) => (
                        <a 
                            key={i} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-xs px-3 py-1.5 rounded-lg border ${styles.itemBg} ${styles.textHead} hover:border-${themeColor}-500/50 transition-colors flex items-center gap-2`}
                        >
                            {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                            <ExternalLink size={10} />
                        </a>
                    ))}
                </div>
            </div>
          )}
        </div>

        {/* Market Insights Card */}
        <div className="space-y-4">
           <h3 className={`${styles.textHead} text-xl font-bold flex items-center gap-2`}>
              <TrendingUp className={`text-${themeColor}-500`} size={22} />
              Insights da IA
           </h3>
           <div className={`${styles.card} border p-6 rounded-3xl shadow-xl relative overflow-hidden h-fit`}>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${themeColor}-500 to-transparent`}></div>
              <p className={`text-sm ${styles.textHead} leading-relaxed italic opacity-80 mb-6`}>
                "Analise o mercado com cautela. A volatilidade recente exige foco em ativos resilientes e diversificação estratégica."
              </p>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-500"><ArrowUpRight size={16} /></div>
                       <span className="text-xs font-bold text-emerald-500 uppercase">Tendência</span>
                    </div>
                    <span className={`${styles.textHead} text-[10px] font-black uppercase`}>Commodities</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-500"><ArrowDownRight size={16} /></div>
                       <span className="text-xs font-bold text-rose-500 uppercase">Risco</span>
                    </div>
                    <span className={`${styles.textHead} text-[10px] font-black uppercase`}>Inflação Global</span>
                 </div>
              </div>

              <div className={`mt-8 p-4 rounded-2xl bg-slate-950/20 border border-white/5 text-center`}>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Dica do FinanFlow</p>
                 <p className={`text-xs ${styles.textHead} font-medium`}>Acompanhe as taxas de juros, elas guiam o fluxo global.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
