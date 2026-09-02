import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import type { LinkRef } from '../types/link';
import type { Project, ProjectDraft, ProjectLinkCategory, ProjectStatus } from '../types/project';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: () => projectService.getProjects() });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id as string),
    enabled: id !== null,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ProjectDraft) => projectService.createProject(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useCreateProjectFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, name }: { templateId: string; name: string }) =>
      projectService.createFromTemplate(templateId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// Every mutation below writes the updated Project straight into both the
// detail cache (['project', id]) and the list cache (['projects']) rather
// than just invalidating — same real-time-feel pattern used for Skills.
function applyProjectUpdate(queryClient: ReturnType<typeof useQueryClient>, updated: Project) {
  queryClient.setQueryData(['project', updated.id], updated);
  queryClient.setQueryData(['projects'], (old: Project[] | undefined) =>
    old ? old.map((p) => (p.id === updated.id ? updated : p)) : old,
  );
}

function useProjectMutation<TArgs>(mutationFn: (args: TArgs) => Promise<Project>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (updated: Project) => applyProjectUpdate(queryClient, updated),
  });
}

export function useUpdateProjectBasicInfo() {
  return useProjectMutation(
    ({
      id,
      name,
      description,
      status,
      tags,
    }: {
      id: string;
      name: string;
      description: string;
      status: ProjectStatus;
      tags: string[];
    }) => projectService.updateBasicInfo(id, { name, description, status, tags }),
  );
}

export function useToggleProjectTemplate() {
  return useProjectMutation((id: string) => projectService.toggleTemplate(id));
}

export function useToggleProjectFavorite() {
  return useProjectMutation((id: string) => projectService.toggleFavorite(id));
}

export function useToggleMilestone() {
  return useProjectMutation(({ projectId, milestoneId }: { projectId: string; milestoneId: string }) =>
    projectService.toggleMilestone(projectId, milestoneId),
  );
}

export function useAddProjectMilestone() {
  return useProjectMutation(({ projectId, title }: { projectId: string; title: string }) =>
    projectService.addMilestone(projectId, title),
  );
}

export function useRemoveProjectMilestone() {
  return useProjectMutation(({ projectId, milestoneId }: { projectId: string; milestoneId: string }) =>
    projectService.removeMilestone(projectId, milestoneId),
  );
}

export function useMoveProjectMilestone() {
  return useProjectMutation(
    ({ projectId, milestoneId, direction }: { projectId: string; milestoneId: string; direction: 'up' | 'down' }) =>
      projectService.moveMilestone(projectId, milestoneId, direction),
  );
}

export function useAddMilestoneTask() {
  return useProjectMutation(
    ({ projectId, milestoneId, taskId, taskTitle }: { projectId: string; milestoneId: string; taskId: string; taskTitle: string }) =>
      projectService.addMilestoneTask(projectId, milestoneId, taskId, taskTitle),
  );
}

export function useRemoveMilestoneTask() {
  return useProjectMutation(
    ({ projectId, milestoneId, taskId }: { projectId: string; milestoneId: string; taskId: string }) =>
      projectService.removeMilestoneTask(projectId, milestoneId, taskId),
  );
}

export function useAddProjectLinkedItem() {
  return useProjectMutation(
    ({ projectId, category, ref }: { projectId: string; category: ProjectLinkCategory; ref: LinkRef }) =>
      projectService.addLinkedItem(projectId, category, ref),
  );
}

export function useRemoveProjectLinkedItem() {
  return useProjectMutation(
    ({ projectId, category, refId }: { projectId: string; category: ProjectLinkCategory; refId: string }) =>
      projectService.removeLinkedItem(projectId, category, refId),
  );
}

export function useAddProjectResource() {
  return useProjectMutation(({ projectId, title, url }: { projectId: string; title: string; url: string }) =>
    projectService.addResource(projectId, title, url),
  );
}

export function useRemoveProjectResource() {
  return useProjectMutation(({ projectId, resourceId }: { projectId: string; resourceId: string }) =>
    projectService.removeResource(projectId, resourceId),
  );
}

export function useAddProjectFile() {
  return useProjectMutation(({ projectId, title, url }: { projectId: string; title: string; url: string }) =>
    projectService.addFile(projectId, title, url),
  );
}

export function useRemoveProjectFile() {
  return useProjectMutation(({ projectId, fileId }: { projectId: string; fileId: string }) =>
    projectService.removeFile(projectId, fileId),
  );
}

export function useUpdateProjectNotes() {
  return useProjectMutation(({ projectId, notes }: { projectId: string; notes: string }) =>
    projectService.updateNotes(projectId, notes),
  );
}
