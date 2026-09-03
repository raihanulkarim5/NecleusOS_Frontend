import type { Task, TaskDraft, TaskStatus, TaskUpdate } from '../types/task';

export interface TaskService {
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task>;
  createTask(draft: TaskDraft): Promise<Task>;
  updateTask(id: string, updates: TaskUpdate): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  updateStatus(id: string, status: TaskStatus): Promise<Task>;
  toggleFavorite(id: string): Promise<Task>;
  toggleChecklistItem(taskId: string, itemId: string): Promise<Task>;
}
