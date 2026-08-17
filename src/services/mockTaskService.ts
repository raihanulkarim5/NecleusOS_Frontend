import type { TaskService } from './taskService';
import type { Task, TaskDraft, TaskStatus } from '../types/task';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

let tasks: Task[] = [
  {
    id: 'tk1',
    title: 'Build Task module UI',
    description: 'Checklist, due date, recurring — matching the shape decided for the Task type.',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-08-18',
    checklist: [
      { id: 'c1', text: 'Task type + service', done: true },
      { id: 'c2', text: 'Mock data', done: true },
      { id: 'c3', text: 'Tasks page UI', done: false },
      { id: 'c4', text: 'Wire into shell nav', done: false },
    ],
    tags: ['frontend'],
    effortEstimateHours: 3,
    recurring: 'None',
    links: [],
    favorite: true,
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17',
  },
  {
    id: 'tk2',
    title: 'Design Finance module schema',
    description: 'BankAccount, Expense, Category, Budget — encrypted account fields.',
    status: 'Open',
    priority: 'Medium',
    dueDate: '2026-08-22',
    checklist: [
      { id: 'c5', text: 'Define entities', done: true },
      { id: 'c6', text: 'Encryption approach', done: true },
      { id: 'c7', text: 'Build mock service', done: false },
    ],
    tags: ['finance', 'backend'],
    effortEstimateHours: 4,
    recurring: 'None',
    links: [],
    favorite: false,
    createdAt: '2026-08-10',
    updatedAt: '2026-08-15',
  },
  {
    id: 'tk3',
    title: 'Write unit tests',
    description: '',
    status: 'Open',
    priority: 'Low',
    dueDate: null,
    checklist: [],
    tags: ['quality'],
    effortEstimateHours: 2,
    recurring: 'None',
    links: [],
    favorite: false,
    createdAt: '2026-08-12',
    updatedAt: '2026-08-12',
  },
  {
    id: 'tk4',
    title: 'Weekly repo sync check',
    description: 'Fetch origin before pushing to avoid merge conflicts.',
    status: 'Open',
    priority: 'Medium',
    dueDate: today(),
    checklist: [],
    tags: ['ops'],
    effortEstimateHours: null,
    recurring: 'Weekly',
    links: [],
    favorite: false,
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17',
  },
  {
    id: 'tk5',
    title: 'Fix Bug #142 in Crystal Report export',
    description: '',
    status: 'Done',
    priority: 'High',
    dueDate: '2026-08-14',
    checklist: [
      { id: 'c8', text: 'Reproduce issue', done: true },
      { id: 'c9', text: 'Patch export query', done: true },
    ],
    tags: ['grssimp'],
    effortEstimateHours: 1.5,
    recurring: 'None',
    links: [],
    favorite: false,
    createdAt: '2026-08-13',
    updatedAt: '2026-08-14',
  },
];

export const mockTaskService: TaskService = {
  async getTasks(): Promise<Task[]> {
    await delay(400);
    return [...tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async createTask(draft: TaskDraft): Promise<Task> {
    await delay(400);
    const now = today();
    const task: Task = {
      id: `tk${Date.now()}`,
      ...draft,
      status: 'Open',
      checklist: [],
      links: [],
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    tasks = [task, ...tasks];
    return task;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    await delay(300);
    tasks = tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: today() } : t));
    const updated = tasks.find((t) => t.id === id);
    if (!updated) throw new Error('Task not found');
    return updated;
  },

  async toggleFavorite(id: string): Promise<Task> {
    await delay(200);
    tasks = tasks.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t));
    const updated = tasks.find((t) => t.id === id);
    if (!updated) throw new Error('Task not found');
    return updated;
  },

  async toggleChecklistItem(taskId: string, itemId: string): Promise<Task> {
    await delay(150);
    tasks = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            checklist: t.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)),
            updatedAt: today(),
          }
        : t,
    );
    const updated = tasks.find((t) => t.id === taskId);
    if (!updated) throw new Error('Task not found');
    return updated;
  },
};
