import type { 
  BankAccount, BankAccountDraft, BankAccountUpdate, BankCard, BankCardDraft, BankCardUpdate, CredentialsUpdate,
  Budget, Category, Expense, ExpenseDraft, ExpenseUpdate,
  BudgetDraft, BudgetUpdate, DebtLoan, DebtLoanDraft, DebtLoanUpdate,
  BudgetPlan, BudgetPlanDraft, BudgetPlanUpdate,
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
  createAccount(draft: BankAccountDraft): Promise<BankAccount>;
  updateAccount(id: string, updates: BankAccountUpdate): Promise<BankAccount>;
  deleteAccount(id: string): Promise<void>;
  updateAccountCredentials(id: string, updates: CredentialsUpdate): Promise<BankAccount>;

  // Bank Cards (nested under an account)
  addCard(accountId: string, draft: BankCardDraft): Promise<BankAccount>;
  updateCard(accountId: string, cardId: string, updates: BankCardUpdate): Promise<BankAccount>;
  deleteCard(accountId: string, cardId: string): Promise<BankAccount>;

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

  // Budgets (monthly, generic by category)
  getBudgets(): Promise<Budget[]>;
  getBudget(id: string): Promise<Budget>;
  createBudget(draft: BudgetDraft): Promise<Budget>;
  updateBudget(id: string, updates: BudgetUpdate): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;
  getBudgetsByMonth(month: string): Promise<Budget[]>;

  // Budget Plans (future plans for assets / business / goals)
  getBudgetPlans(): Promise<BudgetPlan[]>;
  getBudgetPlan(id: string): Promise<BudgetPlan>;
  createBudgetPlan(draft: BudgetPlanDraft): Promise<BudgetPlan>;
  updateBudgetPlan(id: string, updates: BudgetPlanUpdate): Promise<BudgetPlan>;
  deleteBudgetPlan(id: string): Promise<void>;

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
