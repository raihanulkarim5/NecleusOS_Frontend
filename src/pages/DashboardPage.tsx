import { useDashboardSummary } from '../hooks/useDashboard';

export function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading || !data) {
    return <p className="muted-text">Loading dashboard…</p>;
  }

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
    </div>
  );
}
