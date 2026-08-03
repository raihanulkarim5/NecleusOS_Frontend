import type { AuthService } from './authService';
import type { AuthSession, LoginCredentials, RegisterDetails } from '../types/auth';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const SESSION_KEY = 'personal-os-mock-session';

function fakeToken() {
  return `mock-token-${Math.random().toString(36).slice(2)}`;
}

export const mockAuthService: AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay(500);

    // Any email/password works in mock mode, so the UI can be exercised
    // freely before a real API exists.
    const session: AuthSession = {
      user: {
        id: 'user-1',
        name: credentials.email.split('@')[0],
        email: credentials.email,
      },
      token: fakeToken(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async register(details: RegisterDetails): Promise<AuthSession> {
    await delay(500);

    const session: AuthSession = {
      user: { id: 'user-1', name: details.name, email: details.email },
      token: fakeToken(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(SESSION_KEY);
  },

  async getSession(): Promise<AuthSession | null> {
    await delay(150);
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  },
};
