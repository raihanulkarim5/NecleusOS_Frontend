import type { AuthProvider, AuthService } from './authService';
import type { AuthSession, LoginCredentials, RegisterDetails } from '../types/auth';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const SESSION_KEY = 'personal-os-mock-session';

function fakeToken() {
  return `mock-token-${Math.random().toString(36).slice(2)}`;
}

function providerName(provider: AuthProvider) {
  if (provider === 'google') return 'Google';
  if (provider === 'github') return 'GitHub';
  return 'Microsoft';
}

function createProviderSession(provider: AuthProvider): AuthSession {
  const normalized = providerName(provider);
  return {
    user: {
      id: `user-${provider}`,
      name: `${normalized} user`,
      email: `${provider}@example.com`,
    },
    token: fakeToken(),
  };
}

export const mockAuthService: AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay(500);

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

  async loginWithProvider(provider: AuthProvider): Promise<AuthSession> {
    await delay(500);
    const session = createProviderSession(provider);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async registerWithProvider(provider: AuthProvider): Promise<AuthSession> {
    await delay(500);
    const session = createProviderSession(provider);
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
