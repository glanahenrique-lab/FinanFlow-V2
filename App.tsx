import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutGrid, 
  Activity, 
  Receipt, 
  CalendarClock, 
  Target, 
  TrendingUp, 
  Bell, 
  MessageSquareText, 
  Globe2,
  Plus, 
  BrainCircuit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Calculator,
  ArrowRight,
  Pencil,
  Clock,
  LineChart,
  PieChart as PieChartIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  User,
  LogOut,
  Eye,
  EyeOff,
  Rocket,
  Menu,
  AreaChart as AreaChartIcon,
  CreditCard as CreditCardIcon,
  History,
  CheckCircle2,
  Layers,
  Wallet,
  FastForward,
  Calendar,
  Filter,
  Smile,
  Zap,
  Info,
  Search,
  PiggyBank,
  CreditCard,
  Banknote,
  UserCircle,
  HelpCircle,
  Newspaper
} from 'lucide-react';
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { onAuthStateChanged, signOut, updateProfile, deleteUser, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc, collection, onSnapshot, setDoc, writeBatch, arrayUnion, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { AuthPage } from './components/AuthPage';
import { Transaction, InstallmentPurchase, FinancialGoal, Subscription, Investment, GoalTransaction, InvestmentTransaction, UserProfile } from './types';
import { SummaryCard } from './components/SummaryCard';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddInstallmentModal } from './components/AddInstallmentModal';
import { AddGoalModal } from './components/AddGoalModal';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { AddInvestmentModal } from './components/AddInvestmentModal';
import { ConfirmModal } from './components/ConfirmModal';
import { FinancialReportModal } from './components/FinancialReportModal';
import { GoalDetailsModal } from './components/GoalDetailsModal';
import { ThemeColor } from './components/ThemeSelectionModal';
import { ProfileModal } from './components/ProfileModal';
import { DelayInstallmentModal } from './components/DelayInstallmentModal';
import { PayAllModal } from './components/PayAllModal';
import { AnticipateModal } from './components/AnticipateModal';
import { InvestmentDetailsModal } from './components/InvestmentDetailsModal';
import { VerifyEmailPage } from './components/VerifyEmailPage';
import { FeedbackModal } from './components/FeedbackModal';
import { NewsTab } from './components/NewsTab';
import { InvestmentsTab } from './components/InvestmentsTab';
import { getFinancialAdvice } from './services/geminiService';
import { formatCurrency, formatMonth, generateId, getCategoryStyle, getInvestmentStyle, getInvestmentColor, getCategoryIcon } from './utils';
import { themes, appUpdates, NAV_ITEMS, AppUpdate } from './constants';

export type FoxyFace = 'happy' | 'analytical' | 'focused' | 'neutral' | 'surprised';

export const FoxyMascot = ({ face, showBody = false, size = "md", themeColor }: { face: FoxyFace, showBody?: boolean, size?: "sm" | "md" | "lg", themeColor: string }) => {
  const sizeMap = { sm: "w-10 h-10", md: "w-16 h-16", lg: "w-32 h-32" };
  const bodySizeMap = { sm: "w-16 h-20", md: "w-32 h-40", lg: "w-48 h-64" };
  
  return (
    <div className={`relative ${showBody ? bodySizeMap[size] : sizeMap[size]} group`}>
        <div className={`absolute inset-0 bg-emerald-500/10 blur-[40px] rounded-full animate-pulse pointer-events-none`}></div>
        <svg viewBox="0 0 200 250" className="w-full h-full relative z-10 drop-shadow-2xl transition-transform group-hover:scale-105 duration-500 ease-out">
            {showBody && (
                <g className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <path d="M70,130 L130,130 L140,190 Q100,205 60,190 Z" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                    <rect x="90" y="145" width="20" height="15" rx="4" fill="#34d399" opacity="0.3" className="animate-pulse" />
                    <path d="M65,140 Q40,160 50,190" fill="none" stroke="#065f46" strokeWidth="12" strokeLinecap="round" />
                    <path d="M135,140 Q160,160 150,190" fill="none" stroke="#065f46" strokeWidth="12" strokeLinecap="round" />
                    <circle cx="48" cy="175" r="3" fill="#10b981" className="animate-ping" />
                    <circle cx="152" cy="175" r="3" fill="#10b981" className="animate-ping" />
                    <path d="M70,195 Q100,220 130,195" fill="none" stroke="#065f46" strokeWidth="15" strokeLinecap="round" />
                    <circle cx="100" cy="155" r="6" fill="#10b981" className="animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                </g>
            )}
            <g transform={showBody ? "translate(0, 10)" : "translate(0, 30)"}>
                <path d="M50,80 L75,20 L100,80 Z" fill="#065f46" stroke="#10b981" strokeWidth="2" />
                <path d="M150,80 L125,20 L100,80 Z" fill="#065f46" stroke="#10b981" strokeWidth="2" />
                <path d="M65,65 L75,35 L85,65 Z" fill="#10b981" opacity="0.4" />
                <path d="M135,65 L125,35 L115,65 Z" fill="#10b981" opacity="0.4" />
                <path d="M40,80 Q100,55 160,80 L160,135 Q100,175 40,135 Z" fill="#064e3b" stroke="#10b981" strokeWidth="3" />
                {face === 'happy' && (
                    <>
                        <path d="M65,110 Q75,95 85,110" fill="none" stroke="#6ee7b7" strokeWidth="6" strokeLinecap="round" />
                        <path d="M115,110 Q125,95 135,110" fill="none" stroke="#6ee7b7" strokeWidth="6" strokeLinecap="round" />
                        <path d="M90,145 Q100,158 110,145" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                    </>
                )}
                {face === 'analytical' && (
                    <>
                        <rect x="60" y="105" width="30" height="5" fill="#6ee7b7" rx="2" className="animate-pulse" />
                        <rect x="110" y="105" width="30" height="5" fill="#6ee7b7" rx="2" className="animate-pulse" />
                        <path d="M92,145 L108,145" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                    </>
                )}
                {face === 'focused' && (
                    <>
                        <path d="M60,115 L90,105" fill="none" stroke="#6ee7b7" strokeWidth="7" strokeLinecap="round" />
                        <path d="M140,115 L110,105" fill="none" stroke="#6ee7b7" strokeWidth="7" strokeLinecap="round" />
                        <path d="M90,150 Q100,140 110,150" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                    </>
                )}
                {face === 'surprised' && (
                    <>
                        <circle cx="75" cy="110" r="10" fill="none" stroke="#6ee7b7" strokeWidth="4" />
                        <circle cx="125" cy="110" r="10" fill="none" stroke="#6ee7b7" strokeWidth="4" />
                        <circle cx="100" cy="145" r="7" fill="#10b981" />
                    </>
                )}
                {face === 'neutral' && (
                    <>
                        <circle cx="75" cy="110" r="4" fill="#6ee7b7" />
                        <circle cx="125" cy="110" r="4" fill="#6ee7b7" />
                        <path d="M90,145 L110,145" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    </>
                )}
                <circle cx="100" cy="130" r="4" fill="#34d399" />
                <rect x="95" y="55" width="10" height="2" fill="#10b981" className="animate-pulse" />
            </g>
        </svg>
    </div>
  );
};

const CustomChartTooltip = ({ active, payload, label, isDarkMode, isPrivacyMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border p-3 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${data.name === 'Entradas' || data.payload?.name === 'Entradas' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label || data.name}</p>
        </div>
        <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {isPrivacyMode ? '••••••' : formatCurrency(Number(data.value))}
        </p>
      </div>
    );
  }
  return null;
};

const EmptyState = ({ title, message, isDarkMode, themeColor, face = 'neutral' }: { title: string, message: string, isDarkMode: boolean, themeColor: string, face?: FoxyFace }) => (
    <div className={`flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500`}>
        <FoxyMascot face={face} themeColor={themeColor} size="lg" />
        <h3 className={`text-lg sm:text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-tight mt-6`}>{title}</h3>
        <p className="text-slate-500 text-[10px] sm:text-xs mt-2 max-w-[220px] leading-relaxed font-bold uppercase opacity-60">{message}</p>
    </div>
);

type InstallmentWithStatus = InstallmentPurchase & { isVisible: boolean; isDelayed: boolean };

function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userName, setUserName] = useState('Investidor');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userCustomCards, setUserCustomCards] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'installments' | 'subscriptions' | 'goals' | 'investments' | 'news' | 'updates' | 'feedback' >('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => (localStorage.getItem('appTheme') as ThemeColor) || 'lime');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
        const savedMode = localStorage.getItem('isDarkMode');
        return savedMode !== null ? JSON.parse(savedMode) : false;
    } catch { return false; }
  });
  
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    try {
        const savedMode = localStorage.getItem('onflow_privacy_mode');
        return savedMode !== null ? JSON.parse(savedMode) : false;
    } catch { return false; }
  });

  const isInitialLoad = useRef(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installments, setInstallments] = useState<InstallmentPurchase[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [goalTransactions, setGoalTransactions] = useState<GoalTransaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [investments, setInvestment] = useState<Investment[]>([]);
  const [investmentTransactions, setInvestmentTransactions] = useState<InvestmentTransaction[]>([]);

  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isInstModalOpen, setIsInstModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPayAllModalOpen, setIsPayAllModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const [delayModal, setDelayModal] = useState<{ isOpen: boolean; installmentId: string | null; installmentName: string; }>({
    isOpen: false, installmentId: null, installmentName: ''
  });
  const [anticipateModal, setAnticipateModal] = useState<{ isOpen: boolean; installment: InstallmentPurchase | null }>({
    isOpen: false, installment: null
  });
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; type: string | null; id: string | null; title: string; message: string; data?: any; }>({
    isOpen: false, type: null, id: null, title: '', message: '', data: null
  });
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  useEffect(() => {
    let userUnsub: (() => void) | undefined;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
            const userDocRef = doc(db, "users", user.uid);
            userUnsub = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data() as UserProfile & { preferences?: any };
                    setUserName(userData.name || user.displayName || 'Investidor');
                    setUserPhoto(userData.photo || null);
                    setUserCustomCards(userData.customCards || []);
                    if (userData.preferences && isInitialLoad.current) {
                        if (userData.preferences.theme) {
                            setCurrentTheme(userData.preferences.theme);
                            localStorage.setItem('appTheme', userData.preferences.theme);
                        }
                        if (userData.preferences.isDarkMode !== undefined) {
                            setIsDarkMode(userData.preferences.isDarkMode);
                            localStorage.setItem('isDarkMode', JSON.stringify(userData.preferences.isDarkMode));
                        }
                        if (userData.preferences.isPrivacyMode !== undefined) {
                            setIsPrivacyMode(userData.preferences.isPrivacyMode);
                            localStorage.setItem('onflow_privacy_mode', JSON.stringify(userData.preferences.isPrivacyMode));
                        }
                    }
                } else {
                    setDoc(userDocRef, {
                        uid: user.uid,
                        name: user.displayName || 'Investidor',
                        email: user.email,
                        preferences: { theme: currentTheme, isDarkMode, isPrivacyMode },
                        customCards: []
                    }, { merge: true });
                }
                isInitialLoad.current = false;
            });
        } catch (error) {
            console.error("Erro auth listener:", error);
            isInitialLoad.current = false;
        }
      } else {
        if (userUnsub) userUnsub();
        setCurrentUser(null);
        setUserName('Investidor');
        setUserPhoto(null);
        setUserCustomCards([]);
        setTransactions([]);
        setInstallments([]);
        setGoals([]);
        setGoalTransactions([]);
        setSubscriptions([]);
        setInvestment([]);
        setInvestmentTransactions([]);
        isInitialLoad.current = true;
      }
      setIsAuthLoading(false);
    });
    return () => {
        unsubscribe();
        if (userUnsub) userUnsub();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('appTheme', currentTheme);
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('onflow_privacy_mode', JSON.stringify(isPrivacyMode));
    if (currentUser && !isInitialLoad.current) {
        const updatePrefs = async () => {
            try { await updateDoc(doc(db, "users", currentUser.uid), {
                    "preferences.theme": currentTheme,
                    "preferences.isDarkMode": isDarkMode,
                    "preferences.isPrivacyMode": isPrivacyMode
                }); } catch (e) { console.warn("Sync pref failed", e); }
        };
        updatePrefs();
    }
  }, [currentTheme, isDarkMode, isPrivacyMode, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const unsubTrans = onSnapshot(collection(db, "users", uid, "transactions"), (snap) => {
      setTransactions(snap.docs.map(d => d.data() as Transaction));
    });
    const unsubInst = onSnapshot(collection(db, "users", uid, "installments"), (snap) => {
      setInstallments(snap.docs.map(d => d.data() as InstallmentPurchase));
    });
    const unsubGoals = onSnapshot(collection(db, "users", uid, "goals"), (snap) => {
      setGoals(snap.docs.map(d => d.data() as FinancialGoal));
    });
    const unsubGoalTrans = onSnapshot(collection(db, "users", uid, "goal_transactions"), (snap) => {
      setGoalTransactions(snap.docs.map(d => d.data() as GoalTransaction));
    });
    const unsubSubs = onSnapshot(collection(db, "users", uid, "subscriptions"), (snap) => {
      setSubscriptions(snap.docs.map(d => d.data() as Subscription));
    });
    const unsubInvest = onSnapshot(collection(db, "users", uid, "investments"), (snap) => {
      setInvestment(snap.docs.map(d => d.data() as Investment));
    });
    const unsubInvestTrans = onSnapshot(collection(db, "users", uid, "investment_transactions"), (snap) => {
      setInvestmentTransactions(snap.docs.map(d => d.data() as InvestmentTransaction));
    });
    return () => {
      unsubTrans(); unsubInst(); unsubGoals(); unsubGoalTrans(); unsubSubs(); unsubInvest(); unsubInvestTrans();
    };
  }, [currentUser]);

  const saveData = async (collectionName: string, data: any) => {
    if (!currentUser) return;
    try { 
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
      }, {} as any);
      await setDoc(doc(db, "users", currentUser.uid, collectionName, data.id), cleanData); 
    } catch (e) { 
      console.error(`Erro salvar ${collectionName}:`, e); 
    }
  };

  const deleteData = async (collectionName: string, id: string) => {
    if (!currentUser) return;
    try { await deleteDoc(doc(db, "users", currentUser.uid, collectionName, id)); } catch (e) { console.error(`Erro deletar ${collectionName}:`, e); }
  };

  const handleLogoutClick = () => setIsLogoutConfirmOpen(true);
  const confirmLogout = async () => { setIsLogoutConfirmOpen(false); await signOut(auth); };

  const handleProfileUpdate = async (name: string, photo: string | null) => {
      if (!currentUser) return;
      try {
          await updateProfile(currentUser, { displayName: name });
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, { name: name, photo: photo });
          setUserName(name);
          setUserPhoto(photo);
      } catch (error) { console.error("Erro profile update:", error); }
  };

  const handleDeleteAccount = async () => {
      if (!currentUser) return;
      try {
          await deleteDoc(doc(db, "users", currentUser.uid));
          await deleteUser(currentUser);
          setCurrentUser(null);
      } catch (error: any) { alert("Erro ao excluir conta."); }
  };

  const addTransactionRecord = async (description: string, amount: number, category: string, type: 'income' | 'expense', card?: string, paidFor?: string) => {
    const newTrans = {
        id: generateId(), 
        description, 
        amount: Number(amount) || 0, 
        category, 
        type, 
        card: card || null, 
        date: new Date().toISOString(),
        paidFor: paidFor || null,
        reimbursed: paidFor ? false : null
    };
    await saveData('transactions', newTrans);
  };

  const getInstallmentStatusForDate = (inst: InstallmentPurchase, date: Date) => {
    const purchaseDate = new Date(inst.purchaseDate);
    const start = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), 1);
    const target = new Date(date.getFullYear(), date.getMonth(), 1);
    if (target < start) return { isVisible: false, isDelayed: false };
    
    let ptr = new Date(start);
    let paidCount = 0;
    let isScheduled = false;
    let isDelayed = false;
    
    for (let i = 0; i < 360; i++) {
       const ptrKey = `${ptr.getMonth()}-${ptr.getFullYear()}`;
       const targetKey = `${target.getMonth()}-${target.getFullYear()}`;
       const currentMonthIsDelayed = inst.delayedMonths?.includes(ptrKey);
       
       if (ptrKey === targetKey) {
           isScheduled = paidCount < inst.totalInstallments;
           isDelayed = !!currentMonthIsDelayed;
           break;
       }
       if (!currentMonthIsDelayed) paidCount++;
       if (paidCount >= inst.totalInstallments) break;
       ptr.setMonth(ptr.getMonth() + 1);
    }
    return { isVisible: isScheduled, isDelayed };
  };

  const currentMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
  });

  const validInvestmentIds = new Set(investments.map(i => i.id));
  const validGoalIds = new Set(goals.map(g => g.id));
  const validInvestmentTransactions = investmentTransactions.filter(t => validInvestmentIds.has(t.investmentId));
  const validGoalTransactions = goalTransactions.filter(t => validGoalIds.has(t.goalId));

  const totalInvSells = validInvestmentTransactions.filter(it => {
      const itDate = new Date(it.date);
      return it.type === 'sell' && itDate.getMonth() === currentDate.getMonth() && itDate.getFullYear() === currentDate.getFullYear();
  }).reduce<number>((acc, it) => acc + (Number(it.amount) || 0), 0);

  const totalGoalWithdrawalsVal = validGoalTransactions.filter(gt => {
      const gtDate = new Date(gt.date);
      return gt.type === 'withdraw' && gtDate.getMonth() === currentDate.getMonth() && gtDate.getFullYear() === currentDate.getFullYear();
  }).reduce<number>((acc, t) => acc + (Number(t.amount) || 0), 0);
  
  const totalVariableIncome = currentMonthTransactions
      .filter(t => t.type === 'income' && t.category !== 'Metas' && t.category !== 'Investimentos')
      .reduce<number>((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalMonthlyIncome = totalVariableIncome + totalGoalWithdrawalsVal + totalInvSells;

  const totalVariableExpense = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category !== 'Metas' && t.category !== 'Investimentos')
      .reduce<number>((acc, t) => acc + (Number(t.amount) || 0), 0);
  
  const currentMonthSubscriptions = subscriptions.filter(sub => !sub.archivedAt);
  const totalFixedExpense = currentMonthSubscriptions.reduce<number>((acc, s) => acc + (Number(s.amount) || 0), 0);
  
  const currentMonthInstallments: InstallmentWithStatus[] = installments.map(inst => {
      const status = getInstallmentStatusForDate(inst, currentDate);
      return { ...inst, ...status };
  }).filter(inst => inst.isVisible);

  const totalInstallmentsCost = currentMonthInstallments.reduce<number>((acc, inst) => {
    if (inst.isDelayed) return acc;
    const baseAmount = (Number(inst.totalAmount) || 0) / (Number(inst.totalInstallments) || 1);
    const interest = Number(inst.accumulatedInterest || 0);
    return acc + baseAmount + interest;
  }, 0);

  const monthlyInstallmentTransactions: Transaction[] = currentMonthInstallments.map((inst) => {
      const baseAmount = (Number(inst.totalAmount) || 0) / (Number(inst.totalInstallments) || 1);
      const interest = Number(inst.accumulatedInterest || 0);
      const monthlyVal = baseAmount + interest;
      const day = new Date(inst.purchaseDate).getDate();
      const safeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      return {
          id: `inst-${inst.id}`,
          description: inst.description,
          amount: monthlyVal,
          category: 'Parcelas',
          type: 'expense',
          date: safeDate.toISOString(),
          isInstallment: true,
          installmentInfo: `Parc.`,
          card: inst.card,
          paidFor: inst.paidFor,
          reimbursed: inst.reimbursed
      };
  });

  const monthlySubscriptionTransactions: Transaction[] = currentMonthSubscriptions.map((sub) => {
      const day = sub.paymentDay;
      const safeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      return {
          id: `sub-${sub.id}`,
          description: sub.name,
          amount: Number(sub.amount) || 0,
          category: sub.category || 'Serviços',
          type: 'expense',
          date: safeDate.toISOString(),
          isInstallment: false, 
          installmentInfo: 'Fixo',
          card: sub.card
      };
  });

  const allTransactions = [
      ...currentMonthTransactions, 
      ...monthlyInstallmentTransactions,
      ...monthlySubscriptionTransactions
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // LÓGICA DE GASTOS POR CARTÃO (MAPA DE CRÉDITO)
  const cardTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    allTransactions.forEach(t => {
        if (t.type === 'expense') {
            const cardName = t.card || 'Sem Cartão';
            totals[cardName] = (totals[cardName] || 0) + (Number(t.amount) || 0);
        }
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [allTransactions]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    allTransactions.forEach(t => {
      const dateStr = new Date(t.date).toLocaleDateString('pt-BR');
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(t);
    });
    return groups;
  }, [allTransactions]);

  const totalInvBuys = validInvestmentTransactions.filter(it => {
      const itDate = new Date(it.date);
      return it.type === 'buy' && itDate.getMonth() === currentDate.getMonth() && itDate.getFullYear() === currentDate.getFullYear();
  }).reduce<number>((acc, it) => acc + (Number(it.amount) || 0), 0);

  const totalGoalDepositsVal = validGoalTransactions.filter(gt => {
    const gtDate = new Date(gt.date);
    return gt.type === 'deposit' && gtDate.getMonth() === currentDate.getMonth() && gtDate.getFullYear() === currentDate.getFullYear();
  }).reduce<number>((acc, i) => acc + (Number(i.amount) || 0), 0);

  const totalMonthlyExpense = Number(totalVariableExpense) + Number(totalFixedExpense) + Number(totalInstallmentsCost) + Number(totalInvBuys) + Number(totalGoalDepositsVal);
  const balance = Number(totalMonthlyIncome) - Number(totalMonthlyExpense);

  const totalPendingReimbursements = useMemo(() => {
      const transTotal = transactions
          .filter(t => t.type === 'expense' && t.paidFor && !t.reimbursed)
          .reduce((acc, t) => acc + t.amount, 0);
      
      const instTotal = installments
          .filter(i => i.paidFor && !i.reimbursed)
          .reduce((acc, i) => acc + (i.totalAmount - (i.totalAmount / i.totalInstallments * i.paidInstallments)), 0);
          
      return transTotal + instTotal;
  }, [transactions, installments]);

  const categories = [...new Set([
    ...currentMonthTransactions.filter(t => t.type === 'expense').map(t => t.category),
    ...currentMonthSubscriptions.map(s => s.category),
    currentMonthInstallments.length > 0 ? 'Parcelas' : '',
    totalInvBuys > 0 ? 'Investimentos' : '',
    totalGoalDepositsVal > 0 ? 'Metas' : ''
  ])].filter(Boolean);

  const pieChartData = categories.map(cat => {
    let value = 0;
    if (cat === 'Parcelas') value = totalInstallmentsCost;
    else if (cat === 'Investimentos') value = totalInvBuys;
    else if (cat === 'Metas') value = totalGoalDepositsVal;
    else {
      value += currentMonthTransactions.filter(t => t.type === 'expense' && t.category === cat).reduce<number>((acc, t) => acc + (Number(t.amount) || 0), 0);
      value += currentMonthSubscriptions.filter(s => s.category === cat).reduce<number>((acc, s) => acc + (Number(s.amount) || 0), 0);
    }
    return { name: cat, value };
  }).filter(d => d.value > 0).sort((a, b) => Number(b.value) - Number(a.value));

  const filteredInvestments = useMemo(() => {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      return investments.filter(inv => {
          const invDate = new Date(inv.date);
          return invDate.getFullYear() < currentYear || (invDate.getFullYear() === currentYear && invDate.getMonth() <= currentMonth);
      });
  }, [investments, currentDate]);

  const handleDelete = async (id: string, type: string, data?: any) => {
    setConfirmState({ isOpen: true, type, id, title: `Excluir ${type}?`, message: 'Essa ação apagará o registro e sincronizará os saldos.', data });
  };

  const confirmDelete = async () => {
    const { type, id, data } = confirmState;
    if (!id || !currentUser) return;
    const uid = currentUser.uid;

    if (type === 'Movimentação') {
        const trans = transactions.find(t => t.id === id);
        if (trans && (trans.category === 'Investimentos' || trans.category === 'Metas')) {
             const isAporte = trans.type === 'expense';
             const descPart = trans.description.split(': ')[1]; 
             if (trans.category === 'Investimentos') {
                 const inv = investments.find(i => i.name === descPart);
                 if (inv) {
                     const newAmt = isAporte ? inv.totalInvested - trans.amount : inv.totalInvested + trans.amount;
                     await saveData('investments', { ...inv, totalInvested: Math.max(0, newAmt) });
                     const q = query(collection(db, "users", uid, "investment_transactions"), where("investmentId", "==", inv.id), where("amount", "==", trans.amount));
                     const snap = await getDocs(q); snap.forEach(async doc => await deleteDoc(doc.ref));
                 }
             } else if (trans.category === 'Metas') {
                 const goal = goals.find(g => g.title === descPart);
                 if (goal) {
                     const newAmt = isAporte ? goal.currentAmount - trans.amount : goal.currentAmount + trans.amount;
                     await saveData('goals', { ...goal, currentAmount: Math.max(0, newAmt) });
                     const q = query(collection(db, "users", uid, "goal_transactions"), where("goalId", "==", goal.id), where("amount", "==", trans.amount));
                     const snap = await getDocs(q); snap.forEach(async doc => await deleteDoc(doc.ref));
                 }
             }
        }
        await deleteData('transactions', id);
    }
    if (type === 'Parcelamento') await deleteData('installments', id);
    if (type === 'Meta') {
        const related = transactions.filter(t => t.category === 'Metas' && t.description.includes(data?.title));
        related.forEach(async t => await deleteData('transactions', t.id));
        await deleteData('goals', id);
    }
    if (type === 'Investimento') {
        const related = transactions.filter(t => t.category === 'Investimentos' && t.description.includes(data?.name));
        related.forEach(async t => await deleteData('transactions', t.id));
        await deleteData('investments', id);
    }
    if (type === 'Assinatura') await deleteData('subscriptions', id);
    setConfirmState({ isOpen: false, type: null, id: null, title: '', message: '', data: null });
  };

  const handleToggleReimbursement = async (t: Transaction) => {
      if (t.id.startsWith('inst-')) {
          const actualId = t.id.replace('inst-', '');
          const inst = installments.find(i => i.id === actualId);
          if (inst) await saveData('installments', { ...inst, reimbursed: !inst.reimbursed });
      } else if (t.id.startsWith('sub-')) {
          // Subscriptions usually aren't for others, but handle if needed
      } else {
          await saveData('transactions', { ...t, reimbursed: !t.reimbursed });
      }
  };

  const handleUpdateGoalBalance = async (amount: number, type: 'add' | 'remove') => {
    if (!selectedGoalId) return;
    const goal = goals.find(g => g.id === selectedGoalId);
    if (!goal) return;
    const newAmount = type === 'add' ? (Number(goal.currentAmount) || 0) + (Number(amount) || 0) : Math.max(0, (Number(goal.currentAmount) || 0) - (Number(amount) || 0));
    await saveData('goals', { ...goal, currentAmount: newAmount });
    await saveData('goal_transactions', { id: generateId(), goalId: selectedGoalId, amount: Number(amount) || 0, date: new Date().toISOString(), type: type === 'add' ? 'deposit' : 'withdraw' });
    await addTransactionRecord(`${type === 'add' ? 'Aporte Meta' : 'Resgate Meta'}: ${goal.title}`, Number(amount) || 0, 'Metas', type === 'add' ? 'expense' : 'income');
  };

  const handleUpdateInvestmentManualPrice = async (id: string, newPrice: number) => {
      const inv = investments.find(i => i.id === id);
      if (!inv) return;
      await saveData('investments', { ...inv, currentPrice: newPrice });
  };

  const handleGenerateReport = async () => {
    setIsReportModalOpen(true); 
    setIsAnalyzing(true);
    try {
        const report = await getFinancialAdvice(currentMonthTransactions, installments, goals, subscriptions, investments);
        setAiAnalysis(report);
    } catch (error) {
        console.error("Falha ao gerar relatório:", error);
        setAiAnalysis("### ❌ Erro Crítico\n\nNão foi possível processar seus dados agora. Tente novamente mais tarde.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSaveSubscription = async (s: Omit<Subscription, 'id'>) => {
      const now = new Date().toISOString();
      if (editingSubscription) {
          await deleteData('subscriptions', editingSubscription.id);
          await saveData('subscriptions', { ...s, id: generateId(), createdAt: now });
          setEditingSubscription(null);
      } else {
          await saveData('subscriptions', { ...s, id: generateId(), createdAt: now });
      }
      setIsSubModalOpen(false);
  };

  const handleSaveInstallment = async (i: Omit<InstallmentPurchase, 'id'>, saveNewCard?: boolean) => {
      if (!currentUser) return;
      const newI = { ...i, id: generateId() };
      await saveData('installments', newI);
      if (saveNewCard && i.card) {
          await updateDoc(doc(db, "users", currentUser.uid), { customCards: arrayUnion(i.card) });
      }
      setIsInstModalOpen(false);
  };

  const handleDelayInstallment = async (interestAmount: number) => {
      if (!delayModal.installmentId || !currentUser) return;
      const inst = installments.find(i => i.id === delayModal.installmentId);
      if (!inst) return;
      const currentMonthKey = `${currentDate.getMonth()}-${currentDate.getFullYear()}`;
      const updatedInst = {
          ...inst,
          totalAmount: (Number(inst.totalAmount) || 0) + (Number(interestAmount) || 0),
          accumulatedInterest: (Number(inst.accumulatedInterest) || 0) + (Number(interestAmount) || 0),
          delayedMonths: [...(inst.delayedMonths || []), currentMonthKey]
      };
      await saveData('installments', updatedInst);
      setDelayModal({ isOpen: false, installmentId: null, installmentName: '' });
  };

  const handleAnticipateInstallment = async (monthsToAnticipate: number) => {
    if (!anticipateModal.installment || !currentUser) return;
    const inst = anticipateModal.installment;
    const updatedInst = { 
        ...inst, 
        paidInstallments: Math.min(Number(inst.totalInstallments), Number(inst.paidInstallments) + monthsToAnticipate),
        accumulatedInterest: 0,
        lastPaymentDate: new Date().toISOString()
    };
    await saveData('installments', updatedInst);
    const base = (Number(inst.totalAmount) / Number(inst.totalInstallments)) * monthsToAnticipate;
    await addTransactionRecord(`Antecipação Parcela: ${inst.description}`, base, 'Parcelas', 'expense');
    setAnticipateModal({ isOpen: false, installment: null });
  };

  const handlePayInstallment = async (inst: InstallmentPurchase) => {
      if (!currentUser) return;
      const updatedInst = { 
          ...inst, 
          paidInstallments: Math.min(Number(inst.totalInstallments), Number(inst.paidInstallments) + 1),
          accumulatedInterest: 0,
          lastPaymentDate: new Date().toISOString()
      };
      await saveData('installments', updatedInst);
      const base = Number(inst.totalAmount) / Number(inst.totalInstallments);
      const interest = Number(inst.accumulatedInterest || 0);
      await addTransactionRecord(`Pagamento Parcela: ${inst.description}`, base + interest, 'Parcelas', 'expense', inst.card, inst.paidFor);
  };

  const handlePayAllInstallments = async () => {
      if (!currentUser) return;
      const batch = writeBatch(db);
      let totalPaid = 0;
      installments.forEach(inst => {
          if (Number(inst.paidInstallments) < Number(inst.totalInstallments)) {
              const base = Number(inst.totalAmount) / Number(inst.totalInstallments);
              const interest = Number(inst.accumulatedInterest || 0);
              totalPaid += base + interest;
              const docRef = doc(db, "users", currentUser.uid, "installments", inst.id);
              batch.update(docRef, {
                  paidInstallments: Number(inst.paidInstallments) + 1,
                  accumulatedInterest: 0,
                  lastPaymentDate: new Date().toISOString()
              });
          }
      });
      await batch.commit();
      if (totalPaid > 0) await addTransactionRecord('Pagamento Geral de Parcelas', totalPaid, 'Parcelas', 'expense');
      setIsPayAllModalOpen(false);
  };

  const theme = themes[currentTheme];
  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null;
  const selectedInvestment = investments.find(i => i.id === selectedInvestmentId) || null;

  if (isAuthLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className={`w-16 h-16 border-4 border-${currentTheme}-500 border-t-transparent rounded-full animate-spin`}></div></div>;
  if (!currentUser) return <AuthPage onLoginSuccess={() => {}} />;
  if (!currentUser.emailVerified) return <VerifyEmailPage user={currentUser} onLogout={() => signOut(auth)} isDarkMode={isDarkMode} />;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return `Bom dia, ${userName.split(' ')[0]}!`;
    if (h < 18) return `Boa tarde, ${userName.split(' ')[0]}!`;
    return `Boa noite, ${userName.split(' ')[0]}!`;
  };

  const baseTheme = isDarkMode ? {
    bg: 'bg-slate-950', card: 'bg-slate-900/60 backdrop-blur-xl', border: 'border-slate-800/50',
    text: 'text-slate-200', textHead: 'text-white', textMuted: 'text-slate-400',
    nav: 'bg-slate-900/90 backdrop-blur-xl', navBorder: 'border-slate-800',
    menu: 'bg-slate-900'
  } : {
    bg: 'bg-slate-50', card: 'bg-white/60 backdrop-blur-xl', border: 'border-slate-200/60',
    text: 'text-slate-600', textHead: 'text-slate-900', textMuted: 'text-slate-400',
    nav: 'bg-white/90 backdrop-blur-xl', navBorder: 'border-slate-200',
    menu: 'bg-white'
  };

  return (
    <div className={`min-h-screen ${theme.selection} ${baseTheme.text} font-sans pb-32 lg:pb-0 transition-colors duration-300 relative overflow-x-hidden`}>
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className={`absolute inset-0 transition-colors duration-500 ${baseTheme.bg}`} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
          <div className={`absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[130px] opacity-15 transition-all duration-1000 ease-in-out ${theme.primary}`} />
      </div>

      <nav className={`fixed bottom-0 lg:left-0 w-full lg:w-20 lg:h-screen ${baseTheme.nav} border-t lg:border-t-0 lg:border-r ${baseTheme.navBorder} z-40 hidden lg:flex flex-col items-center justify-start lg:pt-8 gap-4 shadow-xl`}>
        <div className={`hidden lg:flex items-center justify-center mb-4 cursor-pointer hover:rotate-12 transition-transform`} onClick={() => setActiveTab('dashboard')}>
          <FoxyMascot face="happy" themeColor={currentTheme} size="sm" />
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`p-3 rounded-xl transition-all duration-300 group relative flex flex-col items-center gap-1 ${isActive ? `${theme.primary} text-white shadow-lg scale-105` : `${baseTheme.textMuted} hover:bg-slate-200/50 dark:hover:bg-slate-800`}`}>
              <item.icon size={22} />
            </button>
          );
        })}
        <button onClick={handleLogoutClick} className="mt-auto mb-8 p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"><LogOut size={22} /></button>
      </nav>

      {/* MOBILE NAV (DASHBOARD CENTRAL) */}
      <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-lg ${baseTheme.nav} border ${baseTheme.navBorder} z-50 lg:hidden flex justify-between items-center h-20 px-4 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-300`}>
          {NAV_ITEMS.slice(0, 2).map((item) => {
              const isActive = activeTab === item.id;
              return (
                  <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center justify-center gap-1 p-2 transition-all ${isActive ? '-translate-y-1 scale-110' : 'opacity-60'}`}>
                      <item.icon size={20} className={isActive ? theme.text : 'text-slate-400'} />
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? theme.text : 'text-slate-400'}`}>{item.label}</span>
                  </button>
              );
          })}
          
          <div className="relative -top-5 group">
              <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${theme.primary} opacity-30 scale-125`}></div>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-22 h-22 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-90 border-4 ${baseTheme.bg} ${activeTab === 'dashboard' ? `bg-gradient-to-br ${theme.gradient} text-white border-${currentTheme}-500/50` : `${baseTheme.card} border-transparent`}`}
              >
                  <LayoutGrid size={38} className={activeTab === 'dashboard' ? 'text-white' : theme.text} />
              </button>
          </div>

          {NAV_ITEMS.slice(3, 4).map((item) => {
              const isActive = activeTab === item.id;
              return (
                  <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center justify-center gap-1 p-2 transition-all ${isActive ? '-translate-y-1 scale-110' : 'opacity-60'}`}>
                      <item.icon size={20} className={isActive ? theme.text : 'text-slate-400'} />
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? theme.text : 'text-slate-400'}`}>{item.label}</span>
                  </button>
              );
          })}

          <div className="relative">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`flex flex-col items-center justify-center gap-1 p-2 transition-all ${isMobileMenuOpen ? '-translate-y-1 scale-110' : 'opacity-60'}`}>
                  <Menu size={20} className={isMobileMenuOpen ? theme.text : 'text-slate-400'} />
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${isMobileMenuOpen ? theme.text : 'text-slate-400'}`}>Mais</span>
              </button>
              {isMobileMenuOpen && (
                  <div className={`absolute bottom-full right-0 mb-8 w-52 ${baseTheme.menu} border ${baseTheme.border} rounded-[2rem] shadow-2xl p-2 animate-in slide-in-from-bottom-5 zoom-in-95`}>
                      {NAV_ITEMS.slice(4).map((item) => (
                          <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800`}>
                              <item.icon size={18} />{item.label}
                          </button>
                      ))}
                      <div className={`h-[1px] w-full my-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                      <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 p-4 rounded-3xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10"><LogOut size={18} /> Sair</button>
                  </div>
              )}
          </div>
      </nav>

      <main className="lg:ml-20 min-h-screen relative z-10">
        <header className={`sticky top-0 z-40 ${isDarkMode ? 'bg-slate-950/80' : 'bg-slate-50/80'} backdrop-blur-xl border-b ${baseTheme.navBorder} px-4 py-3 lg:px-8 flex items-center justify-between transition-colors`}>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-900 px-2 py-1 rounded-xl transition-colors" onClick={() => setIsProfileModalOpen(true)}>
                  <div className={`w-9 h-9 rounded-full overflow-hidden ${baseTheme.border} border relative bg-${currentTheme}-100/20`}>
                     {userPhoto ? <img src={userPhoto} alt="Perfil" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">🦊</div>}
                  </div>
                  <div className="hidden sm:block">
                     <p className={`text-xs font-black ${baseTheme.textHead} flex items-center gap-1 uppercase tracking-tighter`}>{userName.split(' ')[0]} <ChevronRight size={10} /></p>
                  </div>
              </div>
           </div>
           <div className="flex items-center gap-2 sm:gap-3">
               <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className="p-2 rounded-xl transition-all hover:bg-slate-200/50 dark:hover:bg-slate-800">{isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}</button>
               <button onClick={() => { setEditingTransaction(null); setIsTransModalOpen(true); }} className={`${theme.primary} text-white px-4 py-2 rounded-full font-black text-[10px] sm:text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all uppercase tracking-widest`}><Plus size={14} /><span>NOVO</span></button>
           </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1920px] mx-auto space-y-6 lg:space-y-8 animate-fade-in-right pb-12">
            
            {activeTab === 'dashboard' && (
                <>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-4">
                            <FoxyMascot face="happy" themeColor={currentTheme} size="md" />
                            <div>
                                <h2 className={`text-3xl lg:text-4xl font-black ${baseTheme.textHead} tracking-tight leading-none`}>
                                    {getGreeting()}
                                </h2>
                                <div className="flex items-center gap-3 mt-3">
                                   <button onClick={handlePrevMonth} className={`p-1.5 rounded-lg border ${baseTheme.border} ${baseTheme.textMuted} hover:${theme.text} hover:bg-${currentTheme}-500/10 transition-colors`}><ChevronLeft size={14} /></button>
                                   <div className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${baseTheme.textMuted}`}>
                                      <Calendar size={14} className={theme.text} />
                                      {formatMonth(currentDate)}
                                   </div>
                                   <button onClick={handleNextMonth} className={`p-1.5 rounded-lg border ${baseTheme.border} ${baseTheme.textMuted} hover:${theme.text} hover:bg-${currentTheme}-500/10 transition-colors`}><ChevronRight size={14} /></button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={handleGenerateReport} className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-${currentTheme}-500/10 border border-${currentTheme}-500/20 ${theme.text} text-[10px] font-black uppercase tracking-widest hover:bg-${currentTheme}-500/20 transition-all`}>
                                 <BrainCircuit size={16} /> Consultor IA
                             </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 lg:gap-6">
                        <SummaryCard title="Receitas" value={totalMonthlyIncome} icon={ArrowUpRight} variant="income" formatter={formatCurrency} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} themeColor={currentTheme} />
                        <SummaryCard title="Aportes" value={totalInvBuys} icon={TrendingUp} variant="investment" formatter={formatCurrency} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} themeColor={currentTheme} />
                        <SummaryCard title="Previsão Fixos" value={totalFixedExpense + totalInstallmentsCost} icon={Calculator} variant="default" formatter={formatCurrency} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} themeColor={currentTheme} />
                        <SummaryCard title="Despesas" value={totalMonthlyExpense} icon={ArrowDownRight} variant="expense" formatter={formatCurrency} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} themeColor={currentTheme} />
                        <SummaryCard title="A Receber" value={totalPendingReimbursements} icon={HelpCircle} variant="alert" formatter={formatCurrency} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} themeColor={currentTheme} details={<p className="text-[10px] uppercase font-black text-amber-500/80">Pagos para terceiros</p>} />
                        <SummaryCard title="Saldo Final" value={balance} icon={Wallet} variant={balance < 0 ? 'alert' : 'balance'} formatter={formatCurrency} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} themeColor={currentTheme} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className={`text-sm lg:text-base font-black ${baseTheme.textHead} flex items-center gap-2 uppercase tracking-widest`}>
                                <CreditCardIcon className={theme.text} size={18} /> Mapa de Crédito
                            </h3>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Soma por Portador</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {cardTotals.length > 0 ? (
                                cardTotals.map(([cardName, total]) => {
                                    const isHighlight = cardName.toLowerCase().includes('nubank') || cardName.toLowerCase().includes('inter') || cardName.toLowerCase().includes('xp');
                                    return (
                                        <div key={cardName} className={`${baseTheme.card} border ${baseTheme.border} p-5 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.03] transition-all shadow-sm`}>
                                            <div className={`absolute top-0 right-0 w-16 h-16 opacity-[0.05] -mr-4 -mt-4 transition-transform group-hover:scale-125`}>
                                                <CreditCardIcon size={64} className={isHighlight ? theme.text : 'text-slate-400'} />
                                            </div>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${baseTheme.textMuted} mb-1 truncate pr-4`}>{cardName}</p>
                                            <p className={`text-sm sm:text-base font-black ${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                                {formatCurrency(total)}
                                            </p>
                                            <div className={`h-1 w-10 rounded-full mt-3 ${isHighlight ? theme.primary : 'bg-slate-400/30'}`}></div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-8 text-center opacity-30 italic text-[10px] font-bold uppercase tracking-widest">Nenhum gasto em cartão identificado</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className={`lg:col-span-2 ${baseTheme.card} border ${baseTheme.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm flex flex-col h-auto relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-rose-500/10 transition-all duration-700"></div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className={`text-sm lg:text-base font-black ${baseTheme.textHead} flex items-center gap-2 uppercase tracking-widest`}>
                                        <History className={theme.text} size={18} /> Últimos Gastos
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Registros de saída em tempo real</p>
                                </div>
                                <button onClick={() => setActiveTab('transactions')} className={`text-[10px] font-black uppercase tracking-widest ${theme.text} hover:opacity-80 transition-opacity`}>Histórico</button>
                            </div>
                            <div className="space-y-4 relative z-10 flex-1">
                                {allTransactions.filter(t => t.type === 'expense').slice(0, 5).length > 0 ? (
                                    allTransactions.filter(t => t.type === 'expense').slice(0, 5).map((t) => {
                                        const Icon = getCategoryIcon(t.category);
                                        const style = getCategoryStyle(t.category);
                                        return (
                                            <div key={t.id} className={`flex items-center justify-between p-4 rounded-2xl ${isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50'} border ${baseTheme.border} hover:border-${currentTheme}-500/20 transition-all group/item`}>
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${style} shadow-sm group-hover/item:scale-105 transition-transform`}><Icon size={16} /></div>
                                                    <div className="min-w-0">
                                                        <h4 className={`font-black ${baseTheme.textHead} truncate text-[11px] uppercase tracking-tighter`}>{t.description}</h4>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${baseTheme.textMuted}`}>{new Date(t.date).toLocaleDateString('pt-BR')} • {t.category}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className={`text-sm font-black ${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>-{formatCurrency(t.amount)}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-10 opacity-30">
                                        <Layers size={32} className="mb-2" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Nenhum gasto logado</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`${baseTheme.card} border ${baseTheme.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm flex flex-col relative overflow-hidden group`}>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 rounded-full -ml-16 -mb-16 blur-3xl group-hover:bg-violet-500/10 transition-all duration-700"></div>
                            <h3 className={`text-sm lg:text-base font-black ${baseTheme.textHead} mb-8 flex items-center gap-2 uppercase tracking-widest`}>
                                <PieChartIcon className={theme.text} size={18} /> Por Categoria
                            </h3>
                            <div className="relative min-h-[250px] flex items-center justify-center">
                                {pieChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={6} cornerRadius={12} dataKey="value" stroke="none">
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#f43f5e'][index % 7]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomChartTooltip isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyState themeColor={currentTheme} title="Sem dados" message="Nada registrado ainda." isDarkMode={isDarkMode} face="neutral" />
                                )}
                            </div>
                            {pieChartData.length > 0 && (
                                <div className="mt-8 space-y-5 max-h-[220px] overflow-y-auto custom-scrollbar pr-3">
                                    {pieChartData.map((entry, index) => {
                                        const percentage = ((entry.value / totalMonthlyExpense) * 100).toFixed(1);
                                        const color = ['#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#f43f5e'][index % 7];
                                        return (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tighter">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
                                                        <span className={baseTheme.textMuted}>{entry.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>{formatCurrency(entry.value)}</span>
                                                        <span className="ml-2 text-slate-500 opacity-60">({percentage}%)</span>
                                                    </div>
                                                </div>
                                                <div className={`h-1.5 w-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'transactions' && (
                <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <FoxyMascot face="neutral" themeColor={currentTheme} />
                            <div>
                                <h2 className={`text-3xl font-black ${baseTheme.textHead} tracking-tight`}>Fluxo Mensal</h2>
                                <div className="flex items-center gap-3 mt-1">
                                   <button onClick={handlePrevMonth} className={`p-1 rounded-md ${baseTheme.textMuted} hover:${theme.text} transition-colors`}><ChevronLeft size={16} /></button>
                                   <p className={`${baseTheme.textMuted} text-[10px] font-black uppercase tracking-widest`}>{formatMonth(currentDate)}</p>
                                   <button onClick={handleNextMonth} className={`p-1 rounded-md ${baseTheme.textMuted} hover:${theme.text} transition-colors`}><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                        <div className={`${baseTheme.card} border ${baseTheme.border} p-5 rounded-[2rem] flex flex-col justify-between group hover:border-${currentTheme}-500/30 transition-all shadow-sm overflow-hidden relative`}>
                             <div className={`absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12`}></div>
                             <div className="flex items-center justify-between mb-4">
                                 <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
                                     <Wallet size={20} />
                                 </div>
                                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Saldo Mensal</span>
                             </div>
                             <div>
                                 <p className={`text-xl font-black ${balance < 0 ? 'text-rose-500' : 'text-emerald-500'} ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                     {formatCurrency(balance)}
                                 </p>
                                 <div className="flex items-center gap-3 mt-2">
                                     <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={10} /> {isPrivacyMode ? '••' : formatCurrency(totalMonthlyIncome)}</span>
                                     <span className="text-[9px] font-bold text-rose-500 flex items-center gap-0.5"><ArrowDownRight size={10} /> {isPrivacyMode ? '••' : formatCurrency(totalMonthlyExpense)}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="md:col-span-3 overflow-x-auto custom-scrollbar flex gap-4 pb-2 pr-2">
                            {cardTotals.length > 0 ? (
                                cardTotals.map(([cardName, total]) => {
                                    const isHighlight = cardName.toLowerCase().includes('nubank') || cardName.toLowerCase().includes('inter') || cardName.toLowerCase().includes('xp');
                                    const isCash = cardName.toLowerCase().includes('dinheiro');
                                    return (
                                        <div key={cardName} className={`min-w-[180px] flex-1 ${baseTheme.card} border ${baseTheme.border} p-5 rounded-[2rem] flex flex-col justify-between group hover:border-${currentTheme}-500/30 transition-all shadow-sm`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`p-2 rounded-xl ${isHighlight ? `bg-${currentTheme}-500/10 ${theme.text}` : isCash ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                    {isCash ? <Banknote size={16} /> : <CreditCard size={16} />}
                                                </div>
                                                <div className={`h-1.5 w-8 rounded-full ${isHighlight ? theme.primary : isCash ? 'bg-amber-500' : 'bg-slate-400/30'}`}></div>
                                            </div>
                                            <div>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${baseTheme.textMuted} mb-1 truncate`}>{cardName}</p>
                                                <p className={`text-base font-black ${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                                    {formatCurrency(total)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={`${baseTheme.card} border ${baseTheme.border} p-5 rounded-[2rem] flex-1 flex items-center justify-center opacity-30 italic text-[10px] font-bold uppercase tracking-widest`}>
                                    Nenhum portador com gastos este mês
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {Object.keys(groupedTransactions).length === 0 ? (
                            <EmptyState themeColor={currentTheme} title="Log Vazio" message="Inicie o registro das suas operações." isDarkMode={isDarkMode} face="happy" />
                        ) : (
                            Object.entries(groupedTransactions).map(([date, items]) => (
                                <div key={date} className="space-y-3">
                                    <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.text} px-2 flex items-center gap-3`}>{date}<div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div></h3>
                                    <div className="space-y-3">
                                        {(items as Transaction[]).map((t) => {
                                            const Icon = getCategoryIcon(t.category);
                                            const style = getCategoryStyle(t.category);
                                            const isVirtual = t.id.startsWith('inst-') || t.id.startsWith('sub-');
                                            return (
                                                <div key={t.id} className={`${baseTheme.card} border ${baseTheme.border} p-4 sm:p-5 rounded-3xl group hover:border-${currentTheme}-500/40 transition-all flex items-center justify-between gap-4 shadow-sm`}>
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border ${style} shadow-sm group-hover:scale-110 transition-transform`}><Icon size={20} /></div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`font-black ${baseTheme.textHead} truncate text-xs sm:text-sm uppercase tracking-tighter`}>{t.description}</h4>
                                                                {t.paidFor && (
                                                                    <button 
                                                                        onClick={() => handleToggleReimbursement(t)}
                                                                        title={t.reimbursed ? "Marcar como pendente" : "Marcar como recebido"}
                                                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tight transition-all ${t.reimbursed ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-emerald-500/20'}`}
                                                                    >
                                                                        <UserCircle size={10} /> {t.paidFor} {t.reimbursed ? <CheckCircle2 size={10} className="ml-1" /> : <Clock size={10} className="ml-1" />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${baseTheme.textMuted}`}>{t.category} {t.card && `• ${t.card}`}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 sm:gap-6">
                                                        <div className="text-right">
                                                            <p className={`text-base sm:text-xl font-black ${t.type === 'income' ? 'text-emerald-500' : baseTheme.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>{t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}</p>
                                                            {t.installmentInfo && <p className={`text-[8px] sm:text-[10px] font-black ${theme.text} uppercase tracking-widest`}>{t.installmentInfo}</p>}
                                                        </div>
                                                        {!isVirtual && (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => { setEditingTransaction(t); setIsTransModalOpen(true); }} className={`p-2 sm:p-3 rounded-2xl border ${baseTheme.border} text-slate-500 hover:text-${currentTheme}-500 transition-all`}><Pencil size={16} /></button>
                                                                <button onClick={() => handleDelete(t.id, 'Movimentação')} className={`p-2 sm:p-3 rounded-2xl border ${baseTheme.border} text-slate-500 hover:text-rose-500 transition-all`}><Trash2 size={16} /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'installments' && (
                <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <FoxyMascot face="focused" themeColor={currentTheme} />
                            <div>
                                <h2 className={`text-3xl font-black ${baseTheme.textHead} tracking-tight`}>Parcelados</h2>
                                <div className="flex items-center gap-3 mt-1">
                                   <button onClick={handlePrevMonth} className={`p-1 rounded-md ${baseTheme.textMuted} hover:${theme.text} transition-colors`}><ChevronLeft size={16} /></button>
                                   <p className={`${baseTheme.textMuted} text-[10px] font-black uppercase tracking-widest`}>{formatMonth(currentDate)}</p>
                                   <button onClick={handleNextMonth} className={`p-1 rounded-md ${baseTheme.textMuted} hover:${theme.text} transition-colors`}><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => setIsPayAllModalOpen(true)} className={`flex-1 sm:flex-none bg-slate-800 text-white px-4 py-2.5 rounded-2xl font-black text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 border border-slate-700 uppercase tracking-widest`}><CheckCircle2 size={16} /> Liquidar Mês</button>
                            <button onClick={() => setIsInstModalOpen(true)} className={`flex-1 sm:flex-none ${theme.primary} text-white px-4 py-2.5 rounded-2xl font-black text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest`}><Plus size={16} /> Adicionar</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {currentMonthInstallments.length === 0 ? (
                                <EmptyState themeColor={currentTheme} title="Faturas Limpas!" message="O log não detectou parcelas pendentes." isDarkMode={isDarkMode} face="happy" />
                            ) : (
                                currentMonthInstallments.map((inst) => (
                                    <div key={inst.id} className={`${baseTheme.card} border ${baseTheme.border} p-5 rounded-[2rem] shadow-sm flex items-center justify-between gap-4 group hover:border-${currentTheme}-500/40 transition-all`}>
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-${currentTheme}-500/10 text-${currentTheme}-500 border border-${currentTheme}-500/20`}><Layers size={24} /></div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`font-black ${baseTheme.textHead} truncate text-sm uppercase tracking-tighter`}>{inst.description}</h4>
                                                    {inst.paidFor && (
                                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${inst.reimbursed ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                            <UserCircle size={10} /> {inst.paidFor} {inst.reimbursed && <CheckCircle2 size={10} />}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${baseTheme.textMuted}`}>{inst.card} • {inst.paidInstallments}/{inst.totalInstallments} CICLOS</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-lg font-black ${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>{formatCurrency(inst.totalAmount / inst.totalInstallments)}</p>
                                            <p className={`text-[8px] font-black ${theme.text} uppercase`}>PARCELA ATIVA</p>
                                        </div>
                                        <button onClick={() => handleDelete(inst.id, 'Parcelamento')} className="p-2 sm:p-3 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className={`${baseTheme.card} border ${baseTheme.border} p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden bg-gradient-to-br ${theme.gradient} text-white`}>
                                <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3">Total do Mês</h4>
                                <p className={`text-3xl font-black ${isPrivacyMode ? 'blur-md' : ''}`}>{formatCurrency(totalInstallmentsCost)}</p>
                                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80">
                                        <span>Dívida Restante</span>
                                        <span>{formatCurrency(installments.reduce((acc, i) => acc + (i.totalAmount - (i.totalAmount / i.totalInstallments * i.paidInstallments)), 0))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'subscriptions' && (
                <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <FoxyMascot face="analytical" themeColor={currentTheme} />
                            <div>
                                <h2 className={`text-3xl font-black ${baseTheme.textHead} tracking-tight`}>Custos Fixos</h2>
                                <p className={`${baseTheme.textMuted} text-[10px] font-black uppercase tracking-widest mt-1`}>Assinaturas e Recorrências</p>
                            </div>
                        </div>
                        <button onClick={() => setIsSubModalOpen(true)} className={`${theme.primary} text-white px-5 py-2.5 rounded-2xl font-black text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest w-full sm:w-auto justify-center`}><Plus size={16} /> Adicionar Fixo</button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {subscriptions.length === 0 ? (
                                <EmptyState themeColor={currentTheme} title="Nada automático!" message="Crie registros para seus custos que se repetem." isDarkMode={isDarkMode} face="analytical" />
                            ) : (
                                subscriptions.map((sub) => (
                                    <div key={sub.id} className={`${baseTheme.card} border ${baseTheme.border} p-5 rounded-[2rem] shadow-sm flex items-center justify-between gap-4 group hover:border-${currentTheme}-500/40 transition-all`}>
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20`}><CalendarClock size={24} /></div>
                                            <div className="min-w-0">
                                                <h4 className={`font-black ${baseTheme.textHead} truncate text-sm uppercase tracking-tighter`}>{sub.name}</h4>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${baseTheme.textMuted}`}>VENCE DIA {sub.paymentDay} • {sub.card || 'DINHEIRO'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-lg font-black ${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm' : ''}`}>{formatCurrency(sub.amount)}</p>
                                            <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">MENSAL</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => { setEditingSubscription(sub); setIsSubModalOpen(true); }} className={`p-2 rounded-xl border ${baseTheme.border} text-slate-500 hover:text-${currentTheme}-500 transition-all`}><Pencil size={14} /></button>
                                            <button onClick={() => handleDelete(sub.id, 'Assinatura')} className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className={`${baseTheme.card} border ${baseTheme.border} p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden bg-indigo-600 text-white`}>
                                <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3">Total Fixos</h4>
                                <p className={`text-3xl font-black ${isPrivacyMode ? 'blur-md' : ''}`}>{formatCurrency(totalFixedExpense)}</p>
                                <p className="text-[9px] font-black uppercase mt-4 opacity-70 leading-relaxed">Débitos mensais programados.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'news' && <NewsTab themeColor={currentTheme} isDarkMode={isDarkMode} />}

            {activeTab === 'investments' && (
                <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <FoxyMascot face="analytical" themeColor={currentTheme} />
                            <div>
                                <h2 className={`text-3xl font-black ${baseTheme.textHead} tracking-tight`}>Patrimônio</h2>
                                <div className="flex items-center gap-3 mt-1">
                                   <button onClick={handlePrevMonth} className={`p-1 rounded-md ${baseTheme.textMuted} hover:${theme.text} transition-colors`}><ChevronLeft size={16} /></button>
                                   <p className={`${baseTheme.textMuted} text-[10px] font-black uppercase tracking-widest`}>{formatMonth(currentDate)}</p>
                                   <button onClick={handleNextMonth} className={`p-1 rounded-md ${baseTheme.textMuted} hover:${theme.text} transition-colors`}><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsInvestModalOpen(true)} className={`${theme.primary} text-white px-5 py-2.5 rounded-2xl font-black text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest w-full sm:w-auto justify-center`}><Plus size={16} /> Novo Ativo</button>
                    </div>
                    <InvestmentsTab 
                        investments={filteredInvestments} 
                        onAddClick={() => setIsInvestModalOpen(true)}
                        onDelete={(id, data) => handleDelete(id, 'Investimento', data)}
                        onUpdatePrice={handleUpdateInvestmentManualPrice}
                        themeColor={currentTheme}
                        isDarkMode={isDarkMode}
                        isPrivacyMode={isPrivacyMode}
                    />
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                    <div className={`${baseTheme.card} border ${baseTheme.border} p-10 sm:p-12 rounded-[3.5rem] max-w-lg text-center space-y-8 shadow-2xl relative overflow-hidden group`}>
                        <div className={`absolute top-[-50px] right-[-50px] w-64 h-64 bg-${currentTheme}-500/5 rounded-full blur-[80px] group-hover:bg-${currentTheme}-500/10 transition-all duration-700`}></div>
                        <div className="relative">
                            <div className="flex justify-center mb-6">
                                <FoxyMascot face="surprised" themeColor={currentTheme} size="lg" />
                            </div>
                            <h2 className={`text-2xl sm:text-3xl font-black ${baseTheme.textHead} tracking-tighter uppercase`}>Sua voz é o nosso código</h2>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Foxy está de ouvidos atentos.</p>
                        </div>
                        <button onClick={() => setIsFeedbackModalOpen(true)} className={`w-full py-5 ${theme.primary} text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-[10px]`}>
                            ABRIR FEEDBACK
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'updates' && (
                <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <FoxyMascot face="happy" themeColor={currentTheme} size="lg" />
                        </div>
                        <h2 className={`text-4xl lg:text-5xl font-black ${baseTheme.textHead} tracking-tighter uppercase`}>EVOLUÇÃO <span className={theme.text}>ON</span></h2>
                    </div>
                    <div className="space-y-8">
                        {appUpdates.map((update: AppUpdate, index) => (
                            <div key={index} className={`${baseTheme.card} border ${baseTheme.border} p-6 sm:p-8 rounded-[2.5rem] shadow-sm relative group`}>
                                <div className={`absolute top-0 left-0 w-2 h-full ${theme.primary} opacity-20 group-hover:opacity-100 transition-opacity`}></div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full ${theme.primary} text-white text-[9px] font-black uppercase tracking-widest`}>{update.version}</span>
                                    <time className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{update.date}</time>
                                </div>
                                <h3 className={`text-xl font-black ${baseTheme.textHead} mb-4 uppercase tracking-tighter`}>{update.title}</h3>
                                <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">{update.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'goals' && (
                <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <FoxyMascot face="focused" themeColor={currentTheme} />
                            <div>
                                <h2 className={`text-3xl lg:text-4xl font-black ${baseTheme.textHead} tracking-tight`}>Metas</h2>
                                <p className={`${baseTheme.textMuted} text-[10px] font-black uppercase tracking-widest mt-1`}>Objetivos e Reserva</p>
                            </div>
                        </div>
                        <button onClick={() => setIsGoalModalOpen(true)} className={`${theme.primary} text-white px-4 py-2 rounded-xl font-black text-[10px] shadow-xl active:scale-95 transition-all uppercase tracking-widest`}><Plus size={14} /> Nova Meta</button>
                    </div>
                    {goals.length === 0 ? (
                        <EmptyState themeColor={currentTheme} title="Sonhos sem data?" message="Crie metas para economizar com propósito." isDarkMode={isDarkMode} face="focused" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {goals.map(goal => {
                                const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                                return (
                                    <div key={goal.id} onClick={() => setSelectedGoalId(goal.id)} className={`${baseTheme.card} border ${baseTheme.border} rounded-[2.5rem] p-8 shadow-sm group cursor-pointer hover:border-${currentTheme}-500/40 transition-all relative overflow-hidden`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-5 rounded-3xl bg-${currentTheme}-500/10 border border-${currentTheme}-500/20 text-${currentTheme}-500 group-hover:scale-110 transition-transform`}><Target size={32} /></div>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(goal.id, 'Meta', goal); }} className="p-3 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                        <h3 className={`text-2xl font-black ${baseTheme.textHead} mb-6 uppercase tracking-tighter`}>{goal.title}</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                                                <span>Progresso</span>
                                                <span>{Math.round(percent)}%</span>
                                            </div>
                                            <div className={`h-4 w-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} rounded-full border ${baseTheme.border} overflow-hidden p-1`}>
                                                <div className={`h-full ${theme.primary} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                            <div className="flex justify-between items-baseline pt-2">
                                                <span className={`text-3xl font-black ${theme.text} ${isPrivacyMode ? 'blur-sm' : ''}`}>{formatCurrency(goal.currentAmount)}</span>
                                                <span className="text-xs font-bold text-slate-500 italic opacity-60">Alvo: {formatCurrency(goal.targetAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>

      <AddTransactionModal isOpen={isTransModalOpen} onClose={() => { setIsTransModalOpen(false); setEditingTransaction(null); }} onSave={async (t) => { if (editingTransaction) { await saveData('transactions', { ...t, id: editingTransaction.id }); } else { await saveData('transactions', { ...t, id: generateId() }); } setIsTransModalOpen(false); setEditingTransaction(null); }} initialData={editingTransaction} themeColor={currentTheme} isDarkMode={isDarkMode} userCustomCards={userCustomCards} />
      <AddInstallmentModal isOpen={isInstModalOpen} onClose={() => setIsInstModalOpen(false)} onSave={handleSaveInstallment} themeColor={currentTheme} isDarkMode={isDarkMode} userCustomCards={userCustomCards} />
      <AddSubscriptionModal isOpen={isSubModalOpen} onClose={() => { setIsSubModalOpen(false); setEditingSubscription(null); }} onSave={handleSaveSubscription} initialData={editingSubscription} themeColor={currentTheme} isDarkMode={isDarkMode} userCustomCards={userCustomCards} />
      <AddGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSave={async (g) => { const newG = { ...g, id: generateId() }; await saveData('goals', newG); setIsGoalModalOpen(false); }} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <AddInvestmentModal isOpen={isInvestModalOpen} onClose={() => setIsInvestModalOpen(false)} onSave={async (inv) => { const newInv = { ...inv, id: generateId() }; await saveData('investments', newInv); if (inv.totalInvested > 0) { await addTransactionRecord(`Aporte Investimento: ${inv.name}`, inv.totalInvested, 'Investimentos', 'expense'); await saveData('investment_transactions', { id: generateId(), investmentId: newInv.id, amount: inv.totalInvested, date: inv.date, type: 'buy' }); } setIsInvestModalOpen(false); }} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <GoalDetailsModal isOpen={!!selectedGoalId} onClose={() => setSelectedGoalId(null)} goal={selectedGoal} transactions={goalTransactions} onUpdateBalance={handleUpdateGoalBalance} onDeleteTransaction={(id) => deleteData('goal_transactions', id)} themeColor={currentTheme} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />
      <InvestmentDetailsModal isOpen={!!selectedInvestmentId} onClose={() => setSelectedInvestmentId(null)} investment={selectedInvestment} transactions={investmentTransactions} onUpdateBalance={() => {}} onDeleteTransaction={(id) => deleteData('investment_transactions', id)} themeColor={currentTheme} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />
      <FinancialReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} aiAnalysis={aiAnalysis} isAnalyzing={isAnalyzing} chartData={pieChartData} totalIncome={totalMonthlyIncome} totalExpense={totalMonthlyExpense} themeColor={currentTheme} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmDelete} onCancel={() => setConfirmState({ ...confirmState, isOpen: false, data: null })} isDarkMode={isDarkMode} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} currentName={userName} currentPhoto={userPhoto} onSave={handleProfileUpdate} onDeleteAccount={handleDeleteAccount} themeColor={currentTheme} currentTheme={currentTheme} onSelectTheme={setCurrentTheme} onToggleDarkMode={() => setIsDarkMode(prev => !prev)} isDarkMode={isDarkMode} />
      <ConfirmModal isOpen={isLogoutConfirmOpen} title="Encerrar Sistema" message="A Foxy vai entrar em modo de suspensão. Deseja sair agora?" onConfirm={confirmLogout} onCancel={() => setIsLogoutConfirmOpen(false)} isDarkMode={isDarkMode} confirmText="Sair" cancelText="Ficar" />
      <DelayInstallmentModal isOpen={delayModal.isOpen} onClose={() => setDelayModal({ ...delayModal, isOpen: false })} onConfirm={handleDelayInstallment} installmentName={delayModal.installmentName} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <PayAllModal isOpen={isPayAllModalOpen} onClose={() => setIsPayAllModalOpen(false)} onConfirm={handlePayAllInstallments} installments={installments} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <AnticipateModal isOpen={anticipateModal.isOpen} onClose={() => setAnticipateModal({ isOpen: false, installment: null })} onConfirm={handleAnticipateInstallment} installment={anticipateModal.installment} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} userEmail={currentUser?.email || ''} userName={userName} themeColor={currentTheme} isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;