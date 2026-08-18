import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import type { ProjectDraft, ProjectStatus } from '../types/project';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: () => projectService.getProjects() });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ProjectDraft) => projectService.createProject(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) => projectService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useToggleMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) =>
      projectService.toggleMilestone(projectId, milestoneId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useToggleProjectFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.toggleFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
