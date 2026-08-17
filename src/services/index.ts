import { mockAuthService } from './mockAuthService';
import { mockDashboardService } from './mockDashboardService';
import { mockEntryService } from './mockEntryService';
import type { AuthService } from './authService';
import type { DashboardService } from './dashboardService';
import type { EntryService } from './entryService';

// Swap these single lines to apiAuthService / apiDashboardService / apiEntryService
// once the .NET Core API exists. No component or hook needs to change when that day comes.
export const authService: AuthService = mockAuthService;
export const dashboardService: DashboardService = mockDashboardService;
export const entryService: EntryService = mockEntryService;
