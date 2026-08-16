export interface DashboardTask {
  id: string;
  title: string;
  done: boolean;
  accent: 'cyan' | 'violet' | 'magenta' | 'dim';
}

export interface DashboardSummary {
  tasksDoneToday: number;
  tasksTotalToday: number;
  budgetUsedPercent: number;
  journalStreakDays: number;
  activeProjects: number;
  todayTasks: DashboardTask[];
}
