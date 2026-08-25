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

export function useUpdateSkillBasicInfo() {
  return useSkillMutation(
    ({
      id,
      name,
      category,
      status,
      description,
    }: {
      id: string;
      name: string;
      category: string;
      status: Skill['status'];
      description: string;
    }) => skillService.updateBasicInfo(id, { name, category, status, description }),
  );
}

// Generic factory: every skill sub-mutation follows the same shape
// (call the service, then write the returned Skill into both caches),
// so this collapses that boilerplate to one line per hook.
function useSkillMutation<TArgs>(mutationFn: (args: TArgs) => Promise<Skill>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (updated: Skill) => applySkillUpdate(queryClient, updated),
  });
}

export function useToggleSkillMilestone() {
  return useSkillMutation(({ skillId, milestoneId }: { skillId: string; milestoneId: string }) =>
    skillService.toggleMilestone(skillId, milestoneId),
  );
}

export function useAddMilestone() {
  return useSkillMutation(({ skillId, title }: { skillId: string; title: string }) =>
    skillService.addMilestone(skillId, title),
  );
}

export function useRemoveMilestone() {
  return useSkillMutation(({ skillId, milestoneId }: { skillId: string; milestoneId: string }) =>
    skillService.removeMilestone(skillId, milestoneId),
  );
}

export function useMoveMilestone() {
  return useSkillMutation(
    ({ skillId, milestoneId, direction }: { skillId: string; milestoneId: string; direction: 'up' | 'down' }) =>
      skillService.moveMilestone(skillId, milestoneId, direction),
  );
}

export function useAddProjectToMilestone() {
  return useSkillMutation(
    ({ skillId, milestoneId, projectRef }: { skillId: string; milestoneId: string; projectRef: LinkRef }) =>
      skillService.addProjectToMilestone(skillId, milestoneId, projectRef),
  );
}

export function useRemoveProjectFromMilestone() {
  return useSkillMutation(
    ({ skillId, milestoneId, projectId }: { skillId: string; milestoneId: string; projectId: string }) =>
      skillService.removeProjectFromMilestone(skillId, milestoneId, projectId),
  );
}

export function useToggleSyllabusItem() {
  return useSkillMutation(({ skillId, milestoneId, itemId }: { skillId: string; milestoneId: string; itemId: string }) =>
    skillService.toggleSyllabusItem(skillId, milestoneId, itemId),
  );
}

export function useAddSyllabusItem() {
  return useSkillMutation(({ skillId, milestoneId, title }: { skillId: string; milestoneId: string; title: string }) =>
    skillService.addSyllabusItem(skillId, milestoneId, title),
  );
}

export function useRemoveSyllabusItem() {
  return useSkillMutation(({ skillId, milestoneId, itemId }: { skillId: string; milestoneId: string; itemId: string }) =>
    skillService.removeSyllabusItem(skillId, milestoneId, itemId),
  );
}

export function useMoveSyllabusItem() {
  return useSkillMutation(
    ({
      skillId,
      milestoneId,
      itemId,
      direction,
    }: {
      skillId: string;
      milestoneId: string;
      itemId: string;
      direction: 'up' | 'down';
    }) => skillService.moveSyllabusItem(skillId, milestoneId, itemId, direction),
  );
}

export function useUpdateSyllabusItemDetails() {
  return useSkillMutation(
    ({
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
  );
}

export function useAddProjectToSyllabusItem() {
  return useSkillMutation(
    ({
      skillId,
      milestoneId,
      itemId,
      projectRef,
    }: {
      skillId: string;
      milestoneId: string;
      itemId: string;
      projectRef: LinkRef;
    }) => skillService.addProjectToSyllabusItem(skillId, milestoneId, itemId, projectRef),
  );
}

export function useRemoveProjectFromSyllabusItem() {
  return useSkillMutation(
    ({
      skillId,
      milestoneId,
      itemId,
      projectId,
    }: {
      skillId: string;
      milestoneId: string;
      itemId: string;
      projectId: string;
    }) => skillService.removeProjectFromSyllabusItem(skillId, milestoneId, itemId, projectId),
  );
}

export function useAddResource() {
  return useSkillMutation(
    ({
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
  );
}

export function useRemoveResource() {
  return useSkillMutation(({ skillId, resourceId }: { skillId: string; resourceId: string }) =>
    skillService.removeResource(skillId, resourceId),
  );
}

export function useAddCourse() {
  return useSkillMutation(
    ({ skillId, title, provider, url }: { skillId: string; title: string; provider: string; url: string }) =>
      skillService.addCourse(skillId, title, provider, url),
  );
}

export function useRemoveCourse() {
  return useSkillMutation(({ skillId, courseId }: { skillId: string; courseId: string }) =>
    skillService.removeCourse(skillId, courseId),
  );
}

export function useAddVideo() {
  return useSkillMutation(({ skillId, title, url }: { skillId: string; title: string; url: string }) =>
    skillService.addVideo(skillId, title, url),
  );
}

export function useRemoveVideo() {
  return useSkillMutation(({ skillId, videoId }: { skillId: string; videoId: string }) =>
    skillService.removeVideo(skillId, videoId),
  );
}

export function useAddPracticeTask() {
  return useSkillMutation(({ skillId, taskId, taskTitle }: { skillId: string; taskId: string; taskTitle: string }) =>
    skillService.addPracticeTask(skillId, taskId, taskTitle),
  );
}

export function useRemovePracticeTask() {
  return useSkillMutation(({ skillId, taskId }: { skillId: string; taskId: string }) =>
    skillService.removePracticeTask(skillId, taskId),
  );
}

export function useMovePracticeTask() {
  return useSkillMutation(
    ({ skillId, taskId, direction }: { skillId: string; taskId: string; direction: 'up' | 'down' }) =>
      skillService.movePracticeTask(skillId, taskId, direction),
  );
}

export function useLinkSkillProject() {
  return useSkillMutation(({ skillId, projectRef }: { skillId: string; projectRef: LinkRef }) =>
    skillService.linkProject(skillId, projectRef),
  );
}

export function useUnlinkSkillProject() {
  return useSkillMutation(({ skillId, projectId }: { skillId: string; projectId: string }) =>
    skillService.unlinkProject(skillId, projectId),
  );
}

export function useToggleSkillFavorite() {
  return useSkillMutation((id: string) => skillService.toggleFavorite(id));
}

export function useUpdateSkillNotes() {
  return useSkillMutation(({ id, notes }: { id: string; notes: string }) => skillService.updateNotes(id, notes));
}
