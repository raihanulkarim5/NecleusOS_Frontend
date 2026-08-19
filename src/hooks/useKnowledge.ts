import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from '../services';
import type { KnowledgeDraft } from '../types/knowledge';

export function useKnowledgeItems() {
  return useQuery({ queryKey: ['knowledge-items'], queryFn: () => knowledgeService.getItems() });
}

export function useCreateKnowledgeItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: KnowledgeDraft) => knowledgeService.createItem(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge-items'] }),
  });
}
