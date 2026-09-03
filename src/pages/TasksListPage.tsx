import { FormEvent, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateTask, useTasks, useToggleTaskFavorite, useUpdateTaskStatus } from '../hooks/useTasks';
import type { Task, TaskPriority, TaskStatus, TaskDraft } from '../types/task';

const STATUSES: TaskStatus[] = ['Open', 'In Progress', 'Done', 'Archived'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
type SubTab = 'kanban' | 'list' | 'by-priority' | 'by-due';

function KanbanIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="5" height="14" rx="1" />
      <rect x="9" y="7" width="5" height="11" rx="1" />
      <rect x="16" y="3" width="5" height="15" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12 2 2 7 2 12 12 17 22 12 22 7 12 2" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 7 12 12 22 7" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="9" y1="4" x2="9" y2="22" />
      <line x1="15" y1="4" x2="15" y2="22" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const SUB_TABS: { key: SubTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'kanban', label: 'Kanban', icon: KanbanIcon },
  { key: 'list', label: 'List', icon: ListIcon },
  { key: 'by-priority', label: 'By priority', icon: LayersIcon },
  { key: 'by-due', label: 'By due date', icon: CalendarIcon },
];

interface TasksListPageProps {
  onOpenTask: (id: string) => void;
}

export function TasksListPage({ onOpenTask }: TasksListPageProps) {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const toggleFavorite = useToggleTaskFavorite();

  const [subTab, setSubTab] = useState<SubTab>('kanban');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    let list = tasks ?? [];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }

    // Filter by status
    if (statusFilter !== 'All') {
      list = list.filter((t) => t.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'All') {
      list = list.filter((t) => t.priority === priorityFilter);
    }

    return list;
  }, [tasks, search, statusFilter, priorityFilter]);

  const tasksByStatus = useMemo(() => {
    const grouped = new Map<TaskStatus, Task[]>();
    for (const status of STATUSES) {
      grouped.set(status, filtered.filter((t) => t.status === status));
    }
    return grouped;
  }, [filtered]);

  const tasksByPriority = useMemo(() => {
    const grouped = new Map<TaskPriority, Task[]>();
    for (const priority of PRIORITIES) {
      grouped.set(priority, filtered.filter((t) => t.priority === priority));
    }
    return grouped;
  }, [filtered]);

  const tasksByDue = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    const overdue: Task[] = [];
    const today: Task[] = [];
    const upcoming: Task[] = [];
    const noDate: Task[] = [];

    const todayStr = new Date().toISOString().slice(0, 10);

    for (const task of filtered) {
      if (!task.dueDate) {
        noDate.push(task);
      } else if (task.dueDate < todayStr) {
        overdue.push(task);
      } else if (task.dueDate === todayStr) {
        today.push(task);
      } else {
        upcoming.push(task);
      }
    }

    if (overdue.length > 0) grouped.set('OVERDUE', overdue);
    if (today.length > 0) grouped.set('TODAY', today);
    if (upcoming.length > 0) grouped.set('UPCOMING', upcoming);
    if (noDate.length > 0) grouped.set('NO DATE', noDate);

    return grouped;
  }, [filtered]);

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-current">Tasks</span>
      </div>
      <h1 className="page-title">Tasks</h1>
      <p className="page-date">Checklists, priorities, due dates, and recurring work</p>

      <div className="sub-tabs">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`sub-tab${subTab === tab.key ? ' active' : ''}`}
              onClick={() => setSubTab(tab.key)}
            >
              <span className="sub-tab-icon"><Icon /></span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tasks-toolbar">
        <input
          type="text"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'All')}>
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'All')}>
          <option value="All">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button className="tasks-add-btn" onClick={() => setShowAddModal(true)}>+ Add task</button>
      </div>

      {isLoading && <p className="muted-text">Loading tasks…</p>}

      {subTab === 'kanban' && (
        <div className="kanban-board">
          {STATUSES.map((status) => {
            const statusTasks = tasksByStatus.get(status) ?? [];
            const statusColors = {
              'Open': '#38bdf8',
              'In Progress': '#8b5cf6',
              'Done': '#6fcf7c',
              'Archived': '#a0aec0',
            };
            return (
              <div key={status} className="kanban-column">
                <div className="kanban-column-header" style={{ borderLeftColor: statusColors[status] }}>
                  <span className="kanban-status-label">{status}</span>
                  <span className="kanban-count">{statusTasks.length}</span>
                </div>
                <div className="kanban-column-body">
                  {statusTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onOpen={() => onOpenTask(task.id)} onToggleFavorite={() => toggleFavorite.mutate(task.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'list' && (
        <div className="tasks-list">
          {filtered.map((task) => (
            <TaskListRow key={task.id} task={task} onOpen={() => onOpenTask(task.id)} onToggleFavorite={() => toggleFavorite.mutate(task.id)} onCycleStatus={(status) => updateStatus.mutate({ id: task.id, status })} />
          ))}
          {!isLoading && filtered.length === 0 && <p className="muted-text">No tasks match these filters.</p>}
        </div>
      )}

      {subTab === 'by-priority' && (
        <div className="tasks-grouped">
          {PRIORITIES.map((priority) => {
            const tasks = tasksByPriority.get(priority) ?? [];
            const priorityColors = { Low: '#38bdf8', Medium: '#8b5cf6', High: '#ff6b9d' };
            return (
              <div key={priority} className="tasks-group">
                <div className="tasks-group-header" style={{ borderLeftColor: priorityColors[priority] }}>
                  <span className="priority-dot" style={{ background: priorityColors[priority] }} />
                  {priority} Priority
                </div>
                <div className="tasks-in-group">
                  {tasks.map((task) => (
                    <TaskListRow key={task.id} task={task} onOpen={() => onOpenTask(task.id)} onToggleFavorite={() => toggleFavorite.mutate(task.id)} onCycleStatus={(status) => updateStatus.mutate({ id: task.id, status })} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'by-due' && (
        <div className="tasks-grouped">
          {Array.from(tasksByDue.entries()).map(([dueLabel, tasks]) => (
            <div key={dueLabel} className="tasks-group">
              <div className="tasks-group-header">
                {dueLabel === 'OVERDUE' && '⚠️ Overdue'}
                {dueLabel === 'TODAY' && '📌 Today'}
                {dueLabel === 'UPCOMING' && '📅 Upcoming'}
                {dueLabel === 'NO DATE' && '✗ No due date'}
              </div>
              <div className="tasks-in-group">
                {tasks.map((task) => (
                  <TaskListRow key={task.id} task={task} onOpen={() => onOpenTask(task.id)} onToggleFavorite={() => toggleFavorite.mutate(task.id)} onCycleStatus={(status) => updateStatus.mutate({ id: task.id, status })} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(draft) => {
            createTask.mutate(draft);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onOpen, onToggleFavorite }: { task: Task; onOpen: () => void; onToggleFavorite: () => void }) {
  const doneCount = task.checklist.filter((c) => c.done).length;
  const total = task.checklist.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : null;

  return (
    <div className="kanban-card" onClick={onOpen}>
      <div className="kanban-card-top">
        <span className={`task-priority-dot priority-dot-${task.priority.toLowerCase()}`} />
        <span className="kanban-card-title">{task.title}</span>
        <button
          className={`kanban-fav${task.favorite ? ' active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          ★
        </button>
      </div>
      {task.description && <p className="kanban-card-desc">{task.description}</p>}
      {total > 0 && (
        <div className="kanban-checklist">
          {pct !== null && <div className="kanban-progress">{doneCount}/{total}</div>}
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <div className="kanban-card-footer">
        {task.dueDate && <span className="task-due">{task.dueDate}</span>}
        {task.effortEstimateHours != null && <span className="task-effort">{task.effortEstimateHours}h</span>}
      </div>
    </div>
  );
}

function TaskListRow({ task, onOpen, onToggleFavorite, onCycleStatus }: { task: Task; onOpen: () => void; onToggleFavorite: () => void; onCycleStatus: (status: TaskStatus) => void }) {
  const doneCount = task.checklist.filter((c) => c.done).length;
  const total = task.checklist.length;

  return (
    <div className="task-list-row">
      <div className="task-list-main" onClick={onOpen}>
        <span className={`task-priority-dot priority-dot-${task.priority.toLowerCase()}`} />
        <div className="task-list-info">
          <span className="task-list-title">{task.title}</span>
          {task.description && <span className="task-list-desc">{task.description}</span>}
        </div>
      </div>
      {total > 0 && <span className="task-list-progress">{doneCount}/{total}</span>}
      {task.dueDate && <span className="task-list-due">{task.dueDate}</span>}
      {task.effortEstimateHours != null && <span className="task-list-effort">{task.effortEstimateHours}h</span>}
      <button
        className={`task-list-status status-${task.status.replace(' ', '-').toLowerCase()}`}
        onClick={() => {
          const nextStatus: Record<TaskStatus, TaskStatus> = {
            'Open': 'In Progress',
            'In Progress': 'Done',
            'Done': 'Archived',
            'Archived': 'Open',
          };
          onCycleStatus(nextStatus[task.status]);
        }}
      >
        {task.status}
      </button>
      <button
        className={`task-list-fav${task.favorite ? ' active' : ''}`}
        onClick={onToggleFavorite}
      >
        ★
      </button>
    </div>
  );
}

function AddTaskModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (draft: TaskDraft) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [effortHours, setEffortHours] = useState('');
  const [recurring, setRecurring] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly'>('None');
  const [tags, setTags] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate ? dueDate : null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      effortEstimateHours: effortHours ? parseInt(effortHours) : null,
      recurring,
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal tasks-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add task</h2>
        <form onSubmit={handleSubmit} className="tasks-modal-form">
          <div className="field">
            <label htmlFor="task-title">Task title</label>
            <input
              id="task-title"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              placeholder="Add details…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="tasks-modal-row">
            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="task-due">Due date</label>
              <input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="task-effort">Effort (hours)</label>
              <input id="task-effort" type="number" placeholder="0" value={effortHours} onChange={(e) => setEffortHours(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="task-recurring">Recurring</label>
            <select id="task-recurring" value={recurring} onChange={(e) => setRecurring(e.target.value as any)}>
              <option value="None">None</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="task-tags">Tags</label>
            <input
              id="task-tags"
              type="text"
              placeholder="work, urgent, feature"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Create task</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
