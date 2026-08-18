import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services';
import type { ExpenseDraft } from '../types/finance';

export function useAccounts() {
  return useQuery({ queryKey: ['finance-accounts'], queryFn: () => financeService.getAccounts() });
}

export function useCategories() {
  return useQuery({ queryKey: ['finance-categories'], queryFn: () => financeService.getCategories() });
}

export function useExpenses() {
  return useQuery({ queryKey: ['finance-expenses'], queryFn: () => financeService.getExpenses() });
}

export function useMonthSummary() {
  return useQuery({ queryKey: ['finance-summary'], queryFn: () => financeService.getMonthSummary() });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ExpenseDraft) => financeService.createExpense(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
  });
}
