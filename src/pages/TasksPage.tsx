import { FormEvent, useMemo, useState } from 'react';
import {
  useCreateTask,
  useTasks,
  useToggleChecklistItem,
  useToggleTaskFavorite,
  useUpdateTaskStatus,
} from '../hooks/useTasks';
import type { Task, TaskStatus } from '../types/task';

const STATUSES: TaskStatus[] = ['Open', 'In Progress', 'Done', 'Archived'];
const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  Open: 'In Progress',
  'In Progress': 'Done',
  Done: 'Archived',
  Archived: 'Open',
};

export function TasksPage() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const toggleFavorite = useToggleTaskFavorite();
  const toggleChecklistItem = useToggleChecklistItem();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [newTitle, setNewTitle] = useState('');

  const filtered = useMemo(() => {
    if (!tasks) return [];
    if (statusFilter === 'All') return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTask.mutate({
      title: newTitle.trim(),
      description: '',
      priority: 'Medium',
      dueDate: null,
      tags: [],
      effortEstimateHours: null,
      recurring: 'None',
    });
    setNewTitle('');
  }

  return (
    <div>
      <h1 className="page-title">Tasks</h1>
      <p className="page-date">Checklists, due dates, and recurring work — separate from general Entries.</p>

      <form className="entry-quickadd" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Add a task…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" disabled={createTask.isPending || !newTitle.trim()}>
          {createTask.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="entries-toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'All')}>
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="entries-count">{filtered.length} task{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {isLoading && <p className="muted-text">Loading tasks…</p>}

      <div className="task-list">
        {filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onCycleStatus={() => updateStatus.mutate({ id: task.id, status: STATUS_CYCLE[task.status] })}
            onToggleFavorite={() => toggleFavorite.mutate(task.id)}
            onToggleChecklistItem={(itemId) => toggleChecklistItem.mutate({ taskId: task.id, itemId })}
          />
        ))}
        {!isLoading && filtered.length === 0 && <p className="muted-text">No tasks match this filter.</p>}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onCycleStatus,
  onToggleFavorite,
  onToggleChecklistItem,
}: {
  task: Task;
  onCycleStatus: () => void;
  onToggleFavorite: () => void;
  onToggleChecklistItem: (itemId: string) => void;
}) {
  const doneCount = task.checklist.filter((c) => c.done).length;
  const total = task.checklist.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : null;

  return (
    <div className="task-card">
      <div className="task-card-top">
        <div className="task-title-row">
          <span className={`task-priority-dot priority-dot-${task.priority.toLowerCase()}`} />
          <span className="task-card-title">{task.title}</span>
        </div>
        <button
          className={`entry-fav${task.favorite ? ' active' : ''}`}
          onClick={onToggleFavorite}
          aria-label={task.favorite ? 'Unfavorite' : 'Favorite'}
        >
          ★
        </button>
      </div>

      {task.description && <p className="entry-desc">{task.description}</p>}

      {total > 0 && (
        <div className="task-checklist">
          {task.checklist.map((item) => (
            <label key={item.id} className="task-checklist-item">
              <input type="checkbox" checked={item.done} onChange={() => onToggleChecklistItem(item.id)} />
              <span className={item.done ? 'task-done' : ''}>{item.text}</span>
            </label>
          ))}
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="entry-card-bottom">
        <button
          className={`entry-status-badge status-${task.status.replace(' ', '-').toLowerCase()}`}
          onClick={onCycleStatus}
        >
          {task.status}
        </button>
        {task.dueDate && <span className="entry-due">Due {task.dueDate}</span>}
        {task.effortEstimateHours != null && <span className="task-effort">{task.effortEstimateHours}h est.</span>}
        {task.recurring !== 'None' && <span className="task-recurring">↻ {task.recurring}</span>}
      </div>

      {task.tags.length > 0 && (
        <div className="entry-tags">
          {task.tags.map((tag) => (
            <span key={tag} className="entry-tag">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
