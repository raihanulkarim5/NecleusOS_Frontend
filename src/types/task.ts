import type { LinkRef } from './link';

export type TaskStatus = 'Open' | 'In Progress' | 'Done' | 'Archived';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type RecurringFrequency = 'None' | 'Daily' | 'Weekly' | 'Monthly';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  checklist: ChecklistItem[];
  tags: string[];
  effortEstimateHours: number | null;
  recurring: RecurringFrequency;
  links: LinkRef[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDraft {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  effortEstimateHours: number | null;
  recurring: RecurringFrequency;
}
