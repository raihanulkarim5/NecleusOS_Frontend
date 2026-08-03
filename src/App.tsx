import { useState } from 'react';
import { useLogout, useSession } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import './styles/galaxy.css';

export function App() {
  const { data: session, isLoading } = useSession();
  const logout = useLogout();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (isLoading) return null;

  if (!session) {
    return mode === 'login' ? (
      <LoginPage onSwitchToRegister={() => setMode('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setMode('login')} />
    );
  }

  // Placeholder authenticated view — the Dashboard module replaces this next.
  return (
    <div className="auth-stage">
      <div className="auth-card">
        <h1>Signed in</h1>
        <p className="sub">Welcome, {session.user.name}</p>
        <button className="auth-submit" onClick={() => logout.mutate()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
