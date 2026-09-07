import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services';
import type {
  BankAccount, BankAccountDraft, BankAccountUpdate, BankCardDraft, BankCardUpdate, CredentialsUpdate,
  Expense, Budget, DebtLoan, BudgetPlan, BudgetPlanDraft, BudgetPlanUpdate,
  ExpenseDraft, ExpenseUpdate, BudgetDraft, BudgetUpdate,
  DebtLoanDraft, DebtLoanUpdate, Category,
} from '../types/finance';

// Bank Accounts
export function useBankAccounts() {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => financeService.getAccounts(),
  });
}

export function useBankAccount(id: string) {
  return useQuery({
    queryKey: ['bank-account', id],
    queryFn: () => financeService.getAccount(id),
    enabled: !!id,
  });
}

function upsertAccount(queryClient: ReturnType<typeof useQueryClient>, updated: BankAccount) {
  queryClient.setQueryData(['bank-account', updated.id], updated);
  queryClient.setQueryData(['bank-accounts'], (old: BankAccount[] | undefined) =>
    old ? old.map(a => a.id === updated.id ? updated : a) : [updated]
  );
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: BankAccountDraft) => financeService.createAccount(draft),
    onSuccess: (newAccount) => {
      queryClient.setQueryData(['bank-accounts'], (old: BankAccount[] | undefined) => (old ? [...old, newAccount] : [newAccount]));
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: BankAccountUpdate }) =>
      financeService.updateAccount(id, updates),
    onSuccess: (updated) => upsertAccount(queryClient, updated),
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteAccount(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['bank-accounts'], (old: BankAccount[] | undefined) =>
        old ? old.filter(a => a.id !== id) : []
      );
      queryClient.removeQueries({ queryKey: ['bank-account', id] });
    },
  });
}

export function useUpdateAccountCredentials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CredentialsUpdate }) =>
      financeService.updateAccountCredentials(id, updates),
    onSuccess: (updated) => upsertAccount(queryClient, updated),
  });
}

export function useAddCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, draft }: { accountId: string; draft: BankCardDraft }) =>
      financeService.addCard(accountId, draft),
    onSuccess: (updated) => upsertAccount(queryClient, updated),
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, cardId, updates }: { accountId: string; cardId: string; updates: BankCardUpdate }) =>
      financeService.updateCard(accountId, cardId, updates),
    onSuccess: (updated) => upsertAccount(queryClient, updated),
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, cardId }: { accountId: string; cardId: string }) =>
      financeService.deleteCard(accountId, cardId),
    onSuccess: (updated) => upsertAccount(queryClient, updated),
  });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => financeService.getCategories(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: Omit<Category, 'id'>) => financeService.createCategory(category),
    onSuccess: (newCategory) => {
      queryClient.setQueryData(['categories'], (old: Category[] | undefined) => (old ? [...old, newCategory] : [newCategory]));
    },
  });
}

// Expenses
export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => financeService.getExpenses(),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => financeService.getExpense(id),
    enabled: !!id,
  });
}

export function useExpensesByMonth(month: string) {
  return useQuery({
    queryKey: ['expenses-month', month],
    queryFn: () => financeService.getExpensesByMonth(month),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ExpenseDraft) => financeService.createExpense(draft),
    onSuccess: (newExpense) => {
      queryClient.setQueryData(['expenses'], (old: Expense[] | undefined) => (old ? [...old, newExpense] : [newExpense]));
      queryClient.invalidateQueries({ queryKey: ['expenses-month'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ExpenseUpdate }) => financeService.updateExpense(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['expense', updated.id], updated);
      queryClient.setQueryData(['expenses'], (old: Expense[] | undefined) =>
        old ? old.map(e => e.id === updated.id ? updated : e) : [updated]
      );
      queryClient.invalidateQueries({ queryKey: ['expenses-month'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteExpense(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['expenses'], (old: Expense[] | undefined) =>
        old ? old.filter(e => e.id !== id) : []
      );
      queryClient.removeQueries({ queryKey: ['expense', id] });
      queryClient.invalidateQueries({ queryKey: ['expenses-month'] });
    },
  });
}

// Budgets (monthly, per category)
export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => financeService.getBudgets(),
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: ['budget', id],
    queryFn: () => financeService.getBudget(id),
    enabled: !!id,
  });
}

export function useBudgetsByMonth(month: string) {
  return useQuery({
    queryKey: ['budgets-month', month],
    queryFn: () => financeService.getBudgetsByMonth(month),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: BudgetDraft) => financeService.createBudget(draft),
    onSuccess: (newBudget) => {
      queryClient.setQueryData(['budgets'], (old: Budget[] | undefined) => (old ? [...old, newBudget] : [newBudget]));
      queryClient.invalidateQueries({ queryKey: ['budgets-month'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: BudgetUpdate }) => financeService.updateBudget(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['budget', updated.id], updated);
      queryClient.setQueryData(['budgets'], (old: Budget[] | undefined) =>
        old ? old.map(b => b.id === updated.id ? updated : b) : [updated]
      );
      queryClient.invalidateQueries({ queryKey: ['budgets-month'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteBudget(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['budgets'], (old: Budget[] | undefined) =>
        old ? old.filter(b => b.id !== id) : []
      );
      queryClient.removeQueries({ queryKey: ['budget', id] });
      queryClient.invalidateQueries({ queryKey: ['budgets-month'] });
    },
  });
}

// Budget Plans (future plans: asset / business / goal)
export function useBudgetPlans() {
  return useQuery({
    queryKey: ['budget-plans'],
    queryFn: () => financeService.getBudgetPlans(),
  });
}

export function useBudgetPlan(id: string) {
  return useQuery({
    queryKey: ['budget-plan', id],
    queryFn: () => financeService.getBudgetPlan(id),
    enabled: !!id,
  });
}

export function useCreateBudgetPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: BudgetPlanDraft) => financeService.createBudgetPlan(draft),
    onSuccess: (newPlan) => {
      queryClient.setQueryData(['budget-plans'], (old: BudgetPlan[] | undefined) => (old ? [...old, newPlan] : [newPlan]));
    },
  });
}

export function useUpdateBudgetPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: BudgetPlanUpdate }) => financeService.updateBudgetPlan(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['budget-plan', updated.id], updated);
      queryClient.setQueryData(['budget-plans'], (old: BudgetPlan[] | undefined) =>
        old ? old.map(p => p.id === updated.id ? updated : p) : [updated]
      );
    },
  });
}

export function useDeleteBudgetPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteBudgetPlan(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['budget-plans'], (old: BudgetPlan[] | undefined) =>
        old ? old.filter(p => p.id !== id) : []
      );
      queryClient.removeQueries({ queryKey: ['budget-plan', id] });
    },
  });
}

// Debt/Loans
export function useDebtLoans() {
  return useQuery({
    queryKey: ['debt-loans'],
    queryFn: () => financeService.getDebtLoans(),
  });
}

export function useDebtLoan(id: string) {
  return useQuery({
    queryKey: ['debt-loan', id],
    queryFn: () => financeService.getDebtLoan(id),
    enabled: !!id,
  });
}

export function useCreateDebtLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: DebtLoanDraft) => financeService.createDebtLoan(draft),
    onSuccess: (newDL) => {
      queryClient.setQueryData(['debt-loans'], (old: DebtLoan[] | undefined) => (old ? [...old, newDL] : [newDL]));
    },
  });
}

export function useUpdateDebtLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: DebtLoanUpdate }) => financeService.updateDebtLoan(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['debt-loan', updated.id], updated);
      queryClient.setQueryData(['debt-loans'], (old: DebtLoan[] | undefined) =>
        old ? old.map(d => d.id === updated.id ? updated : d) : [updated]
      );
    },
  });
}

export function useDeleteDebtLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteDebtLoan(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['debt-loans'], (old: DebtLoan[] | undefined) =>
        old ? old.filter(d => d.id !== id) : []
      );
      queryClient.removeQueries({ queryKey: ['debt-loan', id] });
    },
  });
}

// Summary
export function useMonthSummary(month: string) {
  return useQuery({
    queryKey: ['month-summary', month],
    queryFn: () => financeService.getMonthSummary(month),
  });
}

export function useOverallBalance() {
  return useQuery({
    queryKey: ['overall-balance'],
    queryFn: () => financeService.getOverallBalance(),
  });
}
