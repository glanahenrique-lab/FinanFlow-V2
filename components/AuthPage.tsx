import React, { useState } from 'react';
import { Sparkles, User, Mail, Lock, Camera, AlertTriangle, ArrowRight, Loader2, KeyRound, ChevronLeft } from 'lucide-react';
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
  
  // States para fluxos de feedback
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);
  const [resetEmailSentTo, setResetEmailSentTo] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register only states
  const [name, setName] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // Firestore limit is 1MB per doc, so image must be smaller
        setError("A imagem é muito grande. Máximo 1MB para sincronização.");
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
          setError("Por favor, digite seu e-mail para redefinir a senha.");
          return;
      }
      setIsLoading(true);
      setError(null);

      try {
          await sendPasswordResetEmail(auth, email);
          setResetEmailSentTo(email);
          setIsForgotPassword(false);
      } catch (err: any) {
          if (err.code === 'auth/user-not-found') {
              setError("Não encontramos uma conta com este e-mail.");
          } else if (err.code === 'auth/invalid-email') {
              setError("E-mail inválido.");
          } else {
              setError("Erro ao enviar e-mail de redefinição. Tente novamente.");
          }
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
        // LOGIN
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // VERIFICAÇÃO DE E-MAIL
          if (!user.emailVerified) {
             await signOut(auth);
             setError("E-mail não verificado. Verifique sua caixa de entrada antes de entrar.");
             return; 
          }

          // FIRESTORE CHECK: Se o usuário existe no Auth mas não no DB, cria agora
          try {
             const userDocRef = doc(db, "users", user.uid);
             const userDocSnap = await getDoc(userDocRef);
             
             if (!userDocSnap.exists()) {
                 // Criar documento faltante
                 await setDoc(userDocRef, {
                     uid: user.uid,
                     name: user.displayName || 'Usuário',
                     email: user.email,
                     photo: user.photoURL || null, // Tenta pegar do Auth se não tiver no DB
                     createdAt: new Date().toISOString()
                 });
             }
          } catch (fsError) {
             console.error("Erro ao sincronizar Firestore no login:", fsError);
             // Não bloqueia o login, mas loga o erro
          }

          onLoginSuccess();
        } catch (err: any) {
          const code = err.code;
          if (
            code === 'auth/invalid-credential' || 
            code === 'auth/user-not-found' || 
            code === 'auth/wrong-password' || 
            code === 'auth/invalid-login-credentials'
          ) {
             setError("E-mail ou senha incorretos.");
          } else if (code === 'auth/too-many-requests') {
             setError("Muitas tentativas. Tente novamente mais tarde.");
          } else {
             setError("Erro ao fazer login. Verifique suas credenciais.");
          }
        }
      } else {
        // REGISTER
        if (password !== repeatPassword) {
            setError("As senhas não coincidem.");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            setIsLoading(false);
            return;
        }

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // 1. Atualizar o perfil no Firebase Auth
          if (name) {
             await updateProfile(user, {
                 displayName: name
             });
          }
          
          // 2. Salvar no Firestore (CRÍTICO: Fazer isso ANTES do signOut)
          try {
              await setDoc(doc(db, "users", user.uid), {
                  uid: user.uid,
                  name: name,
                  email: email,
                  photo: photo, // Salva a string Base64 ou URL
                  createdAt: new Date().toISOString()
              });
          } catch (fsError) {
              console.error("Erro ao salvar no Firestore:", fsError);
              // Não interrompe o fluxo de registro, mas é um problema
          }

          // 3. Salvar a foto no LocalStorage como backup/cache rápido
          if (photo) {
             localStorage.setItem(`user_photo_${user.uid}`, photo);
          }

          // 4. Enviar e-mail de verificação e deslogar
          await sendEmailVerification(user);
          await signOut(auth);

          setVerificationSentTo(email);
          
        } catch (err: any) {
           if (err.code === 'auth/email-already-in-use') {
              setError("Este e-mail já está cadastrado. Faça login.");
           } else {
              setError(err.message || "Erro ao criar conta.");
           }
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
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up">
        
        {/* Header */}
        <div className="p-8 text-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">FinanFlow</h1>
            <p className="text-slate-500 text-sm mt-1">Gerencie suas finanças com inteligência.</p>
        </div>

        <div className="p-8">
            {verificationSentTo ? (
                // TELA DE VERIFICAÇÃO DE E-MAIL
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Verifique seu e-mail</h2>
                    <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                        Enviamos um e-mail de verificação para <strong className="text-white">{verificationSentTo}</strong>. Verifique-o e faça o login.
                    </p>
                    <button 
                        onClick={handleBackToLogin}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <ArrowRight size={18} />
                        Fazer Login
                    </button>
                </div>
            ) : resetEmailSentTo ? (
                // TELA DE SUCESSO DO RESET DE SENHA
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                        <KeyRound size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Verifique seu e-mail</h2>
                    <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                        Enviamos um link de alteração de senha para <strong className="text-white">{resetEmailSentTo}</strong>.
                    </p>
                    <button 
                        onClick={handleBackToLogin}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <ArrowRight size={18} />
                        Entrar (Sign In)
                    </button>
                </div>
            ) : (
                // FORMULÁRIOS (LOGIN / REGISTRO / ESQUECEU SENHA)
                <>
                    <h2 className="text-xl font-semibold mb-6 text-center text-white">
                        {isForgotPassword ? 'Redefinir Senha' : (isLogin ? 'Bem-vindo de volta' : 'Crie sua conta')}
                    </h2>

                    {error && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm animate-in slide-in-from-top-2 ${error.includes("Login") ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'}`}>
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <div>
                                {error}
                                {error.includes("Login") && (
                                    <button onClick={toggleMode} className="block mt-1 font-bold underline hover:text-indigo-200">
                                        Ir para Login
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={isForgotPassword ? handleResetPassword : handleSubmit} className="space-y-4">
                        
                        {!isLogin && !isForgotPassword && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                {/* Photo Upload */}
                                <div className="flex justify-center mb-2">
                                    <label className="relative w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 cursor-pointer hover:border-indigo-500 hover:bg-slate-800/80 transition-all flex items-center justify-center overflow-hidden group">
                                        {photo ? (
                                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="text-slate-500 group-hover:text-indigo-400" size={24} />
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-white font-medium">Alterar</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Seu Nome" 
                                        required={!isLogin} 
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="email" 
                                placeholder="E-mail" 
                                required 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>

                        {!isForgotPassword && (
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="password" 
                                    placeholder="Senha" 
                                    required 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                        )}

                        {!isLogin && !isForgotPassword && (
                            <div className="relative animate-in slide-in-from-top-2 duration-300">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="password" 
                                    placeholder="Repetir Senha" 
                                    required={!isLogin} 
                                    value={repeatPassword}
                                    onChange={e => setRepeatPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                        )}

                        {/* Forgot Password Link */}
                        {isLogin && !isForgotPassword && (
                            <div className="flex justify-end">
                                <button 
                                    type="button"
                                    onClick={() => { setIsForgotPassword(true); setError(null); }}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {isForgotPassword ? 'Obter Link de Redefinição' : (isLogin ? 'Entrar' : 'Cadastrar')}
                                    {isForgotPassword ? <KeyRound size={18} /> : <ArrowRight size={18} />}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            {isForgotPassword ? (
                                <button 
                                    onClick={handleBackToLogin}
                                    className="text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
                                >
                                    <ChevronLeft size={16} /> Voltar para Login
                                </button>
                            ) : (
                                <>
                                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                                    <button 
                                        onClick={toggleMode}
                                        className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                                    >
                                        {isLogin ? 'Criar agora' : 'Fazer login'}
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};