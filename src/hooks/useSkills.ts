import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { skillService } from '../services';
import type { SkillDraft } from '../types/skill';

export function useSkills() {
  return useQuery({ queryKey: ['skills'], queryFn: () => skillService.getSkills() });
}

export function useSkill(id: string | null) {
  return useQuery({
    queryKey: ['skill', id],
    queryFn: () => skillService.getSkill(id as string),
    enabled: id !== null,
  });
}

export function useSkillRoadmaps() {
  return useQuery({ queryKey: ['skill-roadmaps'], queryFn: () => skillService.getRoadmaps() });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: SkillDraft) => skillService.createSkill(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skill-roadmaps'] });
    },
  });
}

export function useToggleSyllabusItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, itemId }: { skillId: string; itemId: string }) =>
      skillService.toggleSyllabusItem(skillId, itemId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skill', vars.skillId] });
    },
  });
}

export function useAddSyllabusItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, title }: { skillId: string; title: string }) => skillService.addSyllabusItem(skillId, title),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skill', vars.skillId] });
    },
  });
}

export function useToggleSkillMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, milestoneId }: { skillId: string; milestoneId: string }) =>
      skillService.toggleMilestone(skillId, milestoneId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skill', vars.skillId] });
    },
  });
}

export function useAddMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, title }: { skillId: string; title: string }) => skillService.addMilestone(skillId, title),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skill', vars.skillId] });
    },
  });
}

export function useAddResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, title, url, type }: { skillId: string; title: string; url: string; type: 'Link' | 'PDF' }) =>
      skillService.addResource(skillId, title, url, type),
    onSuccess: (_data, vars) => queryClient.invalidateQueries({ queryKey: ['skill', vars.skillId] }),
  });
}

export function useAddCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, title, provider, url }: { skillId: string; title: string; provider: string; url: string }) =>
      skillService.addCourse(skillId, title, provider, url),
    onSuccess: (_data, vars) => queryClient.invalidateQueries({ queryKey: ['skill', vars.skillId] }),
  });
}

export function useAddVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, title, url }: { skillId: string; title: string; url: string }) =>
      skillService.addVideo(skillId, title, url),
    onSuccess: (_data, vars) => queryClient.invalidateQueries({ queryKey: ['skill', vars.skillId] }),
  });
}

export function useAddPracticeTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, taskId, taskTitle }: { skillId: string; taskId: string; taskTitle: string }) =>
      skillService.addPracticeTask(skillId, taskId, taskTitle),
    onSuccess: (_data, vars) => queryClient.invalidateQueries({ queryKey: ['skill', vars.skillId] }),
  });
}

export function useToggleSkillFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.toggleFavorite(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skill', id] });
    },
  });
}

export function useUpdateSkillNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => skillService.updateNotes(id, notes),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['skill', vars.id] });
    },
  });
}
