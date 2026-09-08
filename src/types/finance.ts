import type { LinkRef } from './link';

export type PaymentMethod = 'Cash' | 'Card' | 'Bank transfer';
export type AccountType = 'Checking' | 'Savings' | 'Credit';
// Only two directions matter: money I lent out (they owe me), or money I
// owe (whether it's a loan I took or an ordinary debt like a credit card) —
// "Loan Received" and "Debt" were the same thing from my side, so they're
// merged into a single "Debt" type.
export type DebtType = 'Loan Given' | 'Debt';

export interface Category {
  id: string;
  name: string;
  colorHex: string;
}

// Banking Info (Two-Factor: encrypted password + PIN required)
export interface BankingCredentials {
  encryptedPassword: string; // Encrypted on server, never transmitted
  encryptedPin: string;      // Encrypted on server, never transmitted
  lastVerified: string;      // ISO date
}

export interface BankCard {
  id: string;
  cardNumber: string;        // Masked: ****1234
  cardholderName: string;
  expiryMonth: number;       // 1-12
  expiryYear: number;        // 2026+
  cvv: string;               // Encrypted
  isDefault: boolean;
  credentials: BankingCredentials;
}

export interface BankAccount {
  id: string;
  bankName: string;
  branch: string;
  accountType: AccountType;
  accountNumberMasked: string;
  currency: string;
  balance: number;
  notes: string;
  otpEmailEnabled: boolean;
  otpMobileEnabled: boolean;
  cards: BankCard[];
  credentials: BankingCredentials;
  balanceHistory: BalanceEntry[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceEntry {
  id: string;
  date: string;      // YYYY-MM-DD
  amount: number;     // positive = deposit, negative = withdrawal
  note: string;
  createdAt: string;
}

export interface BankAccountDraft {
  bankName: string;
  branch: string;
  accountType: AccountType;
  accountNumberLast4: string;
  currency: string;
  balance: number;
  notes: string;
}

export interface BankAccountUpdate {
  bankName?: string;
  branch?: string;
  accountType?: AccountType;
  currency?: string;
  balance?: number;
  notes?: string;
  otpEmailEnabled?: boolean;
  otpMobileEnabled?: boolean;
}

export interface CredentialsUpdate {
  newPassword: string;
  newPin: string;
}

export interface BankCardDraft {
  cardNumberLast4: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  isDefault: boolean;
}

export interface BankCardUpdate {
  cardholderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  categoryId: string;
  bankAccountId: string | null;
  paymentMethod: PaymentMethod;
  note: string;
  links: LinkRef[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseDraft {
  amount: number;
  date: string;
  categoryId: string;
  bankAccountId: string | null;
  paymentMethod: PaymentMethod;
  note: string;
}

export interface ExpenseUpdate {
  amount?: number;
  date?: string;
  categoryId?: string;
  bankAccountId?: string | null;
  paymentMethod?: PaymentMethod;
  note?: string;
  links?: LinkRef[];
}

// Monthly Budget (Generic category-based)
export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  month: string;             // YYYY-MM
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetDraft {
  categoryId: string;
  monthlyLimit: number;
  month: string;
}

export interface BudgetUpdate {
  monthlyLimit?: number;
  categoryId?: string;
}

// Debt/Loan Tracking (with person info)
export interface DebtLoan {
  id: string;
  type: DebtType;            // Loan Given, Loan Received, Debt
  amount: number;
  personName: string;
  personPhone?: string;
  personEmail?: string;
  personAddress?: string;
  purpose: string;
  date: string;              // Date loan/debt created
  dueDate?: string;           // Expected repayment date
  paidDate?: string;          // Actual payment date
  status: 'Open' | 'Partial' | 'Settled';
  amountRemaining: number;
  notes: string;
  links: LinkRef[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DebtLoanDraft {
  type: DebtType;
  amount: number;
  personName: string;
  personPhone?: string;
  personEmail?: string;
  personAddress?: string;
  purpose: string;
  date: string;
  dueDate?: string;
  status: 'Open' | 'Partial' | 'Settled';
  amountRemaining: number;
  notes: string;
}

export interface DebtLoanUpdate {
  amount?: number;
  personName?: string;
  personPhone?: string;
  personEmail?: string;
  personAddress?: string;
  purpose?: string;
  dueDate?: string;
  paidDate?: string;
  status?: 'Open' | 'Partial' | 'Settled';
  amountRemaining?: number;
  notes?: string;
  links?: LinkRef[];
}

// Future Budget Plans — for a specific asset, business, or long-term goal
// (distinct from monthly category budgets above)
export type BudgetPlanType = string; // free text, e.g. Asset/Business/Goal/Other or user-defined

export const DEFAULT_PLAN_TYPES: BudgetPlanType[] = ['Asset', 'Business', 'Goal', 'Other'];

export interface BudgetPlan {
  id: string;
  name: string;
  planType: BudgetPlanType;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  notes: string;
  links: LinkRef[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetPlanDraft {
  name: string;
  planType: BudgetPlanType;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  notes: string;
}

export interface BudgetPlanUpdate {
  name?: string;
  planType?: BudgetPlanType;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  notes?: string;
}

// People referenced by Debts/Loans — kept lightweight and reusable
// across multiple debt/loan records for the same person.
export interface Person {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface PersonDraft {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}
