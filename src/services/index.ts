import { mockAuthService } from './mockAuthService';
import type { AuthService } from './authService';

// Swap this single line to apiAuthService once the .NET Core API exists.
// No component or hook needs to change when that day comes.
export const authService: AuthService = mockAuthService;
