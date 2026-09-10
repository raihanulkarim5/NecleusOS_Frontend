import { useState } from 'react';
import { useDashboardSummary } from '../hooks/useDashboard';
import { CalendarWidget } from '../components/CalendarWidget';

type DashboardTab = 'overview' | 'calendar';

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12l4-4 4 4 4-6 4 4" />
      <path d="M3 19h18" />
    </svg>
  );
}
function CalendarTabIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="9" y1="4" x2="9" y2="22" />
      <line x1="15" y1="4" x2="15" y2="22" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const TABS: { key: DashboardTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'overview', label: 'Overview', icon: OverviewIcon },
  { key: 'calendar', label: 'Calendar', icon: CalendarTabIcon },
];

export function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-date">{today}</p>

      <div className="sub-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`sub-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="sub-tab-icon"><Icon /></span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        isLoading || !data ? (
          <p className="muted-text">Loading dashboard…</p>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Tasks today</div>
                <div className="stat-big glow-cyan">
                  {data.tasksDoneToday} / {data.tasksTotalToday}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Budget used</div>
                <div className="stat-big glow-violet">{data.budgetUsedPercent}%</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${data.budgetUsedPercent}%` }} />
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Journal streak</div>
                <div className="stat-big glow-magenta">{data.journalStreakDays} days</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active projects</div>
                <div className="stat-big glow-cyan">{data.activeProjects}</div>
              </div>
            </div>

            <section>
              <h2 className="section-title">Today's tasks</h2>
              <div className="stat-card">
                {data.todayTasks.map((task) => (
                  <div className="task-row" key={task.id}>
                    <span className={`task-dot accent-${task.accent}`} />
                    <span className={task.done ? 'task-done' : ''}>{task.title}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )
      )}

      {activeTab === 'calendar' && <CalendarWidget variant="compact" />}
    </div>
  );
}
