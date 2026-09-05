import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services';
import type {
  BankAccount, Expense, Budget, DebtLoan,
  ExpenseDraft, ExpenseUpdate, BudgetDraft, BudgetUpdate,
  DebtLoanDraft, DebtLoanUpdate
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
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => financeService.createAccount(account),
    onSuccess: (newAccount) => {
      queryClient.setQueryData(['bank-accounts'], (old: BankAccount[] | undefined) => (old ? [...old, newAccount] : [newAccount]));
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      financeService.updateAccount(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['bank-account', updated.id], updated);
      queryClient.setQueryData(['bank-accounts'], (old: BankAccount[] | undefined) =>
        old ? old.map(a => a.id === updated.id ? updated : a) : [updated]
      );
    },
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

// Budgets
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
    mutationFn: (category: Omit<import('../types/finance').Category, 'id'>) =>
      financeService.createCategory(category),
    onSuccess: (newCategory) => {
      queryClient.setQueryData(['categories'], (old: import('../types/finance').Category[] | undefined) =>
        (old ? [...old, newCategory] : [newCategory])
      );
    },
  });
}
