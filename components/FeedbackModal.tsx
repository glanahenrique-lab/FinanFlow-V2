
import React, { useState } from 'react';
import { X, Send, MessageSquare, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  themeColor: string;
  isDarkMode: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  userEmail, 
  userName, 
  themeColor, 
  isDarkMode 
}) => {
  const [type, setType] = useState('sugestao');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          type,
          message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        throw new Error('Erro ao enviar feedback');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    textHead: 'text-white',
    textMuted: 'text-slate-400',
    inputBg: 'bg-slate-950',
    inputBorder: 'border-slate-800',
    inputText: 'text-white',
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-500',
    inputBg: 'bg-slate-50',
    inputBorder: 'border-slate-200',
    inputText: 'text-slate-900',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${styles.border}`}>
          <div className="flex items-center gap-3">
             <div className={`p-2 bg-${themeColor}-500/20 text-${themeColor}-500 rounded-lg`}>
                <MessageSquare size={20} />
             </div>
             <h2 className={`text-xl font-bold ${styles.textHead}`}>Feedback</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-10 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
             <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <CheckCircle2 size={40} />
             </div>
             <h3 className={`text-xl font-bold ${styles.textHead}`}>Obrigado, {userName.split(' ')[0]}!</h3>
             <p className={`${styles.textMuted} text-sm`}>Sua mensagem foi enviada com sucesso. Adoramos saber sua opinião!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <p className={`text-xs ${styles.textMuted} mb-4 leading-relaxed`}>
                Tem alguma ideia para melhorar o app ou encontrou algum problema? Conte para nós!
              </p>
              
              <label className={`block text-xs font-bold uppercase tracking-wider ${styles.textMuted} mb-2`}>Tipo de Feedback</label>
              <div className="grid grid-cols-3 gap-2">
                 {['Sugestão', 'Erro/Bug', 'Elogio'].map((label) => {
                    const val = label.toLowerCase().split('/')[0];
                    return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setType(val)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            type === val 
                            ? `bg-${themeColor}-500 text-black border-${themeColor}-500 shadow-lg shadow-${themeColor}-500/20` 
                            : `${styles.inputBg} ${styles.inputBorder} ${styles.textMuted} hover:border-slate-500`
                          }`}
                        >
                          {label}
                        </button>
                    )
                 })}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${styles.textMuted} mb-2`}>Sua Mensagem</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-xl px-4 py-3 ${styles.inputText} focus:ring-2 focus:ring-${themeColor}-500 outline-none transition-all resize-none text-sm placeholder:text-slate-600`}
                placeholder="Explique detalhadamente sua sugestão ou o problema encontrado..."
              />
            </div>

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                 <AlertCircle size={14} />
                 Não foi possível enviar agora. Tente novamente mais tarde.
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || !message.trim()}
              className={`w-full py-3.5 bg-${themeColor}-600 hover:bg-${themeColor}-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95`}
            >
              {status === 'sending' ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Enviar Feedback
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-2">
                <Sparkles className="text-yellow-500" size={14} />
                <span className={`text-[10px] ${styles.textMuted}`}>Sua colaboração ajuda a tornar o OnFlow melhor.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};