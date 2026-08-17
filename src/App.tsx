import { useState } from 'react';
import { useLogout, useSession } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EntriesPage } from './pages/EntriesPage';
import { AppShell, NavKey } from './components/AppShell';
import './styles/galaxy.css';

export function App() {
  const { data: session, isLoading } = useSession();
  const logout = useLogout();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<NavKey>('dashboard');

  if (isLoading) return null;

  if (!session) {
    return mode === 'login' ? (
      <LoginPage onSwitchToRegister={() => setMode('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setMode('login')} />
    );
  }

  return (
    <AppShell active={activeTab} onNavigate={setActiveTab} onSignOut={() => logout.mutate()}>
      {activeTab === 'dashboard' && <DashboardPage />}
      {activeTab === 'entries' && <EntriesPage />}
      {activeTab !== 'dashboard' && activeTab !== 'entries' && (
        <p className="muted-text">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module coming up next in the build order.
        </p>
      )}
    </AppShell>
  );
}
