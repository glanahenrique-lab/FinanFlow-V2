import React, { useState, useEffect, useRef } from 'react';
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
  FastForward,
  LogOut,
  Eye,
  EyeOff,
  Rocket,
  Menu,
  AreaChart as AreaChartIcon,
  LucideIcon
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
import { doc, getDoc, updateDoc, deleteDoc, collection, onSnapshot, setDoc, writeBatch, arrayUnion } from 'firebase/firestore';
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
import { getFinancialAdvice } from './services/geminiService';
import { formatCurrency, formatMonth, generateId, getCategoryStyle, getInvestmentStyle, getInvestmentColor } from './utils';
import { themes, appUpdates, NAV_ITEMS } from './constants';

const CustomChartTooltip = ({ active, payload, label, isDarkMode, isPrivacyMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={`${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'} backdrop-blur-xl border p-3 rounded-2xl shadow-xl`}>
        <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${data.name === 'Entradas' ? 'bg-emerald-400' : (data.name === 'Saídas' ? 'bg-rose-400' : 'bg-indigo-400')}`}></div>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{label || data.name}</p>
        </div>
        <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {isPrivacyMode ? '••••••' : formatCurrency(Number(data.value))}
        </p>
      </div>
    );
  }
  return null;
};

function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // User Profile
  const [userName, setUserName] = useState('Investidor');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userCustomCards, setUserCustomCards] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'installments' | 'subscriptions' | 'goals' | 'investments' | 'updates' >('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // -- STATES DE PREFERÊNCIA --
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => (localStorage.getItem('appTheme') as ThemeColor) || 'lime');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
        const savedMode = localStorage.getItem('isDarkMode');
        return savedMode !== null ? JSON.parse(savedMode) : true;
    } catch { return true; }
  });
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    try {
        const savedMode = localStorage.getItem('finanflow_privacy_mode');
        return savedMode !== null ? JSON.parse(savedMode) : false;
    } catch { return false; }
  });

  const isInitialLoad = useRef(true);
  const [currentDate, setCurrentDate] = useState(new Date());
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
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
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

  // --- AUTH EFFECT & DATA SYNC ---
  useEffect(() => {
    let userUnsub: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        try {
            const userDocRef = doc(db, "users", user.uid);
            
            // Usando onSnapshot para ouvir mudanças em tempo real no perfil
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
                            localStorage.setItem('finanflow_privacy_mode', JSON.stringify(userData.preferences.isPrivacyMode));
                        }
                    }
                } else {
                    // Create if not exists
                    setDoc(userDocRef, {
                        uid: user.uid,
                        name: user.displayName || 'Investidor',
                        email: user.email,
                        preferences: {
                            theme: currentTheme,
                            isDarkMode: isDarkMode,
                            isPrivacyMode: isPrivacyMode
                        },
                        customCards: []
                    }, { merge: true });
                }
                isInitialLoad.current = false;
            });

        } catch (error) {
            console.error("Erro ao configurar listener do perfil:", error);
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
        setInvestments([]);
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

  // --- SAVE PREFERENCES ---
  useEffect(() => {
      localStorage.setItem('appTheme', currentTheme);
      localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
      localStorage.setItem('finanflow_privacy_mode', JSON.stringify(isPrivacyMode));

      if (currentUser && !isInitialLoad.current) {
          const updatePrefs = async () => {
              try {
                  await updateDoc(doc(db, "users", currentUser.uid), {
                      "preferences.theme": currentTheme,
                      "preferences.isDarkMode": isDarkMode,
                      "preferences.isPrivacyMode": isPrivacyMode
                  });
              } catch (e) {
                  console.warn("Sync pref failed", e);
              }
          };
          updatePrefs();
      }
  }, [currentTheme, isDarkMode, isPrivacyMode, currentUser]);

  // FIRESTORE DATA LISTENERS
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
          alert("Erro ao excluir conta. Tente novamente.");
      }
  };

  const getDisplayValue = (val: number, formatter = formatCurrency) => {
      return isPrivacyMode ? '••••••' : formatter(val);
  };

  const baseTheme = isDarkMode ? {
    bg: '', 
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
    bg: '', 
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

  const currentMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
  });

  // --- FILTER VALID ENTITIES ---
  // Ensure we only calculate totals for investments and goals that actually exist
  const validInvestmentIds = new Set(investments.map(i => i.id));
  const validGoalIds = new Set(goals.map(g => g.id));

  const validInvestmentTransactions = investmentTransactions.filter(t => validInvestmentIds.has(t.investmentId));
  const validGoalTransactions = goalTransactions.filter(t => validGoalIds.has(t.goalId));

  const currentMonthInvTrans = validInvestmentTransactions.filter(it => {
      const itDate = new Date(it.date);
      return itDate.getMonth() === currentDate.getMonth() && itDate.getFullYear() === currentDate.getFullYear();
  });

  const totalInvBuys = currentMonthInvTrans.filter(it => it.type === 'buy').reduce((acc, it) => acc + Number(it.amount), 0);
  const totalInvSells = currentMonthInvTrans.filter(it => it.type === 'sell').reduce((acc, it) => acc + Number(it.amount), 0);

  const currentMonthGoalDeposits = validGoalTransactions.filter(gt => {
    const gtDate = new Date(gt.date);
    return gt.type === 'deposit' && gtDate.getMonth() === currentDate.getMonth() && gtDate.getFullYear() === currentDate.getFullYear();
  });

  const totalVariableIncome = currentMonthTransactions
      .filter(t => t.type === 'income' && t.category !== 'Metas' && t.category !== 'Investimentos')
      .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalGoalWithdrawalsVal = validGoalTransactions.filter(gt => {
      const gtDate = new Date(gt.date);
      return gt.type === 'withdraw' && gtDate.getMonth() === currentDate.getMonth() && gtDate.getFullYear() === currentDate.getFullYear();
  }).reduce((acc, t) => acc + Number(t.amount), 0);
  
  const totalMonthlyIncome = totalVariableIncome + totalGoalWithdrawalsVal + totalInvSells;

  const totalVariableExpense = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category !== 'Metas' && t.category !== 'Investimentos')
      .reduce((acc, t) => acc + Number(t.amount), 0);
  
  const currentMonthSubscriptions = subscriptions.filter(sub => {
      const subStart = new Date(sub.createdAt || '2000-01-01');
      const subEnd = sub.archivedAt ? new Date(sub.archivedAt) : null;
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return subStart <= monthEnd && (!subEnd || subEnd >= monthStart);
  });

  const totalFixedExpense = currentMonthSubscriptions.reduce((acc, s) => acc + Number(s.amount), 0);
  
  const currentMonthInstallments = installments.map(inst => {
      const status = getInstallmentStatusForDate(inst, currentDate);
      return { ...inst, ...status };
  }).filter(inst => inst.isVisible);

  const totalInstallmentsCost = currentMonthInstallments.reduce((acc, i) => {
    const inst = i as any;
    if (inst.paidInstallments >= inst.totalInstallments) {
        return acc; 
    }
    if (inst.isDelayed) {
        return acc;
    }
    const baseAmount = Number(inst.totalAmount) / Number(inst.totalInstallments);
    const interest = Number(inst.accumulatedInterest || 0);
    return acc + baseAmount + interest;
  }, 0);

  const totalInvestmentsVal = totalInvBuys;
  const totalGoalDepositsVal = currentMonthGoalDeposits.reduce((acc, i) => acc + Number(i.amount), 0);

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
      value += currentMonthTransactions.filter(t => t.type === 'expense' && t.category === cat).reduce((acc, t) => acc + Number(t.amount), 0);
      value += currentMonthSubscriptions.filter(s => s.category === cat).reduce((acc, s) => acc + Number(s.amount), 0);
    }
    return { name: cat, value };
  }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const monthlyFlowData = [
    { name: 'Entradas', value: totalMonthlyIncome, fill: '#10b981' },
    { name: 'Saídas', value: totalMonthlyExpense, fill: '#ef4444' }
  ];

  const allocationData = Object.entries(
    investments.reduce<Record<string, number>>((acc, curr) => {
        const current = Number(acc[curr.type] || 0);
        acc[curr.type] = current + Number(curr.amount);
        return acc;
    }, {})
  ).map(([name, value]) => ({ 
      name, 
      value,
      color: getInvestmentColor(name) 
  })).sort((a,b) => b.value - a.value);

  const growthData = (() => {
    type MonthlyNetItem = { sortKey: string, name: string, net: number };
    const monthlyNet = validInvestmentTransactions.reduce<Record<string, MonthlyNetItem>>((acc, t) => {
        const date = new Date(t.date);
        const month = Number(date.getMonth());
        const year = Number(date.getFullYear());
        const sortKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const displayKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        let item = acc[sortKey];
        if (!item) {
            item = { sortKey, name: displayKey, net: 0 };
            acc[sortKey] = item;
        }
        
        const amount = Number(t.amount);
        const val = t.type === 'buy' ? amount : -amount;
        item.net = Number(item.net) + val;
        
        return acc;
    }, {});
    let runningTotal = 0;
    return (Object.values(monthlyNet) as MonthlyNetItem[])
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(item => {
            runningTotal += item.net;
            return { name: item.name, value: runningTotal };
        });
  })();

  const monthlyInvestmentTypes = currentMonthInvTrans
    .filter(t => t.type === 'buy')
    .reduce((acc: Record<string, number>, t) => {
        const inv = investments.find(i => i.id === t.investmentId);
        const type = inv ? inv.type : 'Outros';
        const current = acc[type] || 0;
        acc[type] = current + Number(t.amount);
        return acc;
    }, {} as Record<string, number>);

  // Actions
  const handleDelete = async (id: string, type: string) => {
    setConfirmState({ isOpen: true, type, id, title: `Excluir ${type}?`, message: 'Essa ação não pode ser desfeita.' });
  };

  const confirmDelete = async () => {
    const { type, id } = confirmState;
    if (!id) return;
    
    if (type === 'Movimentação') await deleteData('transactions', id);
    if (type === 'Parcelamento') await deleteData('installments', id);
    
    if (type === 'Meta') {
        // Clean up transactions associated with this goal
        const linkedTrans = goalTransactions.filter(t => t.goalId === id);
        for (const t of linkedTrans) {
            await deleteData('goal_transactions', t.id);
        }
        await deleteData('goals', id);
    }
    
    if (type === 'Investimento') {
        // Clean up transactions associated with this investment
        const linkedTrans = investmentTransactions.filter(t => t.investmentId === id);
        for (const t of linkedTrans) {
            await deleteData('investment_transactions', t.id);
        }
        await deleteData('investments', id);
    }
    
    if (type === 'Assinatura') {
        const sub = subscriptions.find(s => s.id === id);
        if (sub) {
            await saveData('subscriptions', { ...sub, archivedAt: new Date().toISOString() });
        }
    }
    setConfirmState({ isOpen: false, type: null, id: null, title: '', message: '' });
  };

  const handleUpdateGoalBalance = async (amount: number, type: 'add' | 'remove') => {
    if (!selectedGoalId || !currentUser) return;
    const goal = goals.find(g => g.id === selectedGoalId);
    if (!goal) return;
    const newAmount = type === 'add' ? Number(goal.currentAmount) + Number(amount) : Math.max(0, Number(goal.currentAmount) - Number(amount));
    await saveData('goals', { ...goal, currentAmount: newAmount });
    const goalTransId = generateId();
    await saveData('goal_transactions', { id: goalTransId, goalId: selectedGoalId, amount, date: new Date().toISOString(), type: type === 'add' ? 'deposit' : 'withdraw' });
    await addTransactionRecord(`${type === 'add' ? 'Aporte Meta' : 'Resgate Meta'}: ${goal.title}`, amount, 'Metas', type === 'add' ? 'expense' : 'income');
  };

  const handleUpdateInvestmentBalance = async (amount: number, type: 'buy' | 'sell') => {
    if (!selectedInvestmentId || !currentUser) return;
    const invest = investments.find(i => i.id === selectedInvestmentId);
    if (!invest) return;
    const newAmount = type === 'buy' ? Number(invest.amount) + Number(amount) : Math.max(0, Number(invest.amount) - Number(amount));
    await saveData('investments', { ...invest, amount: newAmount });
    const invTransId = generateId();
    await saveData('investment_transactions', { id: invTransId, investmentId: selectedInvestmentId, amount, date: new Date().toISOString(), type: type });
    await addTransactionRecord(`${type === 'buy' ? 'Aporte Investimento' : 'Resgate Investimento'}: ${invest.name}`, amount, 'Investimentos', type === 'buy' ? 'expense' : 'income');
  };

  const handleGenerateReport = async () => {
    setIsReportModalOpen(true);
    setIsAnalyzing(true);
    const report = await getFinancialAdvice(currentMonthTransactions, installments, goals, subscriptions, investments);
    setAiAnalysis(report);
    setIsAnalyzing(false);
  };
  
  const handleDelayInstallment = async (interestAmount: number) => {
      if (!delayModal.installmentId || !currentUser) return;
      const inst = installments.find(i => i.id === delayModal.installmentId);
      if (!inst) return;
      const currentMonthKey = `${currentDate.getMonth()}-${currentDate.getFullYear()}`;
      const currentDelays = inst.delayedMonths || [];
      const updatedInst = {
          ...inst,
          totalAmount: Number(inst.totalAmount) + Number(interestAmount),
          accumulatedInterest: (Number(inst.accumulatedInterest) || 0) + Number(interestAmount),
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
      const base = Number(inst.totalAmount) / Number(inst.totalInstallments);
      const interest = Number(inst.accumulatedInterest) || 0;
      await addTransactionRecord(`Pagamento Parcela: ${inst.description}`, Number(base) + Number(interest), 'Parcelas', 'expense');
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
      const baseVal = Number(inst.totalAmount) / Number(inst.totalInstallments);
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
              const base = Number(inst.totalAmount) / Number(inst.totalInstallments);
              const interest = Number(inst.accumulatedInterest) || 0;
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
      if (inv.amount > 0) {
          await addTransactionRecord(`Investimento Inicial: ${inv.name}`, inv.amount, 'Investimentos', 'expense');
          const invTransId = generateId();
          await saveData('investment_transactions', { id: invTransId, investmentId: newInv.id, amount: inv.amount, date: newInv.date, type: 'buy' });
      }
      setIsInvestModalOpen(false);
  };

  const handleSaveSubscription = async (s: Omit<Subscription, 'id'>) => {
      const now = new Date().toISOString();
      if (editingSubscription) {
          await saveData('subscriptions', { ...editingSubscription, archivedAt: now });
          const newS = { ...s, id: generateId(), createdAt: now, archivedAt: null };
          await saveData('subscriptions', newS);
          setEditingSubscription(null);
      } else {
          const newS = { ...s, id: generateId(), createdAt: now, archivedAt: null };
          await saveData('subscriptions', newS);
      }
      setIsSubModalOpen(false);
  };

  const handleSaveInstallment = async (i: Omit<InstallmentPurchase, 'id'>, saveNewCard?: boolean) => {
      if (!currentUser) return;
      const newI = { ...i, id: generateId() };
      
      await saveData('installments', newI);
      
      if (saveNewCard && i.card) {
          try {
              const userRef = doc(db, "users", currentUser.uid);
              await updateDoc(userRef, {
                  customCards: arrayUnion(i.card)
              });
              setUserCustomCards(prev => [...prev, i.card!]);
          } catch (e) {
              console.error("Erro ao salvar novo cartão:", e);
          }
      }
      setIsInstModalOpen(false);
  };

  const theme = themes[currentTheme];
  const getGreeting = () => {
      const hours = new Date().getHours();
      if (hours < 12) return 'Bom dia';
      if (hours < 18) return 'Boa tarde';
      return 'Boa noite';
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null;
  const selectedInvestment = investments.find(i => i.id === selectedInvestmentId) || null;
  const mobileNavItems = NAV_ITEMS.filter(item => ['dashboard', 'transactions'].includes(item.id));
  const mobileMenuItems = NAV_ITEMS.filter(item => !['dashboard', 'transactions'].includes(item.id));

  if (isAuthLoading) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-lime-400 font-medium animate-pulse">Carregando FinanFlow...</p>
              </div>
          </div>
      );
  }

  if (!currentUser) {
      return <AuthPage onLoginSuccess={() => {}} />;
  }

  if (!currentUser.emailVerified) {
      return (
          <VerifyEmailPage 
              user={currentUser} 
              onLogout={() => signOut(auth)}
              isDarkMode={isDarkMode}
          />
      );
  }

  return (
    <div className={`min-h-screen ${theme.selection} ${baseTheme.text} font-sans pb-24 lg:pb-0 transition-colors duration-300 relative`}>
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] ${isDarkMode ? 'opacity-20' : 'opacity-40'}`} />
          <div className={`absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[130px] opacity-15 transition-all duration-1000 ease-in-out ${theme.primary}`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-10 transition-all duration-1000 ease-in-out ${theme.primary}`} />
      </div>

      {/* DESKTOP SIDEBAR */}
      <nav className={`fixed bottom-0 lg:left-0 w-full lg:w-20 lg:h-screen ${baseTheme.nav} border-t lg:border-t-0 lg:border-r ${baseTheme.navBorder} z-40 hidden lg:flex flex-col items-center justify-start lg:pt-8 gap-4 shadow-xl transition-colors duration-300`}>
        <div className="hidden lg:flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-br from-lime-400 to-emerald-600 rounded-xl shadow-lg shadow-lime-500/20 shrink-0">
          <Sparkles className="text-black" size={24} />
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const isDash = item.id === 'dashboard';
          let activeStyle = '';
          if (isActive) {
               activeStyle = isDash ? 'bg-lime-400 text-slate-900 shadow-[0_0_15px_rgba(163,230,53,0.4)] scale-105 z-10' : `${theme.primary} text-black shadow-lg scale-105`;
          } else {
               if (isDash) {
                   activeStyle = isDarkMode ? 'text-lime-400 bg-lime-500/10 hover:bg-lime-500/20' : 'text-lime-600 bg-lime-100/80 hover:bg-lime-200/80';
               } else {
                   activeStyle = `${baseTheme.textMuted} hover:bg-slate-200/50 dark:hover:bg-slate-800`;
               }
          }
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`p-3 rounded-xl transition-all duration-300 group relative flex flex-col items-center gap-1 shrink-0 ${activeStyle}`}>
              <item.icon size={22} />
              <span className="text-[9px] font-medium lg:hidden">{item.label}</span>
              {isActive && (<span className={`absolute lg:left-full lg:top-1/2 lg:-translate-y-1/2 lg:ml-4 lg:mb-0 -top-8 mb-2 px-2 py-1 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800 shadow-md'} text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50`}>{item.label}</span>)}
            </button>
          );
        })}
        <div className="flex flex-col gap-4 mt-auto mb-8 shrink-0">
            <button onClick={handleLogoutClick} className={`p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors`} title="Sair"><LogOut size={22} /></button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (<div className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-[1px]" onClick={() => setIsMobileMenuOpen(false)} />)}
      <nav className={`fixed bottom-0 left-0 w-full ${baseTheme.nav} border-t ${baseTheme.navBorder} z-50 lg:hidden flex justify-around items-center h-20 px-4 pb-2 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-colors duration-300`}>
          {mobileNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const isDash = item.id === 'dashboard';
              let activeStyle = '';
              if (isActive) {
                   activeStyle = isDash ? 'text-lime-500 drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]' : `${theme.text} drop-shadow-[0_0_8px_rgba(163,230,53,0.3)]`;
              } else {
                   activeStyle = 'text-slate-400 hover:text-slate-500';
              }
              return (
                  <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center justify-center gap-1 p-2 w-20 transition-all active:scale-95 ${isActive ? '-translate-y-2' : ''}`}>
                      <div className={`p-1.5 rounded-xl transition-all ${isActive ? (isDarkMode ? 'bg-slate-800' : 'bg-slate-100') : ''}`}>
                         <item.icon size={isActive ? 24 : 22} className={activeStyle} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className={`text-[10px] font-medium transition-all ${isActive ? (isDash ? 'text-lime-500' : theme.text) : 'text-slate-400'}`}>{item.label}</span>
                  </button>
              );
          })}
          <div className="relative">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`flex flex-col items-center justify-center gap-1 p-2 w-20 transition-all active:scale-95 ${isMobileMenuOpen ? '-translate-y-2 text-white' : 'text-slate-400'}`}>
                  <div className={`p-1.5 rounded-xl transition-all ${isMobileMenuOpen ? 'bg-slate-800' : ''}`}><Menu size={22} /></div>
                  <span className="text-[10px] font-medium">Menu</span>
              </button>
              {isMobileMenuOpen && (
                  <div className={`absolute bottom-full right-0 mb-4 w-48 ${baseTheme.card} border ${baseTheme.border} rounded-2xl shadow-2xl p-2 animate-in slide-in-from-bottom-5 duration-200`}>
                      {mobileMenuItems.map((item) => {
                          const isActive = activeTab === item.id;
                          return (
                              <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${isActive ? (isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900') : (isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}`}>
                                  <item.icon size={18} />{item.label}
                              </button>
                          );
                      })}
                      <div className={`h-px w-full my-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                      <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10"><LogOut size={18} /> Sair</button>
                  </div>
              )}
          </div>
      </nav>

      <main className="lg:ml-20 min-h-screen relative z-10">
        
        {/* TOP NAVBAR */}
        <header className={`sticky top-0 z-40 ${isDarkMode ? 'bg-slate-950/80' : 'bg-slate-50/80'} backdrop-blur-xl border-b ${baseTheme.navBorder} px-4 py-4 lg:px-8 flex items-center justify-between transition-colors duration-300`}>
           <div className="flex items-center gap-4">
              <div className={`flex items-center gap-3 cursor-pointer group hover:bg-slate-200/50 dark:hover:bg-slate-900 px-2 py-1 rounded-xl transition-colors`} onClick={() => setIsProfileModalOpen(true)}>
                  <div className={`w-10 h-10 rounded-full overflow-hidden ${baseTheme.border} border shadow-md relative`}>
                     {userPhoto ? (<img src={userPhoto} alt="Perfil" className="w-full h-full object-cover" />) : (<div className={`w-full h-full ${baseTheme.card} flex items-center justify-center ${baseTheme.textMuted}`}><User size={20} /></div>)}
                  </div>
                  <div className="hidden sm:block">
                     <p className={`text-xs ${baseTheme.textMuted}`}>{getGreeting()},</p>
                     <p className={`text-sm font-bold ${baseTheme.textHead} flex items-center gap-1`}>{userName} <ChevronRight size={12} className={baseTheme.textMuted} /></p>
                  </div>
              </div>
              {activeTab !== 'updates' && (
                  <div className={`hidden md:flex items-center gap-2 ${baseTheme.nav} border ${baseTheme.border} rounded-lg p-1`}>
                     <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className={`p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md ${baseTheme.textMuted} hover:${baseTheme.textHead} transition-colors`}><ChevronLeft size={16}/></button>
                     <span className={`text-sm font-medium ${baseTheme.text} w-24 text-center capitalize`}>{formatMonth(currentDate)}</span>
                     <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className={`p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md ${baseTheme.textMuted} hover:${baseTheme.textHead} transition-colors`}><ChevronRight size={16}/></button>
                  </div>
              )}
           </div>
           <div className="flex items-center gap-3">
               <button 
                   onClick={handleGenerateReport}
                   className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-lime-400 hover:bg-slate-900' : 'text-lime-600 hover:bg-slate-200/50'} relative group`}
                   title="Relatório Inteligente"
               >
                   <BrainCircuit size={20} />
               </button>
               <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className={`p-2 rounded-xl transition-all ${isPrivacyMode ? 'bg-slate-800 text-slate-300' : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800'}`} title={isPrivacyMode ? "Mostrar valores" : "Ocultar valores"}>{isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}</button>
               {activeTab === 'dashboard' && (<><div className={`h-6 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-300'} mx-1 hidden sm:block`}></div><button onClick={() => setIsTransModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'} rounded-lg transition-all font-bold text-sm shadow-lg`}><Plus size={18} /><span className="hidden sm:inline">Transação</span></button></>)}
           </div>
        </header>

        {/* MAIN CONTENT */}
        <div key={activeTab} className="p-4 lg:p-8 max-w-[1920px] mx-auto space-y-8 animate-fade-in-right duration-500">
            
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
                <>
                    <div className="mb-6">
                        <h1 className={`text-2xl md:text-3xl font-bold ${baseTheme.textHead}`}>
                            Olá, <span className={`text-${currentTheme}-500`}>{userName.split(' ')[0]}</span>! 👋
                        </h1>
                        <p className={`${baseTheme.textMuted} text-sm md:text-base mt-1`}>
                            Bem-vindo ao seu aplicativo de organização financeira.
                        </p>
                    </div>

                    <div className="md:hidden flex items-center justify-between bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 mb-4 backdrop-blur-sm">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 text-slate-400 hover:text-white"><ChevronLeft size={20}/></button>
                        <span className="text-white font-bold capitalize">{formatMonth(currentDate)}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 text-slate-400 hover:text-white"><ChevronRight size={20}/></button>
                    </div>

                    {/* CARDS REORDERED: Receitas > Aportes > Previsão > Despesas > Saldo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-6">
                        <SummaryCard 
                            title="Receitas" 
                            value={totalMonthlyIncome} 
                            icon={ArrowUpRight} 
                            variant="income"
                            formatter={formatCurrency}
                            isDarkMode={isDarkMode}
                            isPrivacyMode={isPrivacyMode}
                            themeColor={currentTheme}
                            details={
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Variáveis</span><span className={`${baseTheme.textHead} font-medium ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(totalVariableIncome)}</span></div>
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Resgates Inv.</span><span className={`${baseTheme.textHead} font-medium ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(totalInvSells)}</span></div>
                                </div>
                            }
                        />
                        <SummaryCard 
                            title="Aportes (Mês)" 
                            value={totalInvestmentsVal} 
                            icon={TrendingUp} 
                            variant="investment" 
                            formatter={formatCurrency}
                            isDarkMode={isDarkMode}
                            isPrivacyMode={isPrivacyMode}
                            themeColor={currentTheme}
                            details={
                                <div className="space-y-1.5 pt-2">
                                    {Object.entries(monthlyInvestmentTypes).map(([type, val]) => (
                                        <div key={type} className="flex justify-between text-xs"><span className={baseTheme.textMuted}>{type}</span><span className={`${baseTheme.textHead} font-medium ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(val as number)}</span></div>
                                    ))}
                                    {Object.keys(monthlyInvestmentTypes).length === 0 && <span className={`text-xs ${baseTheme.textMuted}`}>Nenhum aporte</span>}
                                </div>
                            }
                        />
                        <SummaryCard 
                            title="Previsão Gastos" 
                            value={totalFixedExpense + totalInstallmentsCost} 
                            icon={Calculator} 
                            variant="default" 
                            formatter={formatCurrency}
                            isDarkMode={isDarkMode}
                            isPrivacyMode={isPrivacyMode}
                            themeColor={currentTheme}
                            details={
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Fixos</span><span className={`${baseTheme.textHead} font-medium ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(totalFixedExpense)}</span></div>
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Parcelas</span><span className={`${baseTheme.textHead} font-medium ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(totalInstallmentsCost)}</span></div>
                                </div>
                            }
                        />
                        <SummaryCard 
                            title="Despesas" 
                            value={totalMonthlyExpense} 
                            icon={ArrowDownRight} 
                            variant="expense"
                            formatter={formatCurrency}
                            isDarkMode={isDarkMode}
                            isPrivacyMode={isPrivacyMode}
                            themeColor={currentTheme}
                            details={
                                <div className="space-y-1.5 pt-2">
                                <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Variáveis</span><span className={`${baseTheme.textHead} font-medium ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(totalVariableExpense)}</span></div>
                                <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Metas</span><span className={`${baseTheme.textHead} font-medium ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(totalGoalDepositsVal)}</span></div>
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
                            themeColor={currentTheme}
                            details={
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Entradas</span><span className={`text-emerald-500 font-bold ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(totalMonthlyIncome)}</span></div>
                                    <div className="flex justify-between text-xs"><span className={baseTheme.textMuted}>Saídas</span><span className={`text-rose-500 font-bold ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(totalMonthlyExpense)}</span></div>
                                </div>
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className={`lg:col-span-2 ${baseTheme.card} border ${baseTheme.border} rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col`}>
                             <div className={`absolute top-0 right-0 w-64 h-64 bg-${currentTheme}-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none`}></div>
                             <div className="flex justify-between items-start mb-6 z-10">
                                <div>
                                    <h3 className={`text-lg font-bold ${baseTheme.textHead} flex items-center gap-2`}><LineChart className={`text-${currentTheme}-500`} size={20} />Fluxo de Caixa</h3>
                                    <p className={`text-sm ${baseTheme.textMuted}`}>Entradas vs Saídas no Mês</p>
                                </div>
                             </div>
                             <div className="h-[280px] w-full z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyFlowData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={32}>
                                        <defs>
                                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981" stopOpacity={0.6}/><stop offset="100%" stopColor="#10b981" stopOpacity={1}/></linearGradient>
                                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6}/><stop offset="100%" stopColor="#f43f5e" stopOpacity={1}/></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} horizontal={true} vertical={false} opacity={0.3} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={70} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600}} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: isDarkMode ? '#ffffff0a' : '#00000005', radius: 8}} content={<CustomChartTooltip isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />} />
                                        <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={1000}>
                                            {monthlyFlowData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.name === 'Entradas' ? 'url(#incomeGradient)' : 'url(#expenseGradient)'} />))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                        <div className={`${baseTheme.card} border ${baseTheme.border} rounded-3xl p-6 shadow-sm flex flex-col`}>
                            <h3 className={`text-base font-bold ${baseTheme.textHead} mb-2 flex items-center gap-2`}><PieChartIcon className={`text-${currentTheme}-500`} size={18} />Categorias</h3>
                            <div className="flex-1 min-h-[220px]">
                                {pieChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} cornerRadius={6} dataKey="value" stroke="none">
                                                {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]} />)}
                                            </Pie>
                                            <Tooltip content={<CustomChartTooltip isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (<div className={`h-full flex flex-col items-center justify-center ${baseTheme.textMuted} text-xs border-2 border-dashed ${baseTheme.border} rounded-xl`}><p>Sem dados</p></div>)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`${baseTheme.card} border ${baseTheme.border} rounded-3xl p-6 shadow-sm flex flex-col`}>
                            <div className="flex justify-between items-center mb-6">
                                <div><h3 className={`text-base font-bold ${baseTheme.textHead} flex items-center gap-2`}><Clock className={`text-${currentTheme}-500`} size={18} />Atividade Recente</h3></div>
                                <button onClick={() => setActiveTab('transactions')} className={`text-xs text-${currentTheme}-500 hover:underline font-medium`}>Ver tudo</button>
                            </div>
                            <div className="flex-1 space-y-3 overflow-hidden">
                                {currentMonthTransactions.length === 0 ? (<div className={`h-32 flex items-center justify-center ${baseTheme.textMuted} text-sm bg-slate-100/5 rounded-xl border border-dashed ${baseTheme.border}`}>Nenhuma transação este mês.</div>) : (
                                    currentMonthTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(t => (
                                        <div key={t.id} className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-slate-950/50 hover:bg-slate-950' : 'bg-slate-50 hover:bg-slate-100'} border ${baseTheme.border} transition-colors group`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</div>
                                                <div><p className={`font-medium ${baseTheme.text} text-sm`}>{t.description}</p><p className={`text-[10px] ${baseTheme.textMuted}`}>{new Date(t.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</p></div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1"><span className={`text-sm font-bold ${isPrivacyMode ? 'blur-sm select-none' : ''} ${t.type === 'income' ? 'text-emerald-500' : baseTheme.text}`}>{getDisplayValue(t.amount)}</span><span className={`text-[9px] px-1.5 py-0.5 rounded ${getCategoryStyle(t.category)} bg-opacity-50`}>{t.category}</span></div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className={`${baseTheme.card} border ${baseTheme.border} rounded-3xl p-5 shadow-sm flex-1`}>
                                <div className="flex justify-between items-center mb-4"><h4 className={`font-bold ${baseTheme.textHead} text-sm flex items-center gap-2`}><Target className={`text-${currentTheme}-500`} size={16} />Metas Principais</h4><button onClick={() => setActiveTab('goals')} className="text-xs text-slate-500 hover:text-slate-400">Ver todas</button></div>
                                {goals.length > 0 ? (<div className="space-y-4">{goals.slice(0, 3).map(g => (<div key={g.id} className="group cursor-pointer" onClick={() => setSelectedGoalId(g.id)}><div className="flex justify-between text-xs mb-1.5"><span className={`font-medium ${baseTheme.text}`}>{g.title}</span><span className={baseTheme.textMuted}>{Math.round((g.currentAmount / g.targetAmount) * 100)}%</span></div><div className={`h-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden`}><div className={`h-full ${theme.primary} transition-all duration-1000 group-hover:opacity-80`} style={{ width: `${Math.min(100, (g.currentAmount / g.targetAmount) * 100)}%` }}></div></div></div>))}</div>) : (<div className={`text-center py-6 text-xs ${baseTheme.textMuted}`}>Defina metas para acompanhar seu progresso.</div>)}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TRANSACTIONS */}
            {activeTab === 'transactions' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center"><h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Fluxo de Caixa Detalhado</h2><button onClick={() => setIsTransModalOpen(true)} className={`p-3 ${theme.primary} text-black rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button></div>
                    <div className={`${baseTheme.card} border ${baseTheme.border} rounded-2xl overflow-hidden shadow-lg`}>
                        {currentMonthTransactions.length === 0 ? (<div className={`p-12 text-center ${baseTheme.textMuted}`}>Nenhuma transação encontrada neste mês.</div>) : (
                            <div className="overflow-x-auto"><table className="w-full text-left"><thead className={`${baseTheme.tableHeader} ${baseTheme.textMuted} text-xs uppercase tracking-wider`}><tr><th className="p-4 font-semibold">Data</th><th className="p-4 font-semibold">Descrição</th><th className="p-4 font-semibold">Categoria</th><th className="p-4 font-semibold text-right">Valor</th><th className="p-4 font-semibold text-center">Ações</th></tr></thead><tbody className={`divide-y ${baseTheme.border}`}>{currentMonthTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (<tr key={t.id} className={`${baseTheme.tableRowHover} transition-colors`}><td className={`p-4 ${baseTheme.textMuted} font-mono text-sm`}>{new Date(t.date).toLocaleDateString('pt-BR')}</td><td className={`p-4 font-medium ${baseTheme.textHead}`}>{t.description}</td><td className="p-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryStyle(t.category)}`}>{t.category}</span></td><td className={`p-4 text-right font-bold ${isPrivacyMode ? 'blur-sm select-none' : ''} ${t.type === 'income' ? 'text-emerald-500' : baseTheme.text}`}>{t.type === 'expense' && '- '}{getDisplayValue(t.amount)}</td><td className="p-4 flex justify-center gap-2"><button onClick={() => handleDelete(t.id, 'Movimentação')} className={`p-2 ${baseTheme.textMuted} hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors`}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
                        )}
                    </div>
                </div>
            )}

            {/* INSTALLMENTS */}
            {activeTab === 'installments' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center"><h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Compras Parceladas</h2><div className="flex gap-2"><button onClick={() => setIsPayAllModalOpen(true)} className={`flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all font-bold`}><CheckCircle2 size={20} /><span className="hidden sm:inline">Pagar Mês</span></button><button onClick={() => setIsInstModalOpen(true)} className={`p-3 ${theme.primary} text-black rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button></div></div>
                    {currentMonthInstallments.length === 0 ? (<div className={`text-center ${baseTheme.textMuted} py-12 ${baseTheme.card} border ${baseTheme.border} rounded-2xl`}><Layers size={48} className="mx-auto mb-4 opacity-50" /><p>Nenhuma parcela agendada para este mês.</p></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{currentMonthInstallments.map(inst => {
                            const baseInstallment = Number(inst.totalAmount) / Number(inst.totalInstallments);
                            const accumulatedInterest = Number(inst.accumulatedInterest || 0);
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
                                            <div className="flex flex-col gap-0.5">
                                                <p className={`${baseTheme.textMuted} text-sm`}>{new Date(inst.purchaseDate).toLocaleDateString('pt-BR')}</p>
                                                {inst.card && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                        <CreditCard size={12} />
                                                        <span>{inst.card}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(inst.id, 'Parcelamento')} className={`text-slate-500 hover:text-rose-400`}><Trash2 size={18} /></button>
                                    </div>
                                    <div className="space-y-4"><div className="flex flex-col gap-1"><div className="flex justify-between text-sm"><span className={baseTheme.textMuted}>Parcela Atual</span><span className={`font-semibold ${isPrivacyMode ? 'blur-sm select-none' : ''} ${isDelayed ? 'text-slate-500 line-through' : baseTheme.textHead}`}>{getDisplayValue(currentInstallmentValue)}</span></div>{accumulatedInterest > 0 && !isDelayed && (<div className="flex justify-end items-center gap-1 text-xs text-rose-400 font-medium animate-pulse"><AlertTriangle size={12} />Inclui {getDisplayValue(accumulatedInterest)} de juros</div>)}</div><div className={`w-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-200'} rounded-full h-3 overflow-hidden border ${baseTheme.border}`}><div className={`h-full ${theme.primary} transition-all duration-500`} style={{ width: `${progress}%` }}></div></div><div className={`flex justify-between text-xs ${baseTheme.textMuted} font-mono`}><span>{inst.paidInstallments}/{inst.totalInstallments} Pagas</span><span className={isPrivacyMode ? 'blur-sm select-none' : ''}>Total: {getDisplayValue(inst.totalAmount)}</span></div>{!isFinished && (<div className="flex gap-2 mt-2"><button disabled={isPaidThisMonth || isDelayed} onClick={() => setDelayModal({ isOpen: true, installmentId: inst.id, installmentName: inst.description })} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-amber-500/20 text-amber-500 hover:bg-amber-500/10 disabled:opacity-30 disabled:cursor-not-allowed`}>Adiar</button>{isPaidThisMonth ? (<button disabled={isDelayed} onClick={() => setAnticipateModal({ isOpen: true, installment: inst })} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1`}><FastForward size={12} />Antecipar</button>) : (<button disabled={isDelayed} onClick={() => handlePayInstallment(inst)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border ${baseTheme.border} hover:bg-slate-200 dark:hover:bg-slate-800 ${baseTheme.text} disabled:opacity-30 disabled:cursor-not-allowed`}>Pagar</button>)}</div>)}</div>
                                </div>
                            );
                        })}</div>)}
                </div>
            )}

            {/* SUBSCRIPTIONS */}
            {activeTab === 'subscriptions' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center"><h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Assinaturas e Fixos</h2><button onClick={() => { setEditingSubscription(null); setIsSubModalOpen(true); }} className={`p-3 ${theme.primary} text-black rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subscriptions.filter(sub => !sub.archivedAt).map(sub => (
                            <div key={sub.id} className={`${baseTheme.card} border ${baseTheme.border} rounded-2xl p-5 flex flex-col justify-between ${baseTheme.cardHover} transition-all gap-4 group`}>
                                <div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className={`p-3 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} rounded-xl border ${baseTheme.border} ${baseTheme.textMuted}`}><Calendar size={20} /></div><div><h4 className={`font-bold ${baseTheme.textHead}`}>{sub.name}</h4><div className="flex items-center gap-2 mt-1"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryStyle(sub.category)}`}>{sub.category}</span><span className={`text-xs ${baseTheme.textMuted}`}>• Dia {sub.paymentDay}</span></div></div></div><p className={`font-bold ${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(sub.amount)}</p></div>
                                <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex gap-2 justify-end`}><button onClick={() => { setEditingSubscription(sub); setIsSubModalOpen(true); }} className={`p-2 rounded-lg text-slate-400 hover:text-black hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors border ${baseTheme.border}`}><Pencil size={14} /></button><button onClick={() => handleDelete(sub.id, 'Assinatura')} className={`p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border ${baseTheme.border}`}><Trash2 size={14} /></button></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GOALS */}
            {activeTab === 'goals' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center"><h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Metas Financeiras</h2><button onClick={() => setIsGoalModalOpen(true)} className={`p-3 ${theme.primary} text-black rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {goals.map(goal => {
                            const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                            return (
                                <div key={goal.id} className={`group ${baseTheme.card} border ${baseTheme.border} rounded-2xl p-6 shadow-lg ${baseTheme.cardHover} transition-all cursor-pointer`} onClick={() => setSelectedGoalId(goal.id)}>
                                    <div className="flex justify-between items-start mb-6"><div className={`p-3 rounded-xl ${theme.bgSoft} group-hover:scale-110 transition-transform`}><Target className={theme.text} size={24} /></div><button onClick={(e) => { e.stopPropagation(); handleDelete(goal.id, 'Meta'); }} className={`text-slate-500 hover:text-rose-400 p-2`}><Trash2 size={18} /></button></div>
                                    <h3 className={`text-xl font-bold ${baseTheme.textHead} mb-4`}>{goal.title}</h3>
                                    <div className={`flex justify-between items-center mb-4 ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50'} p-3 rounded-xl border ${baseTheme.border}`}><div><p className={`text-[10px] ${baseTheme.textMuted} uppercase tracking-wider font-bold`}>Alvo</p><p className={`${baseTheme.text} font-mono text-sm ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(goal.targetAmount)}</p></div><div className="text-right"><p className={`text-[10px] ${baseTheme.textMuted} uppercase tracking-wider font-bold`}>Restante</p><p className={`${baseTheme.textHead} font-mono text-sm ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(remaining)}</p></div></div>
                                    <div className="relative pt-2"><div className="flex justify-between text-xs font-bold mb-2"><span className={theme.text}>{percent.toFixed(0)}%</span><span className={`${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(goal.currentAmount)}</span></div><div className={`w-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-200'} rounded-full h-3 border ${baseTheme.border} overflow-hidden`}><div className={`h-full ${theme.primary} transition-all duration-700 ease-out`} style={{ width: `${percent}%` }}></div></div></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* INVESTMENTS */}
            {activeTab === 'investments' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center"><h2 className={`text-2xl font-bold ${baseTheme.textHead}`}>Carteira de Investimentos</h2><button onClick={() => setIsInvestModalOpen(true)} className={`p-3 ${theme.primary} text-black rounded-xl shadow-lg hover:opacity-90 transition-all`}><Plus size={20} /></button></div>
                    {investments.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                             <div className={`lg:col-span-2 ${baseTheme.card} border ${baseTheme.border} rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden`}>
                                 <div className={`absolute top-0 right-0 w-64 h-64 bg-${currentTheme}-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none`}></div>
                                 <div className="flex justify-between items-start mb-6 z-10"><div><h3 className={`text-lg font-bold ${baseTheme.textHead} flex items-center gap-2`}><AreaChartIcon className={`text-${currentTheme}-500`} size={20} />Evolução Patrimonial</h3><p className={`text-sm ${baseTheme.textMuted}`}>Crescimento acumulado dos aportes</p></div></div>
                                 <div className="h-[280px] w-full z-10">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.stroke} stopOpacity={0.3}/><stop offset="95%" stopColor={theme.stroke} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} vertical={false} opacity={0.3} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11}} /><YAxis hide domain={['dataMin', 'dataMax']} /><Tooltip content={<CustomChartTooltip isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} label="Saldo Acumulado" />} /><Area type="monotone" dataKey="value" stroke={theme.stroke} strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" /></AreaChart>
                                     </ResponsiveContainer>
                                 </div>
                             </div>
                             <div className={`${baseTheme.card} border ${baseTheme.border} rounded-3xl p-6 shadow-sm flex flex-col`}>
                                <h3 className={`text-base font-bold ${baseTheme.textHead} mb-2 flex items-center gap-2`}><PieChartIcon className={`text-${currentTheme}-500`} size={18} />Diversificação</h3>
                                <div className="flex-1 min-h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} cornerRadius={6} dataKey="value" stroke="none">{allocationData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip content={<CustomChartTooltip isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />} /></PieChart></ResponsiveContainer>
                                </div>
                             </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {investments.map(inv => {
                                const style = getInvestmentStyle(inv.type);
                                const Icon = style.icon;
                                return (
                                    <div key={inv.id} onClick={() => setSelectedInvestmentId(inv.id)} className={`${baseTheme.card} border ${baseTheme.border} rounded-2xl p-5 ${baseTheme.cardHover} transition-all flex items-center justify-between group cursor-pointer`}>
                                        <div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${style.bg}`}><Icon className={style.color} size={24} /></div><div><h4 className={`font-bold ${baseTheme.textHead}`}>{inv.name}</h4><p className={`text-xs ${baseTheme.textMuted} mb-1.5`}>{new Date(inv.date).toLocaleDateString()}</p><span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${style.badge}`}>{inv.type}</span></div></div>
                                        <div className="text-right"><p className={`text-lg font-bold ${baseTheme.textHead} ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(inv.amount)}</p><div className="flex items-center justify-end gap-2 mt-1"><button onClick={(e) => { e.stopPropagation(); handleDelete(inv.id, 'Investimento'); }} className="text-slate-500 hover:text-rose-400 text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button></div></div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className={`${baseTheme.card} border ${baseTheme.border} rounded-2xl p-6 h-fit`}>
                            <h3 className={`${baseTheme.textHead} font-bold mb-4`}>Resumo</h3>
                            <div className="space-y-4"><div className="flex justify-between text-sm"><span className={baseTheme.textMuted}>Total Investido</span><span className={`text-emerald-500 font-bold ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>{getDisplayValue(investments.reduce<number>((acc, i) => acc + Number(i.amount), 0))}</span></div><div className={`w-full h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div><div className={`text-xs ${baseTheme.textMuted} leading-relaxed`}>Clique em um investimento para aportar mais ou realizar um resgate.</div></div>
                        </div>
                    </div>
                </div>
            )}

            {/* UPDATES */}
            {activeTab === 'updates' && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8"><div className={`inline-flex p-4 rounded-2xl ${theme.bgSoft} mb-4 shadow-lg shadow-${currentTheme}-500/10`}><Rocket size={32} className="text-black" /></div><h2 className={`text-3xl font-bold ${baseTheme.textHead} mb-2`}>O que há de novo?</h2><p className={baseTheme.textMuted}>Acompanhe a evolução do seu gerenciador financeiro.</p></div>
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
                        {appUpdates.map((update, index) => (
                            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 ${isDarkMode ? 'border-slate-950 bg-slate-900' : 'border-slate-50 bg-white'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}><update.icon size={16} className={`text-${currentTheme}-500`} /></div>
                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ${baseTheme.card} border ${baseTheme.border} p-6 rounded-2xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]`}>
                                    <div className="flex items-center justify-between mb-2"><span className={`font-bold ${baseTheme.textHead}`}>{update.version}</span><time className={`font-mono text-xs ${baseTheme.textMuted}`}>{update.date}</time></div><h3 className={`text-lg font-bold mb-2 text-${currentTheme}-500`}>{update.title}</h3><p className={`text-sm ${baseTheme.text} mb-4 leading-relaxed`}>{update.description}</p>
                                    <ul className="space-y-2">{update.features.map((feature, i) => (<li key={i} className={`flex items-start gap-2 text-xs ${baseTheme.textMuted}`}><div className={`w-1.5 h-1.5 rounded-full bg-${currentTheme}-500 mt-1.5 shrink-0`}></div><span>{feature}</span></li>))}</ul>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={`text-center pt-8 pb-4 text-xs ${baseTheme.textMuted}`}><p>FinanFlow AI © {new Date().getFullYear()}</p></div>
                </div>
            )}
        </div>

      </main>

      {/* MODALS */}
      <AddTransactionModal isOpen={isTransModalOpen} onClose={() => setIsTransModalOpen(false)} onSave={async (t) => { const newT = { ...t, id: generateId() }; await saveData('transactions', newT); setIsTransModalOpen(false); }} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <AddInstallmentModal isOpen={isInstModalOpen} onClose={() => setIsInstModalOpen(false)} onSave={handleSaveInstallment} themeColor={currentTheme} isDarkMode={isDarkMode} userCustomCards={userCustomCards} />
      <AddGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSave={async (g) => { const newG = { ...g, id: generateId() }; await saveData('goals', newG); setIsGoalModalOpen(false); }} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <AddSubscriptionModal isOpen={isSubModalOpen} onClose={() => { setIsSubModalOpen(false); setEditingSubscription(null); }} onSave={handleSaveSubscription} initialData={editingSubscription} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <AddInvestmentModal isOpen={isInvestModalOpen} onClose={() => setIsInvestModalOpen(false)} onSave={handleAddInvestment} themeColor={currentTheme} isDarkMode={isDarkMode} />
      
      <GoalDetailsModal isOpen={!!selectedGoalId} onClose={() => setSelectedGoalId(null)} goal={selectedGoal} transactions={goalTransactions} onUpdateBalance={handleUpdateGoalBalance} onDeleteTransaction={(id) => deleteData('goal_transactions', id)} themeColor={currentTheme} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />
      <InvestmentDetailsModal isOpen={!!selectedInvestmentId} onClose={() => setSelectedInvestmentId(null)} investment={selectedInvestment} transactions={investmentTransactions} onUpdateBalance={handleUpdateInvestmentBalance} onDeleteTransaction={(id) => deleteData('investment_transactions', id)} themeColor={currentTheme} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />

      <FinancialReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} aiAnalysis={aiAnalysis} isAnalyzing={isAnalyzing} chartData={pieChartData} totalIncome={totalMonthlyIncome} totalExpense={totalMonthlyExpense} themeColor={currentTheme} isDarkMode={isDarkMode} isPrivacyMode={isPrivacyMode} />
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmDelete} onCancel={() => setConfirmState({ ...confirmState, isOpen: false })} isDarkMode={isDarkMode} />
      
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} currentName={userName} currentPhoto={userPhoto} onSave={handleProfileUpdate} onDeleteAccount={handleDeleteAccount} themeColor={currentTheme} currentTheme={currentTheme} onSelectTheme={setCurrentTheme} onToggleDarkMode={() => setIsDarkMode(prev => !prev)} isDarkMode={isDarkMode} />
      <ConfirmModal isOpen={isLogoutConfirmOpen} title="Sair da Conta" message="Você tem certeza que deseja sair do aplicativo?" onConfirm={confirmLogout} onCancel={() => setIsLogoutConfirmOpen(false)} isDarkMode={isDarkMode} confirmText="Sair" cancelText="Ficar" />

      <DelayInstallmentModal isOpen={delayModal.isOpen} onClose={() => setDelayModal({ ...delayModal, isOpen: false })} onConfirm={handleDelayInstallment} installmentName={delayModal.installmentName} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <PayAllModal isOpen={isPayAllModalOpen} onClose={() => setIsPayAllModalOpen(false)} onConfirm={handlePayAllInstallments} installments={installments} themeColor={currentTheme} isDarkMode={isDarkMode} />
      <AnticipateModal isOpen={anticipateModal.isOpen} onClose={() => setAnticipateModal({ isOpen: false, installment: null })} onConfirm={handleAnticipateInstallment} installment={anticipateModal.installment} themeColor={currentTheme} isDarkMode={isDarkMode} />

    </div>
  );
}

export default App;