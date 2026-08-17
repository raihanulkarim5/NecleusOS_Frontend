import { mockAuthService } from './mockAuthService';
import { mockDashboardService } from './mockDashboardService';
import { mockEntryService } from './mockEntryService';
import { mockTaskService } from './mockTaskService';
import type { AuthService } from './authService';
import type { DashboardService } from './dashboardService';
import type { EntryService } from './entryService';
import type { TaskService } from './taskService';

// Swap these single lines to the api* implementation once the .NET Core API
// exists. No component or hook needs to change when that day comes.
export const authService: AuthService = mockAuthService;
export const dashboardService: DashboardService = mockDashboardService;
export const entryService: EntryService = mockEntryService;
export const taskService: TaskService = mockTaskService;
