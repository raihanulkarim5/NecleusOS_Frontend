import type { FinanceService, MonthSummary } from './financeService';
import type { BankAccount, Budget, Category, Expense, ExpenseDraft } from '../types/finance';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => today().slice(0, 7);

const categories: Category[] = [
  { id: 'cat-food', name: 'Food', colorHex: '#38BDF8' },
  { id: 'cat-rent', name: 'Rent', colorHex: '#D946A8' },
  { id: 'cat-transport', name: 'Transport', colorHex: '#8B5CF6' },
  { id: 'cat-utilities', name: 'Utilities', colorHex: '#F2C94C' },
  { id: 'cat-income', name: 'Income', colorHex: '#6FCF7C' },
  { id: 'cat-other', name: 'Other', colorHex: '#9CA3C7' },
];

// The account number below is a display-only mock — in the real system,
// the raw number is AES-256 encrypted at the field level via an EF Core
// value converter and never reaches the frontend unmasked.
const accounts: BankAccount[] = [
  { id: 'acc1', bankName: 'City Bank', accountNumberMasked: '•••• 4821', currency: 'BDT', balance: 84250, type: 'Checking' },
  { id: 'acc2', bankName: 'Brac Bank', accountNumberMasked: '•••• 1093', currency: 'BDT', balance: 152400, type: 'Savings' },
];

const budgets: Budget[] = [
  { id: 'b1', categoryId: 'cat-food', monthlyLimit: 12000, month: thisMonth() },
  { id: 'b2', categoryId: 'cat-transport', monthlyLimit: 4000, month: thisMonth() },
  { id: 'b3', categoryId: 'cat-utilities', monthlyLimit: 6000, month: thisMonth() },
];

let expenses: Expense[] = [
  { id: 'ex1', amount: 450, date: today(), categoryId: 'cat-food', bankAccountId: 'acc1', paymentMethod: 'Card', note: 'Coffee and lunch', links: [], createdAt: today() },
  { id: 'ex2', amount: 65000, date: '2026-08-01', categoryId: 'cat-rent', bankAccountId: 'acc1', paymentMethod: 'Bank transfer', note: 'Monthly rent', links: [], createdAt: '2026-08-01' },
  { id: 'ex3', amount: 1200, date: '2026-08-05', categoryId: 'cat-transport', bankAccountId: 'acc1', paymentMethod: 'Card', note: 'Ride share, week 1', links: [], createdAt: '2026-08-05' },
  { id: 'ex4', amount: 3200, date: '2026-08-10', categoryId: 'cat-utilities', bankAccountId: 'acc2', paymentMethod: 'Bank transfer', note: 'Electricity + internet', links: [], createdAt: '2026-08-10' },
  { id: 'ex5', amount: 3800, date: '2026-08-12', categoryId: 'cat-food', bankAccountId: 'acc1', paymentMethod: 'Cash', note: 'Groceries', links: [], createdAt: '2026-08-12' },
  { id: 'ex6', amount: 45000, date: '2026-08-15', categoryId: 'cat-income', bankAccountId: 'acc2', paymentMethod: 'Bank transfer', note: 'Freelance payment', links: [], createdAt: '2026-08-15' },
];

export const mockFinanceService: FinanceService = {
  async getAccounts(): Promise<BankAccount[]> {
    await delay(350);
    return accounts;
  },

  async getCategories(): Promise<Category[]> {
    await delay(200);
    return categories;
  },

  async getExpenses(): Promise<Expense[]> {
    await delay(400);
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getBudgets(): Promise<Budget[]> {
    await delay(250);
    return budgets;
  },

  async getMonthSummary(): Promise<MonthSummary> {
    await delay(400);
    const month = thisMonth();
    const monthExpenses = expenses.filter((e) => e.date.startsWith(month) && e.categoryId !== 'cat-income');
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = categories
      .filter((c) => c.id !== 'cat-income')
      .map((c) => {
        const spent = monthExpenses.filter((e) => e.categoryId === c.id).reduce((sum, e) => sum + e.amount, 0);
        const budget = budgets.find((b) => b.categoryId === c.id)?.monthlyLimit ?? null;
        return { categoryId: c.id, spent, budget };
      })
      .filter((c) => c.spent > 0 || c.budget !== null);

    return { totalSpent, byCategory };
  },

  async createExpense(draft: ExpenseDraft): Promise<Expense> {
    await delay(400);
    const expense: Expense = { id: `ex${Date.now()}`, ...draft, links: [], createdAt: today() };
    expenses = [expense, ...expenses];
    return expense;
  },
};

export { categories as mockCategories, accounts as mockAccounts };
