import type { 
  BankAccount, Budget, Category, Expense, ExpenseDraft, ExpenseUpdate,
  BudgetDraft, BudgetUpdate, DebtLoan, DebtLoanDraft, DebtLoanUpdate 
} from '../types/finance';

export interface MonthSummary {
  month: string;
  totalSpent: number;
  totalIncome?: number;
  byCategory: { categoryId: string; spent: number; budget: number | null }[];
  accountBalances: { accountId: string; balance: number }[];
  overallBalance: number;
}

export interface FinanceService {
  // Bank Accounts
  getAccounts(): Promise<BankAccount[]>;
  getAccount(id: string): Promise<BankAccount>;
  createAccount(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount>;
  updateAccount(id: string, updates: Partial<Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BankAccount>;
  deleteAccount(id: string): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, 'id'>): Promise<Category>;
  updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense>;
  createExpense(draft: ExpenseDraft): Promise<Expense>;
  updateExpense(id: string, updates: ExpenseUpdate): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  getExpensesByMonth(month: string): Promise<Expense[]>;

  // Budgets
  getBudgets(): Promise<Budget[]>;
  getBudget(id: string): Promise<Budget>;
  createBudget(draft: BudgetDraft): Promise<Budget>;
  updateBudget(id: string, updates: BudgetUpdate): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;
  getBudgetsByMonth(month: string): Promise<Budget[]>;

  // Debt/Loans
  getDebtLoans(): Promise<DebtLoan[]>;
  getDebtLoan(id: string): Promise<DebtLoan>;
  createDebtLoan(draft: DebtLoanDraft): Promise<DebtLoan>;
  updateDebtLoan(id: string, updates: DebtLoanUpdate): Promise<DebtLoan>;
  deleteDebtLoan(id: string): Promise<void>;

  // Summary
  getMonthSummary(month: string): Promise<MonthSummary>;
  getOverallBalance(): Promise<number>;
}
