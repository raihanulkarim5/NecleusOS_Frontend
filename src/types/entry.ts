export type EntryType =
  | 'Task'
  | 'Note'
  | 'Idea'
  | 'Problem'
  | 'Solution'
  | 'Journal'
  | 'Reminder'
  | 'Reference'
  | 'Decision'
  | 'Meeting Note';

export type EntryStatus = 'Open' | 'In Progress' | 'Done' | 'Archived';
export type EntryPriority = 'Low' | 'Medium' | 'High';

export interface EntryLink {
  entryId: string;
  title: string;
}

export interface Entry {
  id: string;
  title: string;
  description: string;
  type: EntryType;
  status: EntryStatus;
  priority: EntryPriority;
  tags: string[];
  dueDate: string | null;
  links: EntryLink[];
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
}

export interface EntryDraft {
  title: string;
  description: string;
  type: EntryType;
  priority: EntryPriority;
  tags: string[];
  dueDate: string | null;
}
