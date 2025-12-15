import React, { useState } from 'react';
import { Sparkles, User, Mail, Lock, Camera, AlertTriangle, ArrowRight, Loader2, KeyRound, ChevronLeft, Gem, Check } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);
  const [resetEmailSentTo, setResetEmailSentTo] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError("A imagem é muito grande. Máximo 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
          setError("Digite seu e-mail para redefinir.");
          return;
      }
      setIsLoading(true);
      setError(null);

      try {
          await sendPasswordResetEmail(auth, email);
          setResetEmailSentTo(email);
          setIsForgotPassword(false);
      } catch (err: any) {
          setError("Erro ao enviar e-mail. Verifique se o endereço está correto.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          if (!user.emailVerified) {
             await signOut(auth);
             setError("E-mail não verificado. Cheque sua caixa de entrada.");
             return; 
          }

          try {
             const userDocRef = doc(db, "users", user.uid);
             const userDocSnap = await getDoc(userDocRef);
             if (!userDocSnap.exists()) {
                 await setDoc(userDocRef, {
                     uid: user.uid,
                     name: user.displayName || 'Usuário',
                     email: user.email,
                     photo: user.photoURL || null,
                     createdAt: new Date().toISOString()
                 });
             }
          } catch (fsError) {
             console.error("Erro sync DB:", fsError);
          }

          onLoginSuccess();
        } catch (err: any) {
          setError("E-mail ou senha incorretos.");
        }
      } else {
        if (password !== repeatPassword) {
            setError("As senhas não coincidem.");
            setIsLoading(false);
            return;
        }
        if (password.length < 6) {
            setError("Senha muito curta (min. 6 caracteres).");
            setIsLoading(false);
            return;
        }

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          if (name) await updateProfile(user, { displayName: name });
          
          await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              name: name,
              email: email,
              photo: photo,
              createdAt: new Date().toISOString()
          });

          if (photo) localStorage.setItem(`user_photo_${user.uid}`, photo);

          await sendEmailVerification(user);
          await signOut(auth);
          setVerificationSentTo(email);
          
        } catch (err: any) {
           if (err.code === 'auth/email-already-in-use') setError("E-mail já cadastrado.");
           else setError("Erro ao criar conta.");
        }
      }
    } catch (err: any) {
        setError("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
      setIsLogin(!isLogin);
      setIsForgotPassword(false);
      setError(null);
      setEmail('');
      setPassword('');
      setRepeatPassword('');
      setName('');
      setPhoto(null);
  };

  const handleBackToLogin = () => {
    setVerificationSentTo(null);
    setResetEmailSentTo(null);
    setIsForgotPassword(false);
    setIsLogin(true);
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* --- Modern Background with Lime Accent --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* --- Main Card --- */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-lime-500/5 hover:border-lime-500/20">
        
        {/* Header Section */}
        <div className="pt-10 pb-6 px-8 text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-600 shadow-lg shadow-lime-500/20 mb-6 group transition-transform hover:scale-110 duration-300">
                <Sparkles className="text-black group-hover:rotate-12 transition-transform duration-500" size={32} strokeWidth={2} />
            </div>
            
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">FinanFlow</h1>
            <p className="text-slate-400 text-sm font-medium">Domine suas finanças com inteligência.</p>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-10">
            {verificationSentTo ? (
                <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-lime-500/20 text-lime-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-lime-500/30">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Verifique seu e-mail</h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Enviamos um link para <span className="text-lime-400 font-mono">{verificationSentTo}</span>.
                    </p>
                    <button onClick={handleBackToLogin} className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-lime-500/20">
                        Voltar para Login
                    </button>
                </div>
            ) : resetEmailSentTo ? (
                <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-lime-500/20 text-lime-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-lime-500/30">
                        <Check size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">E-mail Enviado</h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Instruções enviadas para <span className="text-lime-400 font-mono">{resetEmailSentTo}</span>.
                    </p>
                    <button onClick={handleBackToLogin} className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-lime-500/20">
                        Voltar
                    </button>
                </div>
            ) : (
                <>
                    {/* Toggle Switch */}
                    <div className="flex bg-black/20 p-1 rounded-xl mb-8 border border-white/5">
                        <button 
                            onClick={() => !isLogin && toggleMode()}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${isLogin && !isForgotPassword ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Entrar
                        </button>
                        <button 
                            onClick={() => isLogin && toggleMode()}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${!isLogin && !isForgotPassword ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200 text-sm animate-in slide-in-from-top-2">
                            <AlertTriangle size={18} className="shrink-0 text-red-400 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={isForgotPassword ? handleResetPassword : handleSubmit} className="space-y-5">
                        
                        {/* Name Field (Register Only) */}
                        {!isLogin && !isForgotPassword && (
                            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                                <div className="flex justify-center mb-2">
                                    <label className="relative w-24 h-24 rounded-full bg-slate-900/50 border-2 border-dashed border-slate-700 cursor-pointer hover:border-lime-500 transition-all flex items-center justify-center group overflow-hidden">
                                        {photo ? (
                                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="text-slate-600 group-hover:text-lime-500 transition-colors" size={24} />
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Seu Nome Completo" 
                                        required={!isLogin} 
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors" size={18} />
                            <input 
                                type="email" 
                                placeholder="E-mail" 
                                required 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all"
                            />
                        </div>

                        {/* Password Field */}
                        {!isForgotPassword && (
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    placeholder="Senha" 
                                    required 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all"
                                />
                            </div>
                        )}

                        {/* Repeat Password (Register Only) */}
                        {!isLogin && !isForgotPassword && (
                            <div className="relative group animate-in slide-in-from-left-4 duration-300">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    placeholder="Confirmar Senha" 
                                    required={!isLogin} 
                                    value={repeatPassword}
                                    onChange={e => setRepeatPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all"
                                />
                            </div>
                        )}

                        {/* Forgot Password Link */}
                        {isLogin && !isForgotPassword && (
                            <div className="flex justify-end">
                                <button 
                                    type="button"
                                    onClick={() => { setIsForgotPassword(true); setError(null); }}
                                    className="text-xs text-slate-400 hover:text-lime-400 transition-colors"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        )}

                        {/* Action Button */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-3.5 rounded-xl shadow-lg shadow-lime-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {isForgotPassword ? 'Recuperar Senha' : (isLogin ? 'Acessar Conta' : 'Criar Conta')}
                                    {!isForgotPassword && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer / Back Link */}
                    <div className="mt-8 text-center">
                        {isForgotPassword ? (
                            <button 
                                onClick={handleBackToLogin}
                                className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
                            >
                                <ChevronLeft size={16} /> Voltar ao Login
                            </button>
                        ) : (
                            <p className="text-slate-500 text-sm">
                                FinanFlow AI © 2024
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};