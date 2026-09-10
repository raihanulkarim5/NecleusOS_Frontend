import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from '../services';
import type { KnowledgeDraft, KnowledgeItem, KnowledgeUpdate } from '../types/knowledge';

export function useKnowledgeItems() {
  return useQuery({ queryKey: ['knowledge-items'], queryFn: () => knowledgeService.getItems() });
}

export function useKnowledgeItem(id: string) {
  return useQuery({ queryKey: ['knowledge-item', id], queryFn: () => knowledgeService.getItem(id), enabled: !!id });
}

export function useCreateKnowledgeItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: KnowledgeDraft) => knowledgeService.createItem(draft),
    onSuccess: (newItem) => {
      queryClient.setQueryData(['knowledge-items'], (old: KnowledgeItem[] | undefined) => (old ? [...old, newItem] : [newItem]));
    },
  });
}

export function useUpdateKnowledgeItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: KnowledgeUpdate }) => knowledgeService.updateItem(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['knowledge-item', updated.id], updated);
      queryClient.setQueryData(['knowledge-items'], (old: KnowledgeItem[] | undefined) =>
        old ? old.map(i => i.id === updated.id ? updated : i) : [updated]
      );
    },
  });
}

export function useDeleteKnowledgeItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeService.deleteItem(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['knowledge-items'], (old: KnowledgeItem[] | undefined) => (old ? old.filter(i => i.id !== id) : []));
      queryClient.removeQueries({ queryKey: ['knowledge-item', id] });
    },
  });
}
