import type { LinkRef } from './link';

export type PaymentMethod = 'Cash' | 'Card' | 'Bank transfer';
export type AccountType = 'Checking' | 'Savings' | 'Credit';
export type DebtType = 'Loan Given' | 'Loan Received' | 'Debt';

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
  accountType: AccountType;
  accountNumberMasked: string;
  currency: string;
  balance: number;
  cards: BankCard[];
  credentials: BankingCredentials;
  order: number;
  createdAt: string;
  updatedAt: string;
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
  status?: 'Open' | 'Partial' | 'Settled';
  amountRemaining?: number;
  notes?: string;
  links?: LinkRef[];
}
