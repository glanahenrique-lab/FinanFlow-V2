import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wallet, 
  Plus, 
  TrendingUp, 
  BrainCircuit,
  Calendar,
  Trash2,
  Target,
  ChevronLeft,
  ChevronRight,
  Calculator,
  ArrowRight,
  Pencil,
  Clock,
  LineChart,
  Palette,
  PieChart as PieChartIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  User,
  AlertTriangle,
  CheckCircle2,
  Layers,
  PiggyBank,
  Repeat,
  Landmark,
  FastForward,
  Banknote,
  ShieldAlert,
  Building2,
  Gem,
  Bell,
  LogOut,
  Check,
  Eye,
  EyeOff
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
  CartesianGrid
} from 'recharts';
import { onAuthStateChanged, signOut, updateProfile, deleteUser, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc, collection, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { AuthPage } from './components/AuthPage';
import { Transaction, InstallmentPurchase, FinancialGoal, Subscription, Investment, GoalTransaction, InvestmentTransaction, UserProfile } from './types';
import { SummaryCard, SummaryVariant } from './components/SummaryCard';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddInstallmentModal } from './components/AddInstallmentModal';
import { AddGoalModal } from './components/AddGoalModal';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { AddInvestmentModal } from './components/AddInvestmentModal';
import { ConfirmModal } from './components/ConfirmModal';
import { FinancialReportModal } from './components/FinancialReportModal';
import { GoalDetailsModal } from './components/GoalDetailsModal';
import { ThemeSelectionModal, ThemeColor } from './components/ThemeSelectionModal';
import { ProfileModal } from './components/ProfileModal';
import { DelayInstallmentModal } from './components/DelayInstallmentModal';
import { PayAllModal } from './components/PayAllModal';
import { AnticipateModal } from './components/AnticipateModal';
import { InvestmentDetailsModal } from './components/InvestmentDetailsModal';
import { getFinancialAdvice } from './services/geminiService';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatMonth = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

// --- Theme Configurations ---
const themes: Record<ThemeColor, { 
    primary: string; 
    hover: string; 
    text: string; 
    lightText: string;
    bgSoft: string;
    border: string;
    shadow: string;
    gradient: string;
    glowFrom: string;
    glowTo: string;
}> = {
    indigo: { primary: 'bg-indigo-600', hover: 'hover:bg-indigo-500', text: 'text-indigo-500', lightText: 'text-indigo-400', bgSoft: 'bg-indigo-500/10', border: 'border-indigo-500/20', shadow: 'shadow-indigo-500/20', gradient: 'from-indigo-600 to-purple-600', glowFrom: 'bg-indigo-600/20', glowTo: 'bg-purple-600/10' },
    emerald: { primary: 'bg-emerald-600', hover: 'hover:bg-emerald-500', text: 'text-emerald-500', lightText: 'text-emerald-400', bgSoft: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/20', gradient: 'from-emerald-600 to-teal-600', glowFrom: 'bg-emerald-600/20', glowTo: 'bg-teal-600/10' },
    violet: { primary: 'bg-violet-600', hover: 'hover:bg-violet-500', text: 'text-violet-500', lightText: 'text-violet-400', bgSoft: 'bg-violet-500/10', border: 'border-violet-500/20', shadow: 'shadow-violet-500/20', gradient: 'from-violet-600 to-fuchsia-600', glowFrom: 'bg-violet-600/20', glowTo: 'bg-fuchsia-600/10' },
    rose: { primary: 'bg-rose-600', hover: 'hover:bg-rose-500', text: 'text-rose-500', lightText: 'text-rose-400', bgSoft: 'bg-rose-500/10', border: 'border-rose-500/20', shadow: 'shadow-rose-500/20', gradient: 'from-rose-600 to-pink-600', glowFrom: 'bg-rose-600/20', glowTo: 'bg-pink-600/10' },
    cyan: { primary: 'bg-cyan-600', hover: 'hover:bg-cyan-500', text: 'text-cyan-500', lightText: 'text-cyan-400', bgSoft: 'bg-cyan-500/10', border: 'border-cyan-500/20', shadow: 'shadow-cyan-500/20', gradient: 'from-cyan-600 to-sky-600', glowFrom: 'bg-cyan-600/20', glowTo: 'bg-sky-600/10' },
    amber: { primary: 'bg-amber-500', hover: 'hover:bg-amber-400', text: 'text-amber-500', lightText: 'text-amber-400', bgSoft: 'bg-amber-500/10', border: 'border-amber-500/20', shadow: 'shadow-amber-500/20', gradient: 'from-amber-500 to-yellow-500', glowFrom: 'bg-amber-500/20', glowTo: 'bg-yellow-600/10' },
    sky: { primary: 'bg-sky-500', hover: 'hover:bg-sky-400', text: 'text-sky-400', lightText: 'text-sky-300', bgSoft: 'bg-sky-500/10', border: 'border-sky-500/20', shadow: 'shadow-sky-500/20', gradient: 'from-sky-500 to-blue-500', glowFrom: 'bg-sky-500/20', glowTo: 'bg-blue-600/10' },
    lime: { primary: 'bg-lime-500', hover: 'hover:bg-lime-400', text: 'text-lime-400', lightText: 'text-lime-300', bgSoft: 'bg-lime-500/10', border: 'border-lime-500/20', shadow: 'shadow-lime-500/20', gradient: 'from-lime-500 to-green-500', glowFrom: 'bg-lime-500/20', glowTo: 'bg-green-600/10' },
    slate: { primary: 'bg-slate-500', hover: 'hover:bg-slate-400', text: 'text-slate-400', lightText: 'text-slate-300', bgSoft: 'bg-slate-500/10', border: 'border-slate-500/20', shadow: 'shadow-slate-500/20', gradient: 'from-slate-500 to-gray-500', glowFrom: 'bg-slate-500/20', glowTo: 'bg-gray-400/10' },
    orange: { primary: 'bg-orange-500', hover: 'hover:bg-orange-400', text: 'text-orange-500', lightText: 'text-orange-400', bgSoft: 'bg-orange-500/10', border: 'border-orange-500/20', shadow: 'shadow-orange-500/20', gradient: 'from-orange-500 to-red-500', glowFrom: 'bg-orange-500/20', glowTo: 'bg-red-600/10' },
    pink: { primary: 'bg-pink-500', hover: 'hover:bg-pink-400', text: 'text-pink-500', lightText: 'text-pink-400', bgSoft: 'bg-pink-500/10', border: 'border-pink-500/20', shadow: 'shadow-pink-500/20', gradient: 'from-pink-500 to-rose-500', glowFrom: 'bg-pink-500/20', glowTo: 'bg-rose-600/10' },
    fuchsia: { primary: 'bg-fuchsia-600', hover: 'hover:bg-fuchsia-500', text: 'text-fuchsia-500', lightText: 'text-fuchsia-400', bgSoft: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', shadow: 'shadow-fuchsia-500/20', gradient: 'from-fuchsia-600 to-purple-600', glowFrom: 'bg-fuchsia-600/20', glowTo: 'bg-purple-600/10' },
    teal: { primary: 'bg-teal-500', hover: 'hover:bg-teal-400', text: 'text-teal-400', lightText: 'text-teal-300', bgSoft: 'bg-teal-500/10', border: 'border-teal-500/20', shadow: 'shadow-teal-500/20', gradient: 'from-teal-500 to-emerald-500', glowFrom: 'bg-teal-500/20', glowTo: 'bg-emerald-600/10' },
};

const getInvestmentStyle = (type: string) => {
    switch (type) {
        case 'Renda Fixa (CDB, Tesouro)': return { icon: Landmark, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        case 'Ações (Bolsa)': return { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' };
        case 'FIIs (Fundos Imobiliários)': return { icon: Building2, color: 'text-orange-400', bg: 'bg-orange-500/10' };
        case 'Criptomoedas': return { icon: Banknote, color: 'text-purple-400', bg: 'bg-purple-500/10' };
        case 'Reserva de Emergência': return { icon: ShieldAlert, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
        default: return { icon: Gem, color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
};

function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'installments' | 'subscriptions' | 'goals' | 'investments' >('dashboard');
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => (localStorage.getItem('appTheme') as ThemeColor) || 'indigo');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });
  
  // Privacy Mode State
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    const savedMode = localStorage.getItem('isPrivacyMode');
    return savedMode !== null ? JSON.parse(savedMode) : false;
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // User Profile State
  const [userName, setUserName] = useState('Investidor');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installments, setInstallments] = useState<InstallmentPurchase[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [goalTransactions, setGoalTransactions] = useState<GoalTransaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentTransactions, setInvestmentTransactions] = useState<InvestmentTransaction[]>([]);

  // Modal States
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isInstModalOpen, setIsInstModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPayAllModalOpen, setIsPayAllModalOpen] = useState(false);
  
  // Edit State
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Installment Modals
  const [delayModal, setDelayModal] = useState<{ isOpen: boolean; installmentId: string | null; installmentName: string; }>({
    isOpen: false, installmentId: null, installmentName: ''
  });
  const [anticipateModal, setAnticipateModal] = useState<{ isOpen: boolean; installment: InstallmentPurchase | null }>({
    isOpen: false, installment: null
  });
  
  // Detail Modals
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; type: string | null; id: string | null; title: string; message: string; }>({
    isOpen: false, type: null, id: null, title: '', message: ''
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
            await signOut(auth);
            setCurrentUser(null);
            setIsAuthLoading(false);
            return;
        }

        setCurrentUser(user);
        
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data() as UserProfile;
                setUserName(userData.name || user.displayName || 'Investidor');
                setUserPhoto(userData.photo || null);
            } else {
                setUserName(user.displayName || 'Investidor');
                const savedPhoto = localStorage.getItem(`user_photo_${user.uid}`);
                setUserPhoto(savedPhoto);
            }
        } catch (error) {
            console.error("Erro ao buscar perfil:", error);
            setUserName(user.displayName || 'Investidor');
        }
        
      } else {
        setCurrentUser(null);
        setUserName('Investidor');
        setUserPhoto(null);
        // Clear data
        setTransactions([]);
        setInstallments([]);
        setGoals([]);
        setGoalTransactions([]);
        setSubscriptions([]);
        setInvestments([]);
        setInvestmentTransactions([]);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // FIRESTORE SYNC EFFECT
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
      setInvestments(snap.docs.map(d => d.data() as Investment));
    });
    const unsubInvestTrans = onSnapshot(collection(db, "users", uid, "investment_transactions"), (snap) => {
      setInvestmentTransactions(snap.docs.map(d => d.data() as InvestmentTransaction));
    });

    return () => {
      unsubTrans();
      unsubInst();
      unsubGoals();
      unsubGoalTrans();
      unsubSubs();
      unsubInvest();
      unsubInvestTrans();
    };
  }, [currentUser]);

  // Firestore Helpers
  const saveData = async (collectionName: string, data: any) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, "users", currentUser.uid, collectionName, data.id), data);
    } catch (e) {
      console.error(`Erro ao salvar em ${collectionName}:`, e);
    }
  };

  const deleteData = async (collectionName: string, id: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, collectionName, id));
    } catch (e) {
      console.error(`Erro ao deletar de ${collectionName}:`, e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleProfileUpdate = async (name: string, photo: string | null) => {
      if (!currentUser) return;
      try {
          await updateProfile(currentUser, { displayName: name });
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, { name: name, photo: photo });
          setUserName(name);
          setUserPhoto(photo);
          if (photo) localStorage.setItem(`user_photo_${currentUser.uid}`, photo);
          else localStorage.removeItem(`user_photo_${currentUser.uid}`);
      } catch (error) {
          console.error("Erro ao atualizar perfil:", error);
          alert("Erro ao salvar alterações. Tente novamente.");
      }
  };

  const handleDeleteAccount = async () => {
      if (!currentUser) return;
      try {
          await deleteDoc(doc(db, "users", currentUser.uid));
          await deleteUser(currentUser);
          localStorage.removeItem(`user_photo_${currentUser.uid}`);
          setCurrentUser(null);
      } catch (error: any) {
          console.error("Erro ao excluir conta:", error);
          if (error.code === 'auth/requires-recent-login') {
              alert("Por segurança, faça logout e login novamente antes de excluir sua conta.");
          } else {
              alert("Erro ao excluir conta. Tente novamente.");
          }
      }
  };

  // Local Preferences Persistence
  useEffect(() => { localStorage.setItem('appTheme', currentTheme); }, [currentTheme]);
  useEffect(() => { localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode)); }, [isDarkMode]);
  useEffect(() => { localStorage.setItem('isPrivacyMode', JSON.stringify(isPrivacyMode)); }, [isPrivacyMode]);

  // Helper to check privacy mode for display strings
  const getDisplayValue = (val: number, formatter = formatCurrency) => {
      return isPrivacyMode ? '••••••' : formatter(val);
  };

  // Dynamic Theme Base Styles
  const baseTheme = isDarkMode ? {
    bg: 'bg-slate-950',
    card: 'bg-slate-900',
    cardHover: 'hover:bg-slate-900/80',
    border: 'border-slate-800',
    text: 'text-slate-200',
    textHead: 'text-white',
    textMuted: 'text-slate-500',
    nav: 'bg-slate-900',
    navBorder: 'border-slate-800',
    inputBg: 'bg-slate-950',
    tableHeader: 'bg-slate-950',
    tableRowHover: 'hover:bg-slate-800/30'
  } : {
    bg: 'bg-slate-50',
    card: 'bg-white',
    cardHover: 'hover:bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    textHead: 'text-slate-900',
    textMuted: 'text-slate-400',
    nav: 'bg-white',
    navBorder: 'border-slate-200',
    inputBg: 'bg-white',
    tableHeader: 'bg-slate-50',
    tableRowHover: 'hover:bg-slate-50'
  };

  // Helper to log transaction automatically
  const addTransactionRecord = async (description: string, amount: number, category: string, type: 'income' | 'expense') => {
    const newTrans = {
        id: generateId(),
        description,
        amount,
        category,
        type,
        date: new Date().toISOString().split('T')[0]
    };
    await saveData('transactions', newTrans);
  };

  /**
   * Helper: Determines if an installment is scheduled for the given month.
   */
  const getInstallmentStatusForDate = (inst: InstallmentPurchase, date: Date) => {
    const purchaseDate = new Date(inst.purchaseDate);
    const start = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), 1);
    const target = new Date(date.getFullYear(), date.getMonth(), 1);

    if (target < start) return { isVisible: false, isDelayed: false };
    
    let ptr = new Date(start);
    let paidCount = 0;
    let isScheduled = false;
    let isDelayed = false;

    for (let i = 0; i < 240; i++) {
       const ptrKey = `${ptr.getMonth()}-${ptr.getFullYear()}`;
       const targetKey = `${target.getMonth()}-${target.getFullYear()}`;
       const currentMonthIsDelayed = inst.delayedMonths?.includes(ptrKey);

       if (ptrKey === targetKey) {
           isScheduled = true;
           isDelayed = !!currentMonthIsDelayed;
           break;
       }

       if (!currentMonthIsDelayed) {
           paidCount++;
       }

       if (paidCount >= inst.totalInstallments) {
           break;
       }
       ptr.setMonth(ptr.getMonth() + 1);
    }
    
    return { isVisible: isScheduled, isDelayed };
  };

  // Calculations
  const currentMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
  });

  const currentMonthInvestments = investments.filter(i => {
    // Para fluxo de caixa, consideramos apenas quando foi criado ou se houve "buy" no mês
    // Porém, a estrutura atual de Investment é um ativo. 
    // Vamos considerar o histórico 'investmentTransactions' para o fluxo.
    return false; // Deprecated logic. We use investmentTransactions now.
  });
  
  // Calculate cash flow from investment transactions for current month
  const currentMonthInvTrans = investmentTransactions.filter(it => {
      const itDate = new Date(it.date);
      return itDate.getMonth() === currentDate.getMonth() && itDate.getFullYear() === currentDate.getFullYear();
  });

  const totalInvBuys = currentMonthInvTrans.filter(it => it.type === 'buy').reduce((acc, it) => acc + it.amount, 0);
  const totalInvSells = currentMonthInvTrans.filter(it => it.type === 'sell').reduce((acc, it) => acc + it.amount, 0);

  const currentMonthGoalDeposits = goalTransactions.filter(gt => {
    const gtDate = new Date(gt.date);
    return gt.type === 'deposit' && gtDate.getMonth() === currentDate.getMonth() && gtDate.getFullYear() === currentDate.getFullYear();
  });

  const totalVariableIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalGoalWithdrawalsVal = goalTransactions.filter(gt => {
      const gtDate = new Date(gt.date);
      return gt.type === 'withdraw' && gtDate.getMonth() === currentDate.getMonth() && gtDate.getFullYear() === currentDate.getFullYear();
  }).reduce((acc, t) => acc + t.amount, 0);
  
  const totalMonthlyIncome = totalVariableIncome + totalGoalWithdrawalsVal + totalInvSells;

  const totalVariableExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  
  // --- SUBSCRIPTION CALCULATION ---
  // Filter subscriptions valid for the current month view
  const currentMonthSubscriptions = subscriptions.filter(sub => {
      // Default to far past if createdAt is missing (legacy support)
      const subStart = new Date(sub.createdAt || '2000-01-01');
      const subEnd = sub.archivedAt ? new Date(sub.archivedAt) : null;
      
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // It is active if started before month end AND (not ended OR ended after month start)
      // "End after month start" means it was active at least 1 day in this month
      return subStart <= monthEnd && (!subEnd || subEnd >= monthStart);
  });

  const totalFixedExpense = currentMonthSubscriptions.reduce((acc, s) => acc + s.amount, 0);
  
  // Calculate Installments for Selected Month
  const currentMonthInstallments = installments.map(inst => {
      const status = getInstallmentStatusForDate(inst, currentDate);
      return { ...inst, ...status };
  }).filter(inst => inst.isVisible);

  const totalInstallmentsCost = currentMonthInstallments.reduce((acc, i) => {
    if (i.paidInstallments >= i.totalInstallments) {
        return acc; 
    }
    if (i.isDelayed) {
        return acc;
    }
    const baseAmount = i.totalAmount / i.totalInstallments;
    return acc + baseAmount + (i.accumulatedInterest || 0);
  }, 0);

  // We use the transactions now, not the asset date
  const totalInvestmentsVal = totalInvBuys;
  const totalGoalDepositsVal = currentMonthGoalDeposits.reduce((acc, i) => acc + i.amount, 0);

  const totalMonthlyExpense = totalVariableExpense + totalFixedExpense + totalInstallmentsCost + totalInvestmentsVal + totalGoalDepositsVal;
  const balance = totalMonthlyIncome - totalMonthlyExpense;

  // Chart Data
  const categories = [...new Set([
    ...currentMonthTransactions.filter(t => t.type === 'expense').map(t => t.category),
    ...currentMonthSubscriptions.map(s => s.category),
    currentMonthInstallments.length > 0 ? 'Parcelas' : '',
    totalInvestmentsVal > 0 ? 'Investimentos' : '',
    currentMonthGoalDeposits.length > 0 ? 'Metas' : ''
  ])].filter(Boolean);

  const pieChartData = categories.map(cat => {
    let value = 0;
    if (cat === 'Parcelas') value = totalInstallmentsCost;
    else if (cat === 'Investimentos') value = totalInvestmentsVal;
    else if (cat === 'Metas') value = totalGoalDepositsVal;
    else {
      value += currentMonthTransactions.filter(t => t.type === 'expense' && t.category === cat).reduce((acc, t) => acc + t.amount, 0);
      value += currentMonthSubscriptions.filter(s => s.category === cat).reduce((acc, s) => acc + s.amount, 0);
    }
    return { name: cat, value };
  }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const monthlyFlowData = [
    { name: 'Entradas', value: totalMonthlyIncome, fill: '#10b981' },
    { name: 'Saídas', value: totalMonthlyExpense, fill: '#ef4444' }
  ];

  // Actions
  const handleDelete = async (id: string, type: string) => {
    setConfirmState({ isOpen: true, type, id, title: `Excluir ${type}?`, message: 'Essa ação não pode ser desfeita.' });
  };

  const confirmDelete = async () => {
    const { type, id } = confirmState;
    if (!id) return;

    if (type === 'Movimentação') await deleteData('transactions', id);
    if (type === 'Parcelamento') await deleteData('installments', id);
    if (type === 'Meta') await deleteData('goals', id);
    if (type === 'Investimento') await deleteData('investments', id);
    
    // Para Assinaturas, fazemos um "Soft Delete" (Arquivamento) para manter histórico
    if (type === 'Assinatura') {
        const sub = subscriptions.find(s => s.id === id);
        if (sub) {
            await saveData('subscriptions', { 
                ...sub, 
                archivedAt: new Date().toISOString() 
            });
        }
    }
    
    setConfirmState({ isOpen: false, type: null, id: null, title: '', message: '' });
  };

  const handleUpdateGoalBalance = async (amount: number, type: 'add' | 'remove') => {
    if (!selectedGoalId || !currentUser) return;
    
    const goal = goals.find(g => g.id === selectedGoalId);
    if (!goal) return;

    // 1. Update Goal
    const newAmount = type === 'add' ? goal.currentAmount + amount : Math.max(0, goal.currentAmount - amount);
    await saveData('goals', { ...goal, currentAmount: newAmount });
    
    // 2. Add Goal Transaction History
    const goalTransId = generateId();
    await saveData('goal_transactions', { 
        id: goalTransId, 
        goalId: selectedGoalId, 
        amount, 
        date: new Date().toISOString(), 
        type: type === 'add' ? 'deposit' : 'withdraw' 
    });
    
    // 3. Add General Transaction
    await addTransactionRecord(
        `${type === 'add' ? 'Aporte Meta' : 'Resgate Meta'}: ${goal.title}`,
        amount,
        'Metas',
        type === 'add' ? 'expense' : 'income'
    );
  };

  const handleUpdateInvestmentBalance = async (amount: number, type: 'buy' | 'sell') => {
    if (!selectedInvestmentId || !currentUser) return;
    
    const invest = investments.find(i => i.id === selectedInvestmentId);
    if (!invest) return;

    // 1. Update Investment Total
    const newAmount = type === 'buy' ? invest.amount + amount : Math.max(0, invest.amount - amount);
    await saveData('investments', { ...invest, amount: newAmount });
    
    // 2. Add Investment Transaction History
    const invTransId = generateId();
    await saveData('investment_transactions', { 
        id: invTransId, 
        investmentId: selectedInvestmentId, 
        amount, 
        date: new Date().toISOString(), 
        type: type 
    });
    
    // 3. Add General Transaction (Cash Flow)
    await addTransactionRecord(
        `${type === 'buy' ? 'Aporte Investimento' : 'Resgate Investimento'}: ${invest.name}`,
        amount,
        'Investimentos',
        type === 'buy' ? 'expense' : 'income'
    );
  };

  const handleGenerateReport = async () => {
    setIsReportModalOpen(true);
    setIsAnalyzing(true);
    const report = await getFinancialAdvice(currentMonthTransactions, installments, goals, subscriptions, investments);
    setAiAnalysis(report);
    setIsAnalyzing(false);
  };
  
  // Installment Logic
  const handleDelayInstallment = async (interestAmount: number) => {
      if (!delayModal.installmentId || !currentUser) return;
      
      const inst = installments.find(i => i.id === delayModal.installmentId);
      if (!inst) return;

      const currentMonthKey = `${currentDate.getMonth()}-${currentDate.getFullYear()}`;
      const currentDelays = inst.delayedMonths || [];
      
      const updatedInst = {
          ...inst,
          totalAmount: inst.totalAmount + interestAmount,
          accumulatedInterest: (inst.accumulatedInterest || 0) + interestAmount,
          delayedMonths: [...currentDelays, currentMonthKey]
      };

      await saveData('installments', updatedInst);
      setDelayModal({ isOpen: false, installmentId: null, installmentName: '' });
  };
  
  const handlePayInstallment = async (inst: InstallmentPurchase) => {
      if (!currentUser) return;
      const updatedInst = { 
          ...inst, 
          paidInstallments: Math.min(inst.totalInstallments, inst.paidInstallments + 1),
          accumulatedInterest: 0,
          lastPaymentDate: new Date().toISOString()
      };
      
      await saveData('installments', updatedInst);

      const base = inst.totalAmount / inst.totalInstallments;
      const interest = inst.accumulatedInterest || 0;
      await addTransactionRecord(`Pagamento Parcela: ${inst.description}`, base + interest, 'Parcelas', 'expense');
  };

  const handleAnticipateInstallment = async (months: number) => {
      if (!anticipateModal.installment || !currentUser) return;
      const inst = anticipateModal.installment;
      
      const updatedInst = {
          ...inst,
          paidInstallments: Math.min(inst.totalInstallments, inst.paidInstallments + months),
          lastPaymentDate: new Date().toISOString()
      };
      
      await saveData('installments', updatedInst);

      const baseVal = inst.totalAmount / inst.totalInstallments;
      const totalAnticipated = baseVal * months;
      await addTransactionRecord(`Antecipação Parcela (${months}x): ${inst.description}`, totalAnticipated, 'Parcelas', 'expense');
      
      setAnticipateModal({ isOpen: false, installment: null });
  };

  const handlePayAllInstallments = async () => {
      if (!currentUser) return;
      const batch = writeBatch(db);
      const uid = currentUser.uid;
      let totalPaid = 0;

      installments.forEach(inst => {
          if (inst.paidInstallments < inst.totalInstallments) {
              const base = inst.totalAmount / inst.totalInstallments;
              const interest = inst.accumulatedInterest || 0;
              totalPaid += base + interest;

              const docRef = doc(db, "users", uid, "installments", inst.id);
              batch.update(docRef, {
                  paidInstallments: inst.paidInstallments + 1,
                  accumulatedInterest: 0,
                  lastPaymentDate: new Date().toISOString()
              });
          }
      });

      await batch.commit();
      
      if (totalPaid > 0) {
          await addTransactionRecord('Pagamento Geral de Parcelas', totalPaid, 'Parcelas', 'expense');
      }
      setIsPayAllModalOpen(false);
  };

  const handleAddInvestment = async (inv: Omit<Investment, 'id'>) => {
      const newInv = { ...inv, id: generateId() };
      await saveData('investments', newInv);
      // Log as expense only on creation if amount > 0
      if (inv.amount > 0) {
          await addTransactionRecord(`Investimento Inicial: ${inv.name}`, inv.amount, 'Investimentos', 'expense');
          const invTransId = generateId();
          await saveData('investment_transactions', { 
              id: invTransId, 
              investmentId: newInv.id, 
              amount: inv.amount, 
              date: newInv.date, 
              type: 'buy' 
          });
      }
      setIsInvestModalOpen(false);
  };

  // Subscription Logic
  const handleSaveSubscription = async (s: Omit<Subscription, 'id'>) => {
      const now = new Date().toISOString();

      if (editingSubscription) {
          // Versioning: Archive the old one, create a new one
          // 1. Archive Old
          await saveData('subscriptions', { 
              ...editingSubscription, 
              archivedAt: now 
          });
          
          // 2. Create New (starts now)
          const newS = { 
              ...s, 
              id: generateId(),
              createdAt: now,
              archivedAt: null
          };
          await saveData('subscriptions', newS);
          setEditingSubscription(null);
      } else {
          // New Subscription
          const newS = { 
              ...s, 
              id: generateId(),
              createdAt: now,
              archivedAt: null
          };
          await saveData('subscriptions', newS);
      }
      setIsSubModalOpen(false);
  };

  const theme = themes[currentTheme];

  // Current greeting
  const getGreeting = () => {
      const hours = new Date().getHours();
      if (hours < 12) return 'Bom dia';
      if (hours < 18) return 'Boa tarde';
      return 'Boa noite';
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null;
  const selectedInvestment = investments.find(i => i.id === selectedInvestmentId) || null;

  if (isAuthLoading) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-400 font-medium animate-pulse">Carregando FinanFlow...</p>
              </div>
          </div>
      );
  }

  if (!currentUser) {
      return <AuthPage onLoginSuccess={() => {}} />;
  }

  return (
    <div className={`min-h-screen ${baseTheme.bg} ${baseTheme.text} font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 lg:pb-0 transition-colors duration-300`}>
      
      {/* Sidebar Mobile/Desktop */}
      <nav className={`fixed bottom-0 lg:left-0 w-full lg:w-20 lg:h-screen ${baseTheme.nav} border-t lg:border-t-0 lg:border-r ${baseTheme.navBorder} z-50 flex lg:flex-col items-center justify-around lg:justify-start lg:pt-8 gap-1 lg:gap-6 shadow-xl transition-colors duration-300`}>
        <div className="hidden lg:flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <Sparkles className="text-white" size={24} />
        </div>
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
          { id: 'transactions', icon: ArrowDownRight, label: 'Fluxo' },
          { id: 'installments', icon: Layers, label: 'Parc' },
          { id: 'subscriptions', icon: Repeat, label: 'Fixos' },
          { id: 'goals', icon: PiggyBank, label: 'Metas' },
          { id: 'investments', icon: TrendingUp, label: 'Invest' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`p-3 rounded-xl transition-all duration-300 group relative flex flex-col items-center gap-1 ${activeTab === item.id ? `${theme.primary} text-white shadow-lg` : `${baseTheme.textMuted} hover:bg-slate-200/50 dark:hover:bg-slate-800`}`}
          >
            <item.icon size={22} />
            <span className="text-[9px] font-medium lg:hidden">{item.label}</span>
            {activeTab === item.id && (
                <span className={`absolute lg:left-full lg:top-1/2 lg:-translate-y-1/2 lg:ml-4 lg:mb-0 -top-8 mb-2 px-2 py-1 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800 shadow-md'} text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50`}>
                    {item.label}
                </span>
            )}
          </button>
        ))}
        
        <div className="hidden lg:flex flex-col gap-4 mt-auto mb-8">
            <button onClick={() => setIsThemeModalOpen(true)} className={`p-3 ${baseTheme.textMuted} hover:${baseTheme.textHead} hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors`} title="Temas">
                <Palette size={22} />
            </button>
            <button onClick={handleLogout} className={`p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors`} title="Sair">
                <LogOut size={22} />
            </button>
        </div>
      </nav>

      <main className="lg:ml-20 min-h-screen relative">
        
        {/* TOP NAVBAR (Clean & Modern) */}
        <header className={`sticky top-0 z-40 ${isDarkMode ? 'bg-slate-950/80' : 'bg-slate-50/80'} backdrop-blur-xl border-b ${baseTheme.navBorder} px-4 py-4 lg:px-8 flex items-center justify-between transition-colors duration-300`}>
           <div className="flex items-center gap-4">
              <div 
                 className={`flex items-center gap-3 cursor-pointer group hover:bg-slate-200/50 dark:hover:bg-slate-900 px-2 py-1 rounded-xl transition-colors`}
                 onClick={() => setIsProfileModalOpen(true)}
              >
                  <div className={`w-10 h-10 rounded-full overflow-hidden ${baseTheme.border} border shadow-md`}>
                     {userPhoto ? (
                        <img src={userPhoto} alt="Perfil" className="w-full h-full object-cover" />
                     ) : (
                        <div className={`w-full h-full ${baseTheme.card} flex items-center justify-center ${baseTheme.textMuted}`}>
                            <User size={20} />
                        </div>
                     )}
                  </div>
                  <div className="hidden sm:block">
                     <p className={`text-xs ${baseTheme.textMuted}`}>{getGreeting()},</p>
                     <p className={`text-sm font-bold ${baseTheme.textHead} flex items-center gap-1`}>
                        {userName} <ChevronRight size={12} className={baseTheme.textMuted} />
                     </p>
                  </div>
              </div>

              {/* Date Navigation */}
              <div className={`flex items-center gap-2 ${baseTheme.nav} border ${baseTheme.border} rounded-lg p-1`}>
                 <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className={`p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md ${baseTheme.textMuted} hover:${baseTheme.textHead} transition-colors`}><ChevronLeft size={16}/></button>
                 <span className={`text-sm font-medium ${baseTheme.text} w-24 text-center capitalize`}>{formatMonth(currentDate)}</span>
                 <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className={`p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md ${baseTheme.textMuted} hover:${baseTheme.textHead} transition-colors`}><ChevronRight size={16}/></button>
              </div>
           </div>

           <div className="flex items-center gap-3">
               <button 
                  onClick={() => setIsPrivacyMode(!isPrivacyMode)} 
                  className={`p-2 rounded-xl transition-all ${isPrivacyMode ? 'bg-slate-800 text-slate-300' : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}
                  title={isPrivacyMode ? "Mostrar valores" : "Ocultar valores"}
               >
                  {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>

               <button onClick={handleLogout} className="lg:hidden p-2 text-slate-500"><LogOut size={20} /></button>
               {activeTab === 'dashboard' && (
               <>
                <button onClick={() => setIsThemeModalOpen(true)} className={`lg:hidden p-2 ${baseTheme.textMuted}`}><Palette size={20} /></button>
                <div className={`h-6 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-300'} mx-1 hidden sm:block`}></div>
                <button 
                    onClick={() => setIsTransModalOpen(true)}
                    className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'} rounded-lg transition-all font-bold text-sm shadow-lg`}
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Transação</span>
                </button>
               </>
               )}
           </div>
        </header>

        {/* --- MAIN CONTENT AREA WITH ANIMATION --- */}
        <div 
            key={activeTab}
            className="p-4 lg:p-8 max-w-[1920px] mx-auto space-y-8 animate-fade-in-right duration-500"
        >
            
            {/* --- DASHBOARD VIEW --- */}
            {activeTab === 'dashboard' && (
                <>
                    {/* BENTO GRID LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* LEFT: SUMMARY QUADRANT (The "Balloon" Grid) */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full content-start">
                            <SummaryCard 
                                title="Receitas" 
                                value={totalMonthlyIncome} 
                                icon={ArrowUpRight} 
                                variant="income"
                                formatter={formatCurrency}
                                isDarkMode={isDarkMode}
                                isPrivacyMode={isPrivacyMode}
                            />
                            <SummaryCard 
                                title="Despesas" 
                                value={totalMonthlyExpense} 
                                icon={ArrowDownRight} 
                                variant="expense"
                                formatter={formatCurrency}
                                isDarkMode={isDarkMode}
                                isPrivacyMode={isPrivacyMode}
                                details={
                                    <div className="space-y-1">
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Variáveis</span><span className={isPrivacyMode ? 'blur-sm select-none' : ''}>{getDisplayValue(totalVariableExpense)}</span></div>
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Fixas</span><span className={isPrivacyMode ? 'blur-sm select-none' : ''}>{getDisplayValue(totalFixedExpense)}</span></div>
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Parcelas</span><span className={isPrivacyMode ? 'blur-sm select-none' : ''}>{getDisplayValue(totalInstallmentsCost)}</span></div>
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Invest</span><span className={isPrivacyMode ? 'blur-sm select-none' : ''}>{getDisplayValue(totalInvestmentsVal)}</span></div>
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Metas</span><span className={isPrivacyMode ? 'blur-sm select-none' : ''}>{getDisplayValue(totalGoalDepositsVal)}</span></div>
                                    </div>
                                }
                            />
                            <SummaryCard 
                                title="Saldo Atual" 
                                value={balance} 
                                icon={Wallet} 
                                variant={balance < 0 ? 'alert' : 'balance'} 
                                formatter={formatCurrency}
                                isDarkMode={isDarkMode}
                                isPrivacyMode={isPrivacyMode}
                            />
                            <SummaryCard 
                                title="Previsão Gastos" 
                                value={totalFixedExpense + totalInstallmentsCost} 
                                icon={Calculator} 
                                variant="default" 
                                formatter={formatCurrency}
                                isDarkMode={isDarkMode}
                                isPrivacyMode={isPrivacyMode}
                            />
                        </div>

                        {/* RIGHT: MAIN CHART (Cash Flow) */}
                        <div className={`lg:col-span-7 ${baseTheme.card} border ${baseTheme.border} rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
                             <div className={`absolute top-0 right-0 w-64 h-64 bg-${currentTheme}-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none`}></div>
                             <div className="flex justify-between items-start mb-6 z-10">
                                <div>
                                    <h3 className={`text-lg font-bold ${baseTheme.textHead} flex items-center gap-2`}>
                                        <LineChart className={`text-${currentTheme}-500`} size={20} />
                                        Fluxo de Caixa
                                    </h3>
                                    <p className={`text-sm ${baseTheme.textMuted}`}>Comparativo Entrada vs Saída</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 ${baseTheme.bg} rounded-full border ${baseTheme.border}`}>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className={`text-xs ${baseTheme.textMuted}`}>Entrada</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 ${baseTheme.bg} rounded-full border ${baseTheme.border}`}>
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        <span className={`text-xs ${baseTheme.textMuted}`}>Saída</span>
                                    </div>
                                </div>
                             </div>

                             <div className="h-[240px] w-full z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyFlowData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', color: isDarkMode ? '#f8fafc' : '#1e293b' }} formatter={(val: number) => isPrivacyMode ? '••••' : formatCurrency(val)} />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                            {monthlyFlowData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                    </div>

                    {/* SECONDARY ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* 1. Spending Distribution */}
                        <div className={`${baseTheme.card} border ${baseTheme.border} rounded-3xl p-6 shadow-sm`}>
                            <h3 className={`text-base font-bold ${baseTheme.textHead} mb-4 flex items-center gap-2`}>
                                <PieChartIcon className={`text-${currentTheme}-500`} size={18} />
                                Para onde foi o dinheiro?
                            </h3>
                            <div className="h-[200px]">
                                {pieChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]} stroke="transparent" />)}
                                            </Pie>
                                            <Tooltip formatter={(val:number) => isPrivacyMode ? '••••' : formatCurrency(val)} contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '8px', color: isDarkMode ? '#f1f5f9' : '#1e293b' }} itemStyle={{ color: isDarkMode ? '#fff' : '#000' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className={`h-full flex flex-col items-center justify-center ${baseTheme.textMuted} text-sm border-2 border-dashed ${baseTheme.border} rounded-xl`}>
                                        <p>Sem dados de despesa</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Recent Activity List */}
                        <div className={`${baseTheme.card} border ${baseTheme.border} rounded-3xl p-6 shadow-sm flex flex-col`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-base font-bold ${baseTheme.textHead} flex items-center gap-2`}>
                                    <Clock className={`text-${currentTheme}-500`} size={18} />
                                    Atividade Recente
                                </h3>
                                <button onClick={() => setActiveTab('transactions')} className={`text-xs text-${currentTheme}-500 hover:underline font-medium`}>Ver tudo</button>
                            </div>
                            <div className="flex-1 space-y-3 overflow-hidden">
                                {currentMonthTransactions.length === 0 ? (
                                    <div className={`h-full flex items-center justify-center ${baseTheme.textMuted} text-sm`}>Nenhuma transação</div>
                                ) : (
                                    currentMonthTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4).map(t => (
                                        <div key={t.id} className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-slate-950 hover:bg-slate-950/80' : 'bg-slate-50 hover:bg-slate-100'} border ${baseTheme.border} transition-colors`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className={`font-medium ${baseTheme.text} text-sm truncate w-32 sm:w-auto`}>{t.description}</p>
                                                    <p className={`text-[10px] ${baseTheme.textMuted}`}>{new Date(t.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-bold ${isPrivacyMode ? 'blur-sm select-none' : ''} ${t.type === 'income' ? 'text-emerald-500' : baseTheme.text}`}>
                                                {getDisplayValue(t.amount)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 3. AI & Goals Quick Access */}
                        <div className="flex flex-col gap-4">
                            {/* AI Card */}
                            <div className={`relative overflow-hidden rounded-3xl border ${theme.border} p-6 shadow-lg bg-gradient-to-br ${theme.gradient} group cursor-pointer transition-transform hover:scale-[1.02]`}
                                onClick={handleGenerateReport}
                            >
                                <div className="relative z-10 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BrainCircuit size={20} className="animate-pulse" />
                                        <span className="font-bold text-lg">Gemini Advisor</span>
                                    </div>
                                    <p className="text-white/80 text-sm mb-4 line-clamp-2">Receba insights inteligentes sobre como otimizar seu orçamento este mês.</p>
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                                        Gerar Relatório <Sparkles size={12} className="ml-1" />
                                    </div>
                                </div>
                                <div className="absolute -right-8 -bottom-8 opacity-20">
                                    <BrainCircuit size={120} />
                                </div>
                            </div>

                            {/* Goals Shortcut */}
                            <div className={`flex-1 ${baseTheme.card} border ${baseTheme.border} rounded-3xl p-5 shadow-sm ${baseTheme.cardHover} transition-colors cursor-pointer`}
                                onClick={() => setActiveTab('goals')}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className={`font-bold ${baseTheme.textHead} text-sm`}>Metas Ativas</h4>
                                    <ArrowRight size={14} className={baseTheme.textMuted} />
                                </div>
                                {goals.length > 0 ? (
                                    <div className="space-y-3">
                                        {goals.slice(0, 2).map(g => (
                                            <div key={g.id}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className={baseTheme.textMuted}>{g.title}</span>
                                                    <span className={baseTheme.text}>{Math.round((g.currentAmount / g.targetAmount) * 100)}%</span>
                                                </div>
                                                <div className={`h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                                                    <div className={`h-full ${theme.primary}`} style={{ width: `${Math.min(100, (g.currentAmount / g.targetAmount) * 100)}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={`text-xs ${baseTheme.textMuted}`}>Nenhuma meta definida.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </>
            )}

            {/* --- TRANSACTIONS TAB --- */}
            {activeTab === 'transactions' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Fluxo de Caixa Detalhado</h2>
                        <button onClick={() => setIsTransModalOpen(true)} className={`p-3 ${theme.primary} text-white rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button>
                    </div>
                    <div className={`${baseTheme.card} border ${baseTheme.border} rounded-2xl overflow-hidden shadow-lg`}>
                        {currentMonthTransactions.length === 0 ? (
                            <div className={`p-12 text-center ${baseTheme.textMuted}`}>Nenhuma transação encontrada neste mês.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className={`${baseTheme.tableHeader} ${baseTheme.textMuted} text-xs uppercase tracking-wider`}>
                                        <tr>
                                            <th className="p-4 font-semibold">Data</th>
                                            <th className="p-4 font-semibold">Descrição</th>
                                            <th className="p-4 font-semibold">Categoria</th>
                                            <th className="p-4 font-semibold text-right">Valor</th>
                                            <th className="p-4 font-semibold text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${baseTheme.border}`}>
                                        {currentMonthTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                                            <tr key={t.id} className={`${baseTheme.tableRowHover} transition-colors`}>
                                                <td className={`p-4 ${baseTheme.textMuted} font-mono text-sm`}>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                                <td className={`p-4 font-medium ${baseTheme.textHead}`}>{t.description}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : `${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-200 text-slate-600 border-slate-300'}`}`}>
                                                        {t.category}
                                                    </span>
                                                </td>
                                                <td className={`p-4 text-right font-bold ${isPrivacyMode ? 'blur-sm select-none' : ''} ${t.type === 'income' ? 'text-emerald-500' : baseTheme.text}`}>
                                                    {t.type === 'expense' && '- '}{getDisplayValue(t.amount)}
                                                </td>
                                                <td className="p-4 flex justify-center gap-2">
                                                    <button onClick={() => handleDelete(t.id, 'Movimentação')} className={`p-2 ${baseTheme.textMuted} hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors`}><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- INSTALLMENTS TAB --- */}
            {activeTab === 'installments' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Compras Parceladas</h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsPayAllModalOpen(true)} 
                                className={`flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all font-bold`}
                                title="Pagar Todas"
                            >
                                <CheckCircle2 size={20} />
                                <span className="hidden sm:inline">Pagar Mês</span>
                            </button>
                            <button onClick={() => setIsInstModalOpen(true)} className={`p-3 ${theme.primary} text-white rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button>
                        </div>
                    </div>
                    
                    {currentMonthInstallments.length === 0 ? (
                        <div className={`text-center ${baseTheme.textMuted} py-12 ${baseTheme.card} border ${baseTheme.border} rounded-2xl`}>
                             <Layers size={48} className="mx-auto mb-4 opacity-50" />
                             <p>Nenhuma parcela agendada para este mês.</p>
                             <p className="text-xs mt-2">Navegue pelos meses ou adicione uma nova compra.</p>
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {currentMonthInstallments.map(inst => {
                            const baseInstallment = inst.totalAmount / inst.totalInstallments;
                            const accumulatedInterest = inst.accumulatedInterest || 0;
                            const isDelayed = inst.isDelayed; 
                            const currentInstallmentValue = baseInstallment + accumulatedInterest;
                            const progress = (inst.paidInstallments / inst.totalInstallments) * 100;
                            const lastPayDate = inst.lastPaymentDate ? new Date(inst.lastPaymentDate) : null;
                            const isPaidThisMonth = lastPayDate && lastPayDate.getMonth() === currentDate.getMonth() && lastPayDate.getFullYear() === currentDate.getFullYear();
                            const isFinished = inst.paidInstallments >= inst.totalInstallments;

                            return (
                                <div key={inst.id} className={`${baseTheme.card} border ${baseTheme.border} p-6 rounded-2xl shadow-lg ${baseTheme.cardHover} transition-all relative overflow-hidden ${isDelayed ? 'opacity-80 border-amber-900/40' : ''}`}>
                                    <div className={`absolute top-0 left-0 w-1 h-full ${theme.primary}`}></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className={`font-bold ${baseTheme.textHead} text-lg flex items-center gap-2`}>
                                                {inst.description}
                                                {isDelayed && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-amber-500/30">Adiado</span>}
                                                {isPaidThisMonth && !isFinished && !isDelayed && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Pago</span>}
                                                {isFinished && <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Finalizado</span>}
                                            </h3>
                                            <p className={`${baseTheme.textMuted} text-sm`}>{new Date(inst.purchaseDate).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <button onClick={() => handleDelete(inst.id, 'Parcelamento')} className={`text-slate-500 hover:text-rose-400`}><Trash2 size={18} /></button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-sm">
                                                <span className={baseTheme.textMuted}>Parcela Atual</span>
                                                <span className={`font-semibold ${isPrivacyMode ? 'blur-sm select-none' : ''} ${isDelayed ? 'text-slate-500 line-through' : baseTheme.textHead}`}>
                                                    {getDisplayValue(currentInstallmentValue)}
                                                </span>
                                            </div>
                                            {accumulatedInterest > 0 && !isDelayed && (
                                                <div className="flex justify-end items-center gap-1 text-xs text-rose-400 font-medium animate-pulse">
                                                    <AlertTriangle size={12} />
                                                    Inclui {getDisplayValue(accumulatedInterest)} de juros
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className={`w-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-200'} rounded-full h-3 overflow-hidden border ${baseTheme.border}`}>
                                            <div className={`h-full ${theme.primary} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div className={`flex justify-between text-xs ${baseTheme.textMuted} font-mono`}>
                                            <span>{inst.paidInstallments}/{inst.totalInstallments} Pagas</span>
                                            <span className={isPrivacyMode ? 'blur-sm select-none' : ''}>Total: {getDisplayValue(inst.totalAmount)}</span>
                                        </div>
                                        
                                        {!isFinished && (
                                        <div className="flex gap-2 mt-2">
                                            <button 
                                                disabled={isPaidThisMonth || isDelayed}
                                                onClick={() => setDelayModal({ isOpen: true, installmentId: inst.id, installmentName: inst.description })}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-amber-500/20 text-amber-500 hover:bg-amber-500/10 disabled:opacity-30 disabled:cursor-not-allowed`}
                                            >
                                                Adiar
                                            </button>
                                            
                                            {isPaidThisMonth ? (
                                                <button 
                                                    disabled={isDelayed}
                                                    onClick={() => setAnticipateModal({ isOpen: true, installment: inst })}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1`}
                                                >
                                                    <FastForward size={12} />
                                                    Antecipar
                                                </button>
                                            ) : (
                                                <button 
                                                    disabled={isDelayed}
                                                    onClick={() => handlePayInstallment(inst)}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border ${baseTheme.border} hover:bg-slate-200 dark:hover:bg-slate-800 ${baseTheme.text} disabled:opacity-30 disabled:cursor-not-allowed`}
                                                >
                                                    Pagar
                                                </button>
                                            )}
                                        </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    )}
                </div>
            )}

            {/* --- GOALS TAB --- */}
            {activeTab === 'goals' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Metas Financeiras</h2>
                        <button onClick={() => setIsGoalModalOpen(true)} className={`p-3 ${theme.primary} text-white rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {goals.map(goal => {
                            const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                            return (
                                <div key={goal.id} className={`group ${baseTheme.card} border ${baseTheme.border} rounded-2xl p-6 shadow-lg ${baseTheme.cardHover} transition-all cursor-pointer`}
                                    onClick={() => setSelectedGoalId(goal.id)}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-xl ${theme.bgSoft} group-hover:scale-110 transition-transform`}>
                                            <Target className={theme.text} size={24} />
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(goal.id, 'Meta'); }} className={`text-slate-500 hover:text-rose-400 p-2`}><Trash2 size={18} /></button>
                                    </div>
                                    <h3 className={`text-xl font-bold ${baseTheme.textHead} mb-4`}>{goal.title}</h3>
                                    
                                    <div className={`flex justify-between items-center mb-4 ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50'} p-3 rounded-xl border ${baseTheme.border}`}>
                                        <div>
                                            <p className={`text-[10px] ${baseTheme.textMuted} uppercase tracking-wider font-bold`}>Alvo</p>
                                            <p className={`${baseTheme.text} font-mono text-sm ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(goal.targetAmount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[10px] ${baseTheme.textMuted} uppercase tracking-wider font-bold`}>Restante</p>
                                            <p className={`${baseTheme.textHead} font-mono text-sm ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(remaining)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="relative pt-2">
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className={theme.text}>{percent.toFixed(0)}%</span>
                                            <span className={`${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(goal.currentAmount)}</span>
                                        </div>
                                        <div className={`w-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-200'} rounded-full h-3 border ${baseTheme.border} overflow-hidden`}>
                                            <div className={`h-full ${theme.primary} transition-all duration-700 ease-out`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                    <p className={`text-center text-xs ${baseTheme.textMuted} mt-4 opacity-0 group-hover:opacity-100 transition-opacity`}>Toque para ver detalhes e histórico</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- INVESTMENTS TAB --- */}
            {activeTab === 'investments' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Carteira de Investimentos</h2>
                        <button onClick={() => setIsInvestModalOpen(true)} className={`p-3 ${theme.primary} text-white rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {investments.map(inv => {
                                const style = getInvestmentStyle(inv.type);
                                const Icon = style.icon;
                                return (
                                    <div key={inv.id} 
                                        onClick={() => setSelectedInvestmentId(inv.id)}
                                        className={`${baseTheme.card} border ${baseTheme.border} rounded-2xl p-5 ${baseTheme.cardHover} transition-all flex items-center justify-between group cursor-pointer`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${style.bg}`}>
                                                <Icon className={style.color} size={24} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${baseTheme.textHead}`}>{inv.name}</h4>
                                                <p className={`text-xs ${baseTheme.textMuted}`}>{inv.type} • {new Date(inv.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(inv.amount)}</p>
                                            <div className="flex items-center justify-end gap-2 mt-1">
                                                <span className={`text-[10px] ${baseTheme.textMuted} opacity-0 group-hover:opacity-100 transition-opacity`}>Gerenciar</span>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(inv.id, 'Investimento'); }} className="text-slate-500 hover:text-rose-400 text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className={`${baseTheme.card} border ${baseTheme.border} rounded-2xl p-6 h-fit`}>
                            <h3 className={`${baseTheme.textHead} font-bold mb-4`}>Resumo</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className={baseTheme.textMuted}>Total Investido</span>
                                    <span className={`text-emerald-500 font-bold ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(investments.reduce((acc, i) => acc + i.amount, 0))}</span>
                                </div>
                                <div className={`w-full h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                                <div className={`text-xs ${baseTheme.textMuted} leading-relaxed`}>
                                    Clique em um investimento para aportar mais ou realizar um resgate. O histórico de movimentações ficará salvo.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUBSCRIPTIONS TAB --- */}
            {activeTab === 'subscriptions' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Assinaturas e Fixos</h2>
                        <button onClick={() => { setEditingSubscription(null); setIsSubModalOpen(true); }} className={`p-3 ${theme.primary} text-white rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subscriptions
                            .filter(sub => !sub.archivedAt) // Mostrar apenas assinaturas ativas na aba de assinaturas
                            .map(sub => (
                            <div key={sub.id} className={`${baseTheme.card} border ${baseTheme.border} rounded-2xl p-5 flex flex-col justify-between ${baseTheme.cardHover} transition-all gap-4 group`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} rounded-xl border ${baseTheme.border} ${baseTheme.textMuted}`}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${baseTheme.textHead}`}>{sub.name}</h4>
                                            <p className={`text-xs ${baseTheme.textMuted}`}>Dia {sub.paymentDay} • {sub.category}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold ${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(sub.amount)}</p>
                                </div>
                                
                                <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex gap-2 justify-end`}>
                                    <button 
                                        onClick={() => { setEditingSubscription(sub); setIsSubModalOpen(true); }}
                                        className={`p-2 rounded-lg text-slate-400 hover:text-${currentTheme}-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors border ${baseTheme.border}`}
                                        title="Editar (cria nova vigência a partir deste mês)"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(sub.id, 'Assinatura')} 
                                        className={`p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border ${baseTheme.border}`}
                                        title="Excluir (cancelar assinatura)"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

      </main>

      {/* --- MODALS --- */}
      <AddTransactionModal isOpen={isTransModalOpen} onClose={() => setIsTransModalOpen(false)} onSave={async (t) => { const newT = { ...t, id: generateId() }; await saveData('transactions', newT); setIsTransModalOpen(false); }} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <AddInstallmentModal isOpen={isInstModalOpen} onClose={() => setIsInstModalOpen(false)} onSave={async (i) => { const newI = { ...i, id: generateId() }; await saveData('installments', newI); setIsInstModalOpen(false); }} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <AddGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSave={async (g) => { const newG = { ...g, id: generateId() }; await saveData('goals', newG); setIsGoalModalOpen(false); }} themeColor={currentTheme} isDarkMode={isDarkMode} />
      
      {/* Subscriptions Modal now handles Edit */}
      <AddSubscriptionModal 
        isOpen={isSubModalOpen} 
        onClose={() => { setIsSubModalOpen(false); setEditingSubscription(null); }} 
        onSave={handleSaveSubscription} 
        initialData={editingSubscription}
        themeColor={currentTheme} 
        isDarkMode={isDarkMode} 
      />
      
      <AddInvestmentModal isOpen={isInvestModalOpen} onClose={() => setIsInvestModalOpen(false)} onSave={handleAddInvestment} themeColor={currentTheme} isDarkMode={isDarkMode} />
      
      {/* Detail Modals */}
      <GoalDetailsModal 
        isOpen={!!selectedGoalId} 
        onClose={() => setSelectedGoalId(null)} 
        goal={selectedGoal}
        transactions={goalTransactions}
        onUpdateBalance={handleUpdateGoalBalance}
        onDeleteTransaction={(id) => deleteData('goal_transactions', id)}
        themeColor={currentTheme}
        isDarkMode={isDarkMode}
        isPrivacyMode={isPrivacyMode}
      />

      <InvestmentDetailsModal 
        isOpen={!!selectedInvestmentId} 
        onClose={() => setSelectedInvestmentId(null)} 
        investment={selectedInvestment}
        transactions={investmentTransactions}
        onUpdateBalance={handleUpdateInvestmentBalance}
        onDeleteTransaction={(id) => deleteData('investment_transactions', id)}
        themeColor={currentTheme}
        isDarkMode={isDarkMode}
        isPrivacyMode={isPrivacyMode}
      />

      <FinancialReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} aiAnalysis={aiAnalysis} isAnalyzing={isAnalyzing} chartData={pieChartData} totalIncome={totalMonthlyIncome} totalExpense={totalMonthlyExpense} themeColor={currentTheme} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmDelete} onCancel={() => setConfirmState({ ...confirmState, isOpen: false })} isDarkMode={isDarkMode} />
      <ThemeSelectionModal 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)} 
        currentTheme={currentTheme} 
        onSelectTheme={setCurrentTheme} 
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
      />
      
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        currentName={userName} 
        currentPhoto={userPhoto} 
        onSave={handleProfileUpdate} 
        onDeleteAccount={handleDeleteAccount}
        themeColor={currentTheme} 
        isDarkMode={isDarkMode} 
      />
      
      <DelayInstallmentModal isOpen={delayModal.isOpen} onClose={() => setDelayModal({ ...delayModal, isOpen: false })} onConfirm={handleDelayInstallment} installmentName={delayModal.installmentName} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <PayAllModal isOpen={isPayAllModalOpen} onClose={() => setIsPayAllModalOpen(false)} onConfirm={handlePayAllInstallments} installments={installments} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <AnticipateModal isOpen={anticipateModal.isOpen} onClose={() => setAnticipateModal({ isOpen: false, installment: null })} onConfirm={handleAnticipateInstallment} installment={anticipateModal.installment} themeColor={currentTheme} isDarkMode={isDarkMode} />

    </div>
  );
}

export default App;