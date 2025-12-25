
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, AlertTriangle, Loader2, Fingerprint, Zap } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FoxyMascot } from '../App';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(userCredential.user, { displayName: name });
        await setDoc(doc(db, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            name, email, createdAt: new Date().toISOString()
        });
        await sendEmailVerification(userCredential.user);
        onLoginSuccess();
      }
    } catch (err: any) {
        setError("Credenciais inválidas ou erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden relative selection:bg-emerald-500 selection:text-white transition-colors duration-500">
      {/* Background decorativo clean */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="mb-4 flex flex-col items-center animate-in fade-in zoom-in duration-700">
            {/* Foxy com Corpo Inteiro no Login */}
            <FoxyMascot face="happy" showBody={true} themeColor="lime" size="lg" />
            <div className="text-center mt-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                    ON<span className="text-emerald-600">FLOW</span>
                </h1>
                <p className="text-emerald-600/70 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Cibernética Financeira</p>
            </div>
        </div>

        <div className="w-full max-w-sm bg-white border border-slate-200 p-8 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
            <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isLogin ? 'Acesso ao Sistema' : 'Nova Conta Digital'}</h2>
                <p className="text-slate-500 text-xs mt-2 font-medium">Olá! Eu sou a Foxy, sua inteligência de gestão.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 text-xs border border-rose-100 animate-in fade-in slide-in-from-top-2 font-bold">
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Identificação</label>
                        <input 
                            type="text" placeholder="Seu Nome Completo" required value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 p-4 rounded-2xl text-slate-900 outline-none transition-all text-sm placeholder:text-slate-400"
                        />
                    </div>
                )}
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">E-mail de Cadastro</label>
                    <input 
                        type="email" placeholder="seu@email.com" required value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 p-4 rounded-2xl text-slate-900 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Chave de Segurança</label>
                    <input 
                        type="password" placeholder="••••••••" required value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 p-4 rounded-2xl text-slate-900 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                </div>

                <button 
                    type="submit" disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-[0_15px_30px_rgba(16,185,129,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 uppercase tracking-widest text-xs"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Inicializar Fluxo' : 'Gerar Credenciais')}
                </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4">
                <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors">
                    <Fingerprint size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Identificação Biométrica</span>
                </button>
            </div>
        </div>

        <button onClick={() => setIsLogin(!isLogin)} className="mt-8 text-emerald-700 text-sm font-black hover:text-emerald-600 transition-colors uppercase tracking-widest">
            {isLogin ? 'Desejo criar uma conta' : 'Já possuo acesso ao sistema'}
        </button>
      </div>
    </div>
  );
};