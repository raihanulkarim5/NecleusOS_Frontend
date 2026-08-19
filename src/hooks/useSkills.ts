import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { skillService } from '../services';
import type { SkillDraft } from '../types/skill';

export function useSkills() {
  return useQuery({ queryKey: ['skills'], queryFn: () => skillService.getSkills() });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: SkillDraft) => skillService.createSkill(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });
}

export function useToggleRoadmapItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, itemId }: { skillId: string; itemId: string }) =>
      skillService.toggleRoadmapItem(skillId, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });
}

export function useToggleSkillFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.toggleFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });
}
