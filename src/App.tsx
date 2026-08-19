import { useState } from 'react';
import { useLogout, useSession } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EntriesPage } from './pages/EntriesPage';
import { TasksPage } from './pages/TasksPage';
import { JournalPage } from './pages/JournalPage';
import { FinancePage } from './pages/FinancePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { InboxPage } from './pages/InboxPage';
import { SkillsPage } from './pages/SkillsPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { CalendarPage } from './pages/CalendarPage';
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
      {activeTab === 'inbox' && <InboxPage />}
      {activeTab === 'entries' && <EntriesPage />}
      {activeTab === 'tasks' && <TasksPage />}
      {activeTab === 'journal' && <JournalPage />}
      {activeTab === 'finance' && <FinancePage />}
      {activeTab === 'projects' && <ProjectsPage />}
      {activeTab === 'skills' && <SkillsPage />}
      {activeTab === 'knowledge' && <KnowledgeBasePage />}
      {activeTab === 'calendar' && <CalendarPage />}
    </AppShell>
  );
}
