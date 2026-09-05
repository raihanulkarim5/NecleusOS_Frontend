import { useState } from 'react';
import { useLogout, useSession } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EntriesModule } from './pages/EntriesModule';
import { TasksModule } from './pages/TasksModule';
import { JournalModule } from './pages/JournalModule';
import { FinanceModule } from './pages/FinanceModule';
import { ProjectsModule } from './pages/ProjectsModule';
import { InboxPage } from './pages/InboxPage';
import { SkillsModule } from './pages/SkillsModule';
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
      {activeTab === 'entries' && <EntriesModule />}
      {activeTab === 'tasks' && <TasksModule />}
      {activeTab === 'journal' && <JournalModule />}
      {activeTab === 'finance' && <FinanceModule />}
      {activeTab === 'projects' && <ProjectsModule />}
      {activeTab === 'skills' && <SkillsModule />}
      {activeTab === 'knowledge' && <KnowledgeBasePage />}
      {activeTab === 'calendar' && <CalendarPage />}
    </AppShell>
  );
}
