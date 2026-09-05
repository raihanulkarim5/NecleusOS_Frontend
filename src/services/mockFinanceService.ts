import type { FinanceService, MonthSummary } from './financeService';
import type { 
  BankAccount, Expense, Budget, Category, DebtLoan,
  ExpenseDraft, ExpenseUpdate, BudgetDraft, BudgetUpdate,
  DebtLoanDraft, DebtLoanUpdate 
} from '../types/finance';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => new Date().toISOString().slice(0, 7);

const defaultCategories: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', colorHex: '#ff6b6b' },
  { id: 'cat-transport', name: 'Transport', colorHex: '#4ecdc4' },
  { id: 'cat-utilities', name: 'Utilities', colorHex: '#45b7d1' },
  { id: 'cat-entertainment', name: 'Entertainment', colorHex: '#f9ca24' },
  { id: 'cat-health', name: 'Health & Medical', colorHex: '#6c5ce7' },
  { id: 'cat-shopping', name: 'Shopping', colorHex: '#fd79a8' },
  { id: 'cat-other', name: 'Other', colorHex: '#a29bfe' },
];

let bankAccounts: BankAccount[] = [
  {
    id: 'acc-1',
    bankName: 'First Bank',
    accountType: 'Checking',
    accountNumberMasked: '****2891',
    currency: 'USD',
    balance: 5420.75,
    cards: [],
    credentials: {
      encryptedPassword: '[ENCRYPTED]',
      encryptedPin: '[ENCRYPTED]',
      lastVerified: today(),
    },
    order: 0,
    createdAt: '2026-01-15',
    updatedAt: today(),
  },
  {
    id: 'acc-2',
    bankName: 'Savings Bank',
    accountType: 'Savings',
    accountNumberMasked: '****7654',
    currency: 'USD',
    balance: 25800.00,
    cards: [],
    credentials: {
      encryptedPassword: '[ENCRYPTED]',
      encryptedPin: '[ENCRYPTED]',
      lastVerified: today(),
    },
    order: 1,
    createdAt: '2026-02-01',
    updatedAt: today(),
  },
];

let expenses: Expense[] = [
  {
    id: 'exp-1',
    amount: 45.50,
    date: today(),
    categoryId: 'cat-food',
    bankAccountId: 'acc-1',
    paymentMethod: 'Card',
    note: 'Grocery shopping',
    links: [],
    order: 0,
    createdAt: today(),
    updatedAt: today(),
  },
  {
    id: 'exp-2',
    amount: 120.00,
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    categoryId: 'cat-transport',
    bankAccountId: 'acc-1',
    paymentMethod: 'Card',
    note: 'Uber rides this week',
    links: [],
    order: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    updatedAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  },
  {
    id: 'exp-3',
    amount: 89.99,
    date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
    categoryId: 'cat-entertainment',
    bankAccountId: 'acc-1',
    paymentMethod: 'Cash',
    note: 'Movie and dinner',
    links: [],
    order: 2,
    createdAt: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
    updatedAt: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
  },
];

let budgets: Budget[] = [
  {
    id: 'bud-1',
    categoryId: 'cat-food',
    monthlyLimit: 500.00,
    month: thisMonth(),
    order: 0,
    createdAt: thisMonth() + '-01',
    updatedAt: today(),
  },
  {
    id: 'bud-2',
    categoryId: 'cat-transport',
    monthlyLimit: 300.00,
    month: thisMonth(),
    order: 1,
    createdAt: thisMonth() + '-01',
    updatedAt: today(),
  },
  {
    id: 'bud-3',
    categoryId: 'cat-entertainment',
    monthlyLimit: 200.00,
    month: thisMonth(),
    order: 2,
    createdAt: thisMonth() + '-01',
    updatedAt: today(),
  },
];

let debtsLoans: DebtLoan[] = [
  {
    id: 'debt-1',
    type: 'Loan Given',
    amount: 500.00,
    personName: 'Alex Johnson',
    personPhone: '+1-555-0101',
    personEmail: 'alex@example.com',
    purpose: 'Emergency fund',
    date: '2026-08-10',
    dueDate: '2026-09-10',
    status: 'Open',
    amountRemaining: 500.00,
    notes: 'Personal loan, monthly repayment',
    links: [],
    order: 0,
    createdAt: '2026-08-10',
    updatedAt: today(),
  },
  {
    id: 'debt-2',
    type: 'Debt',
    amount: 1200.00,
    personName: 'Credit Card Company',
    personPhone: '+1-800-0202',
    purpose: 'Monthly charge',
    date: '2026-08-01',
    status: 'Partial',
    amountRemaining: 800.00,
    notes: 'Credit card balance, paying off monthly',
    links: [],
    order: 1,
    createdAt: '2026-08-01',
    updatedAt: today(),
  },
  {
    id: 'debt-3',
    type: 'Loan Received',
    amount: 2000.00,
    personName: 'Mom',
    personPhone: '+1-555-0303',
    purpose: 'House renovation',
    date: '2026-07-15',
    dueDate: '2026-10-15',
    status: 'Open',
    amountRemaining: 2000.00,
    notes: 'Family loan, interest-free, 3-month repayment',
    links: [],
    order: 2,
    createdAt: '2026-07-15',
    updatedAt: today(),
  },
];

let categories: Category[] = [...defaultCategories];

export const mockFinanceService: FinanceService = {
  async getAccounts() {
    await delay(400);
    return [...bankAccounts].sort((a, b) => a.order - b.order);
  },

  async getAccount(id: string) {
    await delay(200);
    const acc = bankAccounts.find(a => a.id === id);
    if (!acc) throw new Error('Account not found');
    return { ...acc };
  },

  async createAccount(account) {
    await delay(400);
    const newAcc: BankAccount = {
      ...account,
      id: `acc-${Date.now()}`,
      createdAt: today(),
      updatedAt: today(),
    };
    bankAccounts.push(newAcc);
    return newAcc;
  },

  async updateAccount(id, updates) {
    await delay(300);
    const idx = bankAccounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Account not found');
    const updated = { ...bankAccounts[idx], ...updates, id, createdAt: bankAccounts[idx].createdAt, updatedAt: today() };
    bankAccounts[idx] = updated;
    return { ...updated };
  },

  async deleteAccount(id) {
    await delay(300);
    bankAccounts = bankAccounts.filter(a => a.id !== id);
  },

  async getCategories() {
    await delay(200);
    return [...categories];
  },

  async createCategory(category) {
    await delay(200);
    const newCat: Category = { ...category, id: `cat-${Date.now()}` };
    categories.push(newCat);
    return newCat;
  },

  async updateCategory(id, updates) {
    await delay(200);
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    categories[idx] = { ...categories[idx], ...updates, id };
    return { ...categories[idx] };
  },

  async deleteCategory(id) {
    await delay(200);
    categories = categories.filter(c => c.id !== id);
  },

  async getExpenses() {
    await delay(400);
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getExpense(id) {
    await delay(200);
    const exp = expenses.find(e => e.id === id);
    if (!exp) throw new Error('Expense not found');
    return { ...exp };
  },

  async createExpense(draft) {
    await delay(400);
    const newExp: Expense = {
      ...draft,
      id: `exp-${Date.now()}`,
      links: [],
      order: expenses.length,
      createdAt: today(),
      updatedAt: today(),
    };
    expenses.push(newExp);
    return newExp;
  },

  async updateExpense(id, updates) {
    await delay(300);
    const idx = expenses.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Expense not found');
    const updated = { ...expenses[idx], ...updates, id, createdAt: expenses[idx].createdAt, updatedAt: today() };
    expenses[idx] = updated;
    return { ...updated };
  },

  async deleteExpense(id) {
    await delay(300);
    expenses = expenses.filter(e => e.id !== id);
  },

  async getExpensesByMonth(month) {
    await delay(300);
    return expenses.filter(e => e.date.startsWith(month)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getBudgets() {
    await delay(400);
    return [...budgets].sort((a, b) => a.order - b.order);
  },

  async getBudget(id) {
    await delay(200);
    const bud = budgets.find(b => b.id === id);
    if (!bud) throw new Error('Budget not found');
    return { ...bud };
  },

  async createBudget(draft) {
    await delay(400);
    const newBud: Budget = {
      ...draft,
      id: `bud-${Date.now()}`,
      order: budgets.length,
      createdAt: today(),
      updatedAt: today(),
    };
    budgets.push(newBud);
    return newBud;
  },

  async updateBudget(id, updates) {
    await delay(300);
    const idx = budgets.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Budget not found');
    const updated = { ...budgets[idx], ...updates, id, createdAt: budgets[idx].createdAt, updatedAt: today() };
    budgets[idx] = updated;
    return { ...updated };
  },

  async deleteBudget(id) {
    await delay(300);
    budgets = budgets.filter(b => b.id !== id);
  },

  async getBudgetsByMonth(month) {
    await delay(300);
    return budgets.filter(b => b.month === month).sort((a, b) => a.order - b.order);
  },

  async getDebtLoans() {
    await delay(400);
    return [...debtsLoans].sort((a, b) => a.order - b.order);
  },

  async getDebtLoan(id) {
    await delay(200);
    const dl = debtsLoans.find(d => d.id === id);
    if (!dl) throw new Error('Debt/Loan not found');
    return { ...dl };
  },

  async createDebtLoan(draft) {
    await delay(400);
    const newDL: DebtLoan = {
      ...draft,
      id: `debt-${Date.now()}`,
      links: [],
      order: debtsLoans.length,
      createdAt: today(),
      updatedAt: today(),
    };
    debtsLoans.push(newDL);
    return newDL;
  },

  async updateDebtLoan(id, updates) {
    await delay(300);
    const idx = debtsLoans.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Debt/Loan not found');
    const updated = { ...debtsLoans[idx], ...updates, id, createdAt: debtsLoans[idx].createdAt, updatedAt: today() };
    debtsLoans[idx] = updated;
    return { ...updated };
  },

  async deleteDebtLoan(id) {
    await delay(300);
    debtsLoans = debtsLoans.filter(d => d.id !== id);
  },

  async getMonthSummary(month) {
    await delay(500);
    const monthExp = await this.getExpensesByMonth(month);
    const monthBudgets = await this.getBudgetsByMonth(month);
    const totalSpent = monthExp.reduce((sum, e) => sum + e.amount, 0);
    
    const byCategory: MonthSummary['byCategory'] = [];
    for (const cat of categories) {
      const spent = monthExp.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
      const budget = monthBudgets.find(b => b.categoryId === cat.id)?.monthlyLimit ?? null;
      if (spent > 0 || budget !== null) {
        byCategory.push({ categoryId: cat.id, spent, budget });
      }
    }

    const accountBalances = bankAccounts.map(a => ({ accountId: a.id, balance: a.balance }));
    const overallBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);

    return {
      month,
      totalSpent,
      byCategory,
      accountBalances,
      overallBalance,
    };
  },

  async getOverallBalance() {
    await delay(200);
    return bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  },
};
