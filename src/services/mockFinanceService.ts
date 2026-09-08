import type { FinanceService, MonthSummary } from './financeService';
import type { 
  BankAccount, BankAccountDraft, BankAccountUpdate, BankCardDraft, BankCardUpdate, CredentialsUpdate,
  Expense, Budget, Category, DebtLoan, BudgetPlan, BudgetPlanDraft, BudgetPlanUpdate,
  ExpenseDraft, ExpenseUpdate, BudgetDraft, BudgetUpdate,
  DebtLoanDraft, DebtLoanUpdate, Person, PersonDraft,
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
    branch: 'Gulshan Branch',
    accountType: 'Checking',
    accountNumberMasked: '****2891',
    currency: 'BDT',
    balance: 5420.75,
    notes: 'Primary checking account',
    otpEmailEnabled: true,
    otpMobileEnabled: false,
    cards: [
      {
        id: 'card-1',
        cardNumber: '**** **** **** 4432',
        cardholderName: 'Raihanul Karim',
        expiryMonth: 8,
        expiryYear: 2028,
        cvv: '***',
        isDefault: true,
        credentials: { encryptedPassword: '[ENCRYPTED]', encryptedPin: '[ENCRYPTED]', lastVerified: today() },
      },
    ],
    credentials: {
      encryptedPassword: '[ENCRYPTED]',
      encryptedPin: '[ENCRYPTED]',
      lastVerified: today(),
    },
    balanceHistory: [
      { id: 'bal-1', date: today(), amount: 5420.75, note: 'Opening balance', createdAt: today() },
    ],
    order: 0,
    createdAt: '2026-01-15',
    updatedAt: today(),
  },
  {
    id: 'acc-2',
    bankName: 'Savings Bank',
    branch: 'Dhanmondi Branch',
    accountType: 'Savings',
    accountNumberMasked: '****7654',
    currency: 'BDT',
    balance: 25800.00,
    notes: 'Long-term savings',
    otpEmailEnabled: true,
    otpMobileEnabled: true,
    cards: [],
    credentials: {
      encryptedPassword: '[ENCRYPTED]',
      encryptedPin: '[ENCRYPTED]',
      lastVerified: today(),
    },
    balanceHistory: [
      { id: 'bal-2', date: today(), amount: 25800.00, note: 'Opening balance', createdAt: today() },
    ],
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
  { id: 'bud-1', categoryId: 'cat-food', monthlyLimit: 500.00, month: thisMonth(), order: 0, createdAt: thisMonth() + '-01', updatedAt: today() },
  { id: 'bud-2', categoryId: 'cat-transport', monthlyLimit: 300.00, month: thisMonth(), order: 1, createdAt: thisMonth() + '-01', updatedAt: today() },
  { id: 'bud-3', categoryId: 'cat-entertainment', monthlyLimit: 200.00, month: thisMonth(), order: 2, createdAt: thisMonth() + '-01', updatedAt: today() },
];

let budgetPlans: BudgetPlan[] = [
  {
    id: 'plan-1',
    name: 'New laptop (business)',
    planType: 'Business',
    targetAmount: 2200,
    currentAmount: 650,
    targetDate: '2026-12-01',
    notes: 'Upgrade dev machine for NecleusOS work',
    links: [],
    order: 0,
    createdAt: '2026-07-01',
    updatedAt: today(),
  },
  {
    id: 'plan-2',
    name: 'Emergency fund',
    planType: 'Goal',
    targetAmount: 10000,
    currentAmount: 4200,
    notes: '6 months of expenses buffer',
    links: [],
    order: 1,
    createdAt: '2026-05-01',
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
    type: 'Debt',
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
  {
    id: 'debt-4',
    type: 'Loan Given',
    amount: 300.00,
    personName: 'Alex Johnson',
    personPhone: '+1-555-0101',
    personEmail: 'alex@example.com',
    purpose: 'Lunch money',
    date: '2026-08-05',
    dueDate: '2026-08-15',
    paidDate: '2026-08-15',
    status: 'Settled',
    amountRemaining: 0.00,
    notes: 'Previous loan, settled on time',
    links: [],
    order: 3,
    createdAt: '2026-08-05',
    updatedAt: '2026-08-15',
  },
];

let categories: Category[] = [...defaultCategories];

let persons: Person[] = [
  { id: 'person-1', name: 'Alex Johnson', phone: '+1-555-0101', email: 'alex@example.com' },
  { id: 'person-2', name: 'Credit Card Company', phone: '+1-800-0202' },
  { id: 'person-3', name: 'Mom', phone: '+1-555-0303' },
];

// Simulates encrypted-at-rest storage. The public BankAccount.credentials
// fields only ever show "[ENCRYPTED]" / "[NOT SET]" — the real values live
// here and are only returned by revealAccountCredentials(), which the UI
// only calls after its own client-side authentication step (OTP).
const credentialVault: Record<string, { password: string; pin: string }> = {
  'acc-1': { password: 'SecurePass123', pin: '4821' },
  'acc-2': { password: 'SavingsKey456', pin: '7390' },
};

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

  async createAccount(draft: BankAccountDraft) {
    await delay(400);
    const newAcc: BankAccount = {
      bankName: draft.bankName,
      branch: draft.branch,
      accountType: draft.accountType,
      accountNumberMasked: `****${draft.accountNumberLast4.slice(-4)}`,
      currency: draft.currency,
      balance: draft.balance,
      notes: draft.notes,
      otpEmailEnabled: false,
      otpMobileEnabled: false,
      cards: [],
      credentials: {
        encryptedPassword: '[NOT SET]',
        encryptedPin: '[NOT SET]',
        lastVerified: today(),
      },
      balanceHistory: draft.balance !== 0
        ? [{ id: `bal-${Date.now()}`, date: today(), amount: draft.balance, note: 'Opening balance', createdAt: today() }]
        : [],
      id: `acc-${Date.now()}`,
      order: bankAccounts.length,
      createdAt: today(),
      updatedAt: today(),
    };
    bankAccounts.push(newAcc);
    return newAcc;
  },

  async updateAccount(id: string, updates: BankAccountUpdate) {
    await delay(300);
    const idx = bankAccounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Account not found');
    const updated = { ...bankAccounts[idx], ...updates, id, createdAt: bankAccounts[idx].createdAt, updatedAt: today() };
    bankAccounts[idx] = updated;
    return { ...updated };
  },

  async deleteAccount(id: string) {
    await delay(300);
    bankAccounts = bankAccounts.filter(a => a.id !== id);
    delete credentialVault[id];
  },

  async updateAccountCredentials(id: string, updates: CredentialsUpdate) {
    await delay(400);
    const idx = bankAccounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Account not found');
    // The real value is what gets "encrypted and stored" (here: kept in the vault) so
    // it can be retrieved later if forgotten. The account record itself never carries
    // the plaintext — only a placeholder confirming something is on file.
    credentialVault[id] = { password: updates.newPassword, pin: updates.newPin };
    bankAccounts[idx] = {
      ...bankAccounts[idx],
      credentials: {
        encryptedPassword: '[ENCRYPTED]',
        encryptedPin: '[ENCRYPTED]',
        lastVerified: today(),
      },
      updatedAt: today(),
    };
    return { ...bankAccounts[idx] };
  },

  async revealAccountCredentials(id: string) {
    await delay(400);
    const stored = credentialVault[id];
    if (!stored) throw new Error('No password/PIN saved for this account yet.');
    return { ...stored };
  },

  async addBalanceEntry(id: string, entry: { date: string; amount: number; note: string }) {
    await delay(350);
    const idx = bankAccounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Account not found');
    const newEntry = { id: `bal-${Date.now()}`, ...entry, createdAt: today() };
    bankAccounts[idx] = {
      ...bankAccounts[idx],
      balance: bankAccounts[idx].balance + entry.amount,
      balanceHistory: [...bankAccounts[idx].balanceHistory, newEntry],
      updatedAt: today(),
    };
    return { ...bankAccounts[idx] };
  },

  async getBalanceHistoryByMonth(id: string, month: string) {
    await delay(250);
    const acc = bankAccounts.find(a => a.id === id);
    if (!acc) throw new Error('Account not found');
    return acc.balanceHistory.filter(b => b.date.startsWith(month)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getPersons() {
    await delay(200);
    return [...persons];
  },

  async createPerson(draft: PersonDraft) {
    await delay(250);
    const newPerson: Person = { id: `person-${Date.now()}`, ...draft };
    persons.push(newPerson);
    return newPerson;
  },

  async addCard(accountId: string, draft: BankCardDraft) {
    await delay(350);
    const idx = bankAccounts.findIndex(a => a.id === accountId);
    if (idx === -1) throw new Error('Account not found');
    const newCard = {
      id: `card-${Date.now()}`,
      cardNumber: `**** **** **** ${draft.cardNumberLast4.slice(-4)}`,
      cardholderName: draft.cardholderName,
      expiryMonth: draft.expiryMonth,
      expiryYear: draft.expiryYear,
      cvv: '***',
      isDefault: draft.isDefault,
      credentials: { encryptedPassword: '[N/A]', encryptedPin: '[N/A]', lastVerified: today() },
    };
    const cards = draft.isDefault
      ? bankAccounts[idx].cards.map(c => ({ ...c, isDefault: false }))
      : [...bankAccounts[idx].cards];
    bankAccounts[idx] = { ...bankAccounts[idx], cards: [...cards, newCard], updatedAt: today() };
    return { ...bankAccounts[idx] };
  },

  async updateCard(accountId: string, cardId: string, updates: BankCardUpdate) {
    await delay(300);
    const idx = bankAccounts.findIndex(a => a.id === accountId);
    if (idx === -1) throw new Error('Account not found');
    let cards = bankAccounts[idx].cards.map(c => c.id === cardId ? { ...c, ...updates } : c);
    if (updates.isDefault) {
      cards = cards.map(c => c.id === cardId ? c : { ...c, isDefault: false });
    }
    bankAccounts[idx] = { ...bankAccounts[idx], cards, updatedAt: today() };
    return { ...bankAccounts[idx] };
  },

  async deleteCard(accountId: string, cardId: string) {
    await delay(300);
    const idx = bankAccounts.findIndex(a => a.id === accountId);
    if (idx === -1) throw new Error('Account not found');
    bankAccounts[idx] = { ...bankAccounts[idx], cards: bankAccounts[idx].cards.filter(c => c.id !== cardId), updatedAt: today() };
    return { ...bankAccounts[idx] };
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

  async getBudgetPlans() {
    await delay(350);
    return [...budgetPlans].sort((a, b) => a.order - b.order);
  },

  async getBudgetPlan(id: string) {
    await delay(200);
    const plan = budgetPlans.find(p => p.id === id);
    if (!plan) throw new Error('Budget plan not found');
    return { ...plan };
  },

  async createBudgetPlan(draft: BudgetPlanDraft) {
    await delay(400);
    const newPlan: BudgetPlan = {
      ...draft,
      id: `plan-${Date.now()}`,
      links: [],
      order: budgetPlans.length,
      createdAt: today(),
      updatedAt: today(),
    };
    budgetPlans.push(newPlan);
    return newPlan;
  },

  async updateBudgetPlan(id: string, updates: BudgetPlanUpdate) {
    await delay(300);
    const idx = budgetPlans.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Budget plan not found');
    const updated = { ...budgetPlans[idx], ...updates, id, createdAt: budgetPlans[idx].createdAt, updatedAt: today() };
    budgetPlans[idx] = updated;
    return { ...updated };
  },

  async deleteBudgetPlan(id: string) {
    await delay(300);
    budgetPlans = budgetPlans.filter(p => p.id !== id);
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
