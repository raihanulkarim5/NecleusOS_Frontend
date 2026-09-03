import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';
import type { TaskDraft, TaskStatus, Task, TaskUpdate } from '../types/task';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks(),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTask(id),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: TaskDraft) => taskService.createTask(draft),
    onSuccess: (newTask: Task) => {
      queryClient.setQueryData(['tasks'], (old: Task[] | undefined) => (old ? [newTask, ...old] : [newTask]));
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) => taskService.updateTask(id, updates),
    onSuccess: (updated: Task) => {
      queryClient.setQueryData(['task', updated.id], updated);
      queryClient.setQueryData(
        ['tasks'],
        (old: Task[] | undefined) => (old ? old.map((t) => (t.id === updated.id ? updated : t)) : [updated]),
      );
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: (_, id: string) => {
      queryClient.setQueryData(
        ['tasks'],
        (old: Task[] | undefined) => (old ? old.filter((t) => t.id !== id) : []),
      );
      queryClient.removeQueries({ queryKey: ['task', id] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => taskService.updateStatus(id, status),
    onSuccess: (updated: Task) => {
      queryClient.setQueryData(['task', updated.id], updated);
      queryClient.setQueryData(
        ['tasks'],
        (old: Task[] | undefined) => (old ? old.map((t) => (t.id === updated.id ? updated : t)) : [updated]),
      );
    },
  });
}

export function useToggleTaskFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.toggleFavorite(id),
    onSuccess: (updated: Task) => {
      queryClient.setQueryData(['task', updated.id], updated);
      queryClient.setQueryData(
        ['tasks'],
        (old: Task[] | undefined) => (old ? old.map((t) => (t.id === updated.id ? updated : t)) : [updated]),
      );
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, itemId }: { taskId: string; itemId: string }) =>
      taskService.toggleChecklistItem(taskId, itemId),
    onSuccess: (updated: Task) => {
      queryClient.setQueryData(['task', updated.id], updated);
      queryClient.setQueryData(
        ['tasks'],
        (old: Task[] | undefined) => (old ? old.map((t) => (t.id === updated.id ? updated : t)) : [updated]),
      );
    },
  });
}
