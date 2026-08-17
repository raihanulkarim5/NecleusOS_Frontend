import type { Task, TaskDraft, TaskStatus } from '../types/task';

export interface TaskService {
  getTasks(): Promise<Task[]>;
  createTask(draft: TaskDraft): Promise<Task>;
  updateStatus(id: string, status: TaskStatus): Promise<Task>;
  toggleFavorite(id: string): Promise<Task>;
  toggleChecklistItem(taskId: string, itemId: string): Promise<Task>;
}
