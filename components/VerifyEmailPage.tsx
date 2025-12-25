
import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, LogOut, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { sendEmailVerification, signOut, User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface VerifyEmailPageProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ user, onLogout, isDarkMode }) => {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendEmail = async () => {
    if (!canResend) return;
    setIsSending(true);
    setMessage(null);

    try {
      await sendEmailVerification(user);
      setMessage({ type: 'success', text: 'E-mail de verificação reenviado! Verifique sua caixa de entrada e spam.' });
      setCanResend(false);
      setTimer(60); // 60 segundos de cooldown
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setMessage({ type: 'error', text: 'Muitas tentativas. Aguarde um momento antes de tentar novamente.' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao enviar e-mail. Tente novamente mais tarde.' });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async () => {
    await user.reload();
    if (user.emailVerified) {
      window.location.reload(); // Recarrega a página para entrar no app
    } else {
      setMessage({ type: 'error', text: 'E-mail ainda não verificado. Certifique-se de clicar no link enviado.' });
    }
  };

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    cardBg: 'bg-slate-800/50',
    borderColor: 'border-slate-700',
    textHead: 'text-white',
    textBody: 'text-slate-400',
    accentBg: 'bg-lime-500/10',
    accentText: 'text-lime-400',
    buttonPrimary: 'bg-lime-500 hover:bg-lime-400 text-black',
    buttonSecondary: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700',
  } : {
    bg: 'bg-slate-50',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    textHead: 'text-slate-900',
    textBody: 'text-slate-600',
    accentBg: 'bg-lime-100',
    accentText: 'text-lime-600',
    buttonPrimary: 'bg-lime-600 hover:bg-lime-500 text-white',
    buttonSecondary: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${styles.bg}`}>
      <div className={`w-full max-w-md ${styles.cardBg} border ${styles.borderColor} rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300`}>
        
        <div className={`w-20 h-20 rounded-full ${styles.accentBg} flex items-center justify-center mx-auto mb-6`}>
          <Mail className={`w-10 h-10 ${styles.accentText}`} />
        </div>

        <h1 className={`text-2xl font-bold mb-3 ${styles.textHead}`}>Verifique seu E-mail</h1>
        
        <p className={`${styles.textBody} mb-6 leading-relaxed`}>
          Enviamos um link de confirmação para:<br/>
          <span className={`font-semibold ${styles.textHead}`}>{user.email}</span>
        </p>

        <p className={`text-sm ${styles.textBody} mb-8`}>
          Para garantir a segurança da sua conta, você precisa verificar seu e-mail antes de acessar o OnFlow.
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 text-left ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
            {message.type === 'success' ? <CheckCircle2 className="shrink-0" size={18} /> : <AlertCircle className="shrink-0" size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            className={`w-full py-3.5 rounded-xl font-bold shadow-lg shadow-lime-500/10 transition-all flex items-center justify-center gap-2 ${styles.buttonPrimary}`}
          >
            <CheckCircle2 size={20} />
            Já Verifiquei
          </button>

          <button
            onClick={handleResendEmail}
            disabled={!canResend || isSending}
            className={`w-full py-3.5 rounded-xl font-medium border transition-all flex items-center justify-center gap-2 ${styles.buttonSecondary} ${(!canResend || isSending) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSending ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            {timer > 0 ? `Aguarde ${timer}s` : 'Reenviar E-mail'}
          </button>

          <button
            onClick={onLogout}
            className={`w-full py-3 text-sm ${styles.textBody} hover:${styles.textHead} transition-colors flex items-center justify-center gap-2 mt-4`}
          >
            <LogOut size={16} />
            Sair / Trocar Conta
          </button>
        </div>

      </div>
    </div>
  );
};