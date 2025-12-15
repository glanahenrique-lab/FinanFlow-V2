
export type TransactionType = 'income' | 'expense';

export interface UserPreferences {
  theme: string;
  isDarkMode: boolean;
  isPrivacyMode: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photo: string | null; // Base64 string or URL
  createdAt?: string;
  preferences?: UserPreferences;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  category: string;
  type: TransactionType;
}

export interface InstallmentPurchase {
  id: string;
  description: string;
  totalAmount: number;
  purchaseDate: string; // ISO string
  totalInstallments: number;
  paidInstallments: number; // Manually updated or calculated
  accumulatedInterest?: number; // Juros acumulados
  lastPaymentDate?: string; // ISO string - Data do último pagamento realizado
  delayedMonths?: string[]; // Array de Strings "MM-YYYY" - Meses que foram pulados/adiados
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO string (Optional)
}

export interface GoalTransaction {
  id: string;
  goalId: string;
  amount: number;
  date: string; // ISO string
  type: 'deposit' | 'withdraw';
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO string
  type: string; // 'Renda Fixa', 'Ações', 'FIIs', 'Cripto', etc.
}

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  amount: number;
  date: string; // ISO string
  type: 'buy' | 'sell'; // buy = aporte (entrada no inv), sell = resgate (saída do inv)
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  paymentDay: number; // 1-31
  category: string;
  createdAt?: string; // ISO String - Data de criação/início da vigência
  archivedAt?: string | null; // ISO String - Data de cancelamento/edição (fim da vigência)
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  totalInstallmentsPending: number;
  balance: number;
}