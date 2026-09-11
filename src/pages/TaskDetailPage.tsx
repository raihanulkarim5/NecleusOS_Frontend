import { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDeleteTask, useToggleTaskFavorite, useToggleChecklistItem, useUpdateTask, useTask } from '../hooks/useTasks';
import type { Task, TaskPriority, TaskStatus, TaskUpdate } from '../types/task';

const STATUSES: TaskStatus[] = ['Open', 'In Progress', 'Done', 'Archived'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
type SubTab = 'overview' | 'checklist' | 'links';

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="8.01" />
    </svg>
  );
}

function ChecklistIconSvg() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="18" rx="2" />
      <path d="M9 4V2h6v2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const SUB_TABS: { key: SubTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'overview', label: 'Overview', icon: InfoIcon },
  { key: 'checklist', label: 'Checklist', icon: ChecklistIconSvg },
  { key: 'links', label: 'Links', icon: LinkIcon },
];

interface TaskDetailPageProps {
  taskId: string;
  onBack: () => void;
}

export function TaskDetailPage({ taskId, onBack }: TaskDetailPageProps) {
  const { data: task, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleFavorite = useToggleTaskFavorite();
  const toggleChecklistItem = useToggleChecklistItem();

  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading || !task) {
    return (
      <div>
        <button className="back-button" onClick={onBack}>← Back</button>
        <p className="muted-text">Loading task…</p>
      </div>
    );
  }

  const currentTask = task!;

  function handleDelete() {
    deleteTask.mutate(currentTask.id);
    onBack();
  }

  return (
    <div>
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="detail-header-actions">
          <button
            className="icon-btn"
            onClick={() => toggleFavorite.mutate(currentTask.id)}
            title="Favorite"
          >
            {currentTask.favorite ? '⭐' : '☆'}
          </button>
          <button className="icon-btn" onClick={() => setEditing(true)} title="Edit">✏️</button>
          <button className="icon-btn delete" onClick={() => setShowDeleteConfirm(true)} title="Delete">🗑️</button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="confirm-dialog">
          <p>Delete this task? This cannot be undone.</p>
          <div className="confirm-actions">
            <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button className="delete" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}

      <h1 className="page-title">{currentTask.title}</h1>
      <div className="task-detail-meta">
        <span className={`task-status-badge status-${currentTask.status.replace(' ', '-').toLowerCase()}`}>{currentTask.status}</span>
        <span className={`task-priority-badge priority-${currentTask.priority.toLowerCase()}`}>{currentTask.priority}</span>
        {currentTask.dueDate && <span className="task-detail-due">Due {currentTask.dueDate}</span>}
        {currentTask.effortEstimateHours != null && <span className="task-detail-effort">{currentTask.effortEstimateHours}h</span>}
        {currentTask.recurring !== 'None' && <span className="task-detail-recurring">↻ {currentTask.recurring}</span>}
      </div>

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

      {subTab === 'overview' && (
        <div className="detail-panel">
          {currentTask.description && (
            <div className="detail-row">
              <div className="detail-label">Description</div>
              <div className="detail-value rich-content">{currentTask.description}</div>
            </div>
          )}
          {currentTask.tags.length > 0 && (
            <div className="detail-row">
              <div className="detail-label">Tags</div>
              <div className="detail-value">
                {currentTask.tags.map(tag => <span key={tag} className="tag-badge">#{tag}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'checklist' && (
        <div className="detail-panel checklist-panel">
          {currentTask.checklist.length > 0 ? (
            <>
              <div className="checklist-progress">
                <span className="progress-text">{currentTask.checklist.filter(c => c.done).length}/{currentTask.checklist.length} done</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.round((currentTask.checklist.filter(c => c.done).length / currentTask.checklist.length) * 100)}%` }} />
                </div>
              </div>
              <ul className="checklist-items">
                {currentTask.checklist.map(item => (
                  <li key={item.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleChecklistItem.mutate({ taskId: currentTask.id, itemId: item.id })}
                      />
                      <span className={item.done ? 'task-done' : ''}>{item.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted-text">No checklist items yet.</p>
          )}
        </div>
      )}

      {subTab === 'links' && (
        <div className="detail-panel links-panel">
          {currentTask.links.length > 0 ? (
            <div className="link-group">
              {currentTask.links.map(link => (
                <div key={`${link.type}-${link.id}`} className="link-item">
                  <div className="link-item-type">{link.type}</div>
                  <div className="link-item-title">{link.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-text">No links yet.</p>
          )}
          <button className="link-add-btn">+ Link item</button>
        </div>
      )}

      {editing && (
        <TaskEditModal
          task={currentTask}
          onClose={() => setEditing(false)}
          onSave={(updates) => { updateTask.mutate({ id: currentTask.id, updates }); setEditing(false); }}
        />
      )}
    </div>
  );
}

function TaskEditModal({ task, onClose, onSave }: { task: Task; onClose: () => void; onSave: (updates: TaskUpdate) => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [effort, setEffort] = useState(task.effortEstimateHours?.toString() || '');
  const [recurring, setRecurring] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly'>(task.recurring);
  const [tags, setTags] = useState(task.tags.join(', '));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate || null,
      effortEstimateHours: effort ? parseInt(effort, 10) : null,
      recurring,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      checklist: task.checklist,
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal tasks-edit-modal wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Edit task</h2>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="field">
            <label htmlFor="edit-title">Title</label>
            <input id="edit-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>

          <div className="field">
            <label htmlFor="edit-desc">Description</label>
            <textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="edit-form-row">
            <div className="field">
              <label htmlFor="edit-status">Status</label>
              <select id="edit-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-priority">Priority</label>
              <select id="edit-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-due">Due date</label>
              <input id="edit-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="edit-form-row">
            <div className="field">
              <label htmlFor="edit-effort">Effort (hours)</label>
              <input id="edit-effort" type="number" value={effort} onChange={(e) => setEffort(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="edit-recurring">Recurring</label>
              <select id="edit-recurring" value={recurring} onChange={(e) => setRecurring(e.target.value as any)}>
                <option value="None">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-tags">Tags</label>
              <input id="edit-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="work, urgent, feature" />
            </div>
          </div>

          <div className="edit-form-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Save changes</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
