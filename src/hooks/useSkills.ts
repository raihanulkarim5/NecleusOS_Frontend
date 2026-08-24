import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { skillService } from '../services';
import type { LinkRef } from '../types/link';
import type { RoadmapDraft, Skill, SkillDraft } from '../types/skill';

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

export function useCreateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: RoadmapDraft) => skillService.createRoadmap(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skill-roadmaps'] }),
  });
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

// Every mutation below writes the updated Skill straight into both the
// detail cache (['skill', id]) and the list cache (['skills']) instead of
// just invalidating and waiting on a second round-trip — this is what
// makes toggles and adds feel instant rather than laggy.
function applySkillUpdate(queryClient: ReturnType<typeof useQueryClient>, updated: Skill) {
  queryClient.setQueryData(['skill', updated.id], updated);
  queryClient.setQueryData(['skills'], (old: Skill[] | undefined) =>
    old ? old.map((s) => (s.id === updated.id ? updated : s)) : old,
  );
}

export function useUpdateSkillDescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, description }: { id: string; description: string }) =>
      skillService.updateDescription(id, description),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useToggleSkillMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, milestoneId }: { skillId: string; milestoneId: string }) =>
      skillService.toggleMilestone(skillId, milestoneId),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useAddMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, title }: { skillId: string; title: string }) => skillService.addMilestone(skillId, title),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useSetMilestoneProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, milestoneId, projectRef }: { skillId: string; milestoneId: string; projectRef: LinkRef | null }) =>
      skillService.setMilestoneProject(skillId, milestoneId, projectRef),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useToggleSyllabusItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, milestoneId, itemId }: { skillId: string; milestoneId: string; itemId: string }) =>
      skillService.toggleSyllabusItem(skillId, milestoneId, itemId),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useAddSyllabusItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, milestoneId, title }: { skillId: string; milestoneId: string; title: string }) =>
      skillService.addSyllabusItem(skillId, milestoneId, title),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useUpdateSyllabusItemDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      skillId,
      milestoneId,
      itemId,
      details,
    }: {
      skillId: string;
      milestoneId: string;
      itemId: string;
      details: string;
    }) => skillService.updateSyllabusItemDetails(skillId, milestoneId, itemId, details),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useSetSyllabusItemProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      skillId,
      milestoneId,
      itemId,
      projectRef,
    }: {
      skillId: string;
      milestoneId: string;
      itemId: string;
      projectRef: LinkRef | null;
    }) => skillService.setSyllabusItemProject(skillId, milestoneId, itemId, projectRef),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useAddResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      skillId,
      title,
      url,
      type,
      isUpload,
    }: {
      skillId: string;
      title: string;
      url: string;
      type: 'Link' | 'PDF';
      isUpload: boolean;
    }) => skillService.addResource(skillId, title, url, type, isUpload),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useAddCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, title, provider, url }: { skillId: string; title: string; provider: string; url: string }) =>
      skillService.addCourse(skillId, title, provider, url),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useAddVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, title, url }: { skillId: string; title: string; url: string }) =>
      skillService.addVideo(skillId, title, url),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useAddPracticeTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, taskId, taskTitle }: { skillId: string; taskId: string; taskTitle: string }) =>
      skillService.addPracticeTask(skillId, taskId, taskTitle),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useLinkSkillProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, projectRef }: { skillId: string; projectRef: LinkRef }) =>
      skillService.linkProject(skillId, projectRef),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useUnlinkSkillProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, projectId }: { skillId: string; projectId: string }) =>
      skillService.unlinkProject(skillId, projectId),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useToggleSkillFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.toggleFavorite(id),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}

export function useUpdateSkillNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => skillService.updateNotes(id, notes),
    onSuccess: (updated) => applySkillUpdate(queryClient, updated),
  });
}
