import type { LinkRef } from './link';

export type PaymentMethod = 'Cash' | 'Card' | 'Bank transfer';
export type AccountType = 'Checking' | 'Savings' | 'Credit';

export interface Category {
  id: string;
  name: string;
  colorHex: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumberMasked: string; // real number is encrypted server-side; UI only ever sees a masked form
  currency: string;
  balance: number;
  type: AccountType;
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
  createdAt: string;
}

export interface ExpenseDraft {
  amount: number;
  date: string;
  categoryId: string;
  bankAccountId: string | null;
  paymentMethod: PaymentMethod;
  note: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
}
