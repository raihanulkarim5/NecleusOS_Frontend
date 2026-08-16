import type { DashboardService } from './dashboardService';
import type { DashboardSummary } from '../types/dashboard';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockDashboardService: DashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    await delay(400);
    return {
      tasksDoneToday: 5,
      tasksTotalToday: 8,
      budgetUsedPercent: 62,
      journalStreakDays: 12,
      activeProjects: 3,
      todayTasks: [
        { id: 't1', title: 'Design login UI', done: true, accent: 'cyan' },
        { id: 't2', title: 'API integration for expenses', done: true, accent: 'violet' },
        { id: 't3', title: 'Review Crystal Report bug #142', done: false, accent: 'magenta' },
        { id: 't4', title: 'Write unit tests', done: false, accent: 'dim' },
      ],
    };
  },
};
