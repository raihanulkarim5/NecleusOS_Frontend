import type { AuthProvider, AuthSession, LoginCredentials, RegisterDetails } from '../types/auth';

// Every module's service follows this shape: a plain interface that
// components and hooks depend on, with swappable implementations
// underneath. Nothing above this line ever touches fetch() or dummy data.
export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(details: RegisterDetails): Promise<AuthSession>;
  loginWithProvider(provider: AuthProvider): Promise<AuthSession>;
  registerWithProvider(provider: AuthProvider): Promise<AuthSession>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}
