import type { BankAccount, Budget, Category, Expense, ExpenseDraft } from '../types/finance';

export interface MonthSummary {
  totalSpent: number;
  byCategory: { categoryId: string; spent: number; budget: number | null }[];
}

export interface FinanceService {
  getAccounts(): Promise<BankAccount[]>;
  getCategories(): Promise<Category[]>;
  getExpenses(): Promise<Expense[]>;
  getBudgets(): Promise<Budget[]>;
  getMonthSummary(): Promise<MonthSummary>;
  createExpense(draft: ExpenseDraft): Promise<Expense>;
}
