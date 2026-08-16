import { mockAuthService } from './mockAuthService';
import { mockDashboardService } from './mockDashboardService';
import type { AuthService } from './authService';
import type { DashboardService } from './dashboardService';

// Swap these single lines to apiAuthService / apiDashboardService once the
// .NET Core API exists. No component or hook needs to change when that day comes.
export const authService: AuthService = mockAuthService;
export const dashboardService: DashboardService = mockDashboardService;
