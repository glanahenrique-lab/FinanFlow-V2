
import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  Calendar, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  description: string;
  thumbnail?: string;
  author: string;
}

interface NewsTabProps {
  themeColor: string;
  isDarkMode: boolean;
}

export const NewsTab: React.FC<NewsTabProps> = ({ themeColor, isDarkMode }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarNoticias = async () => {
    setLoading(true);
    setError(null);
    try {
      const RSS_URL = "https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGx6TVdZU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=pt-BR&gl=BR&ceid=BR%3Apt-419";
      const API_BASE = "https://api.rss2json.com/v1/api.json?rss_url=";
      
      const response = await fetch(`${API_BASE}${encodeURIComponent(RSS_URL)}`);
      
      if (!response.ok) throw new Error("Erro ao carregar notícias.");
      
      const data = await response.json();
      
      if (data.status === 'ok') {
        // Pegar os 5 primeiros itens
        setNews(data.items.slice(0, 5));
      } else {
        throw new Error(data.message || "Erro na resposta da API.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Foxy não conseguiu sincronizar as notícias. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNoticias();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
  };

  // Helper para tentar extrair uma imagem da descrição se não houver thumbnail
  const getImageUrl = (item: NewsItem) => {
      if (item.thumbnail) return item.thumbnail;
      
      // Tentar extrair do HTML da descrição (Google News costuma colocar imgs em <img> tags)
      const match = item.description.match(/<img[^>]+src="([^">]+)"/);
      return match ? match[1] : null;
  };

  const styles = isDarkMode ? {
    card: 'bg-slate-900 border-slate-800 hover:border-slate-700',
    textHead: 'text-white',
    textMuted: 'text-slate-400',
    imgPlaceholder: 'bg-slate-950',
  } : {
    card: 'bg-white border-slate-200 hover:border-slate-300',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
    imgPlaceholder: 'bg-slate-100',
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-2xl bg-${themeColor}-500/10`}>
                <Newspaper className={`text-${themeColor}-500`} size={32} />
            </div>
            <div>
              <h2 className={`text-3xl font-black ${styles.textHead} tracking-tight`}>Radar Econômico</h2>
              <p className={`${styles.textMuted} text-[10px] font-black uppercase tracking-[0.2em] mt-1`}>Notícias de Investimentos (Brasil)</p>
            </div>
        </div>
        <button 
          onClick={carregarNoticias}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black transition-all shadow-lg active:scale-95 ${loading ? 'opacity-50' : `bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white`} uppercase text-[10px] tracking-widest`}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Atualizando...' : 'Recarregar'}
        </button>
      </div>

      {error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle size={48} className="text-rose-500" />
          <p className="text-rose-500 font-black uppercase text-xs tracking-widest">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
                <div key={i} className={`${styles.card} border rounded-[2rem] p-6 h-[400px] animate-pulse flex flex-col space-y-4`}>
                    <div className={`w-full h-40 ${styles.imgPlaceholder} rounded-2xl`}></div>
                    <div className={`w-3/4 h-6 ${styles.imgPlaceholder} rounded-lg`}></div>
                    <div className={`w-full h-20 ${styles.imgPlaceholder} rounded-lg`}></div>
                </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => {
                const imageUrl = getImageUrl(item);
                return (
                    <article 
                        key={index} 
                        className={`${styles.card} border rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm transition-all hover:scale-[1.02] group`}
                    >
                        {imageUrl ? (
                            <div className="h-48 overflow-hidden relative">
                                <img 
                                    src={imageUrl} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                        ) : (
                            <div className={`h-48 ${styles.imgPlaceholder} flex items-center justify-center flex-col space-y-2`}>
                                <ImageIcon size={32} className="opacity-20" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Sem Imagem</span>
                            </div>
                        )}

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar size={12} className={`text-${themeColor}-500`} />
                                <span className={`${styles.textMuted} text-[10px] font-black uppercase tracking-widest`}>{formatDate(item.pubDate)}</span>
                            </div>
                            
                            <h3 className={`${styles.textHead} text-base font-black leading-tight mb-4 group-hover:text-${themeColor}-500 transition-colors line-clamp-3 uppercase tracking-tighter`}>
                                {item.title}
                            </h3>

                            <div className="mt-auto pt-6 flex flex-col space-y-4">
                                <div className={`h-[1px] w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                                <a 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`w-full py-3 bg-${themeColor}-500/10 hover:bg-${themeColor}-500 text-${themeColor}-600 hover:text-white border border-${themeColor}-500/20 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2`}
                                >
                                    Ler Matéria Completa <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
      )}

      {!loading && !error && news.length > 0 && (
          <div className="mt-12 text-center p-8 border border-dashed rounded-[2.5rem] border-slate-700/30">
              <TrendingUp className={`mx-auto mb-4 text-${themeColor}-500`} size={32} />
              <p className={`${styles.textHead} font-black text-sm uppercase tracking-tighter`}>Mantenha seu radar atualizado</p>
              <p className={`${styles.textMuted} text-xs mt-2 max-w-md mx-auto`}>Informação é o maior ativo de um investidor. Use os dados acima para guiar suas decisões estratégicas no OnFlow.</p>
          </div>
      )}
    </div>
  );
};
