import { FormEvent, useEffect, useState } from 'react';
import { useDeleteTask, useToggleTaskFavorite, useToggleChecklistItem, useUpdateTask, useTask } from '../hooks/useTasks';
import { RichNotesEditor } from '../components/RichNotesEditor';
import { MoveButtons } from '../components/MoveButtons';
import type { Task, TaskPriority, TaskStatus, ChecklistItem } from '../types/task';

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
      <path d="M3 9l4 4 8-8" />
      <path d="M3 20v-8m0 -4v-2m18 18H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
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

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('Medium');
  const [formStatus, setFormStatus] = useState<TaskStatus>('Open');
  const [formDueDate, setFormDueDate] = useState('');
  const [formEffort, setFormEffort] = useState('');
  const [formRecurring, setFormRecurring] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly'>('None');
  const [formTags, setFormTags] = useState('');
  const [formChecklist, setFormChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (task && !editing) {
      setFormTitle(task.title);
      setFormDesc(task.description);
      setFormPriority(task.priority);
      setFormStatus(task.status);
      setFormDueDate(task.dueDate || '');
      setFormEffort(task.effortEstimateHours?.toString() || '');
      setFormRecurring(task.recurring);
      setFormTags(task.tags.join(', '));
      setFormChecklist(task.checklist);
    }
  }, [task?.id, editing]);

  if (isLoading || !task) {
    return (
      <div>
        <button className="back-button" onClick={onBack}>← Back</button>
        <p className="muted-text">Loading task…</p>
      </div>
    );
  }

  const currentTask = task!;

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    updateTask.mutate({
      id: currentTask.id,
      updates: {
        title: formTitle.trim(),
        description: formDesc.trim(),
        priority: formPriority,
        status: formStatus,
        dueDate: formDueDate || null,
        effortEstimateHours: formEffort ? parseInt(formEffort) : null,
        recurring: formRecurring,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        checklist: formChecklist,
      },
    });
    setEditing(false);
  }

  function handleDelete() {
    deleteTask.mutate(currentTask.id);
    onBack();
  }

  function handleToggleChecklistItem(itemId: string) {
    toggleChecklistItem.mutate({ taskId: currentTask.id, itemId });
    // Also update local form state
    setFormChecklist(formChecklist.map(item => item.id === itemId ? { ...item, done: !item.done } : item));
  }

  return (
    <div>
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="detail-header-actions">
          {!editing ? (
            <>
              <button
                className={`icon-btn${currentTask.favorite ? ' active' : ''}`}
                onClick={() => toggleFavorite.mutate(currentTask.id)}
                title="Favorite"
              >
                ★
              </button>
              <button className="icon-btn" onClick={() => setEditing(true)} title="Edit">✏️</button>
              <button className="icon-btn delete" onClick={() => setShowDeleteConfirm(true)} title="Delete">🗑️</button>
            </>
          ) : (
            <button className="icon-btn" onClick={() => setEditing(false)}>✕</button>
          )}
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

      {!editing ? (
        <>
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
                            onChange={() => handleToggleChecklistItem(item.id)}
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
        </>
      ) : (
        <form onSubmit={handleSaveEdit} className="edit-form tasks-edit-form">
          <h2 className="modal-title">Edit task</h2>

          <div className="field">
            <label htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="edit-desc">Description</label>
            <textarea
              id="edit-desc"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              rows={2}
            />
          </div>

          <div className="edit-form-row">
            <div className="field">
              <label htmlFor="edit-status">Status</label>
              <select id="edit-status" value={formStatus} onChange={(e) => setFormStatus(e.target.value as TaskStatus)}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-priority">Priority</label>
              <select id="edit-priority" value={formPriority} onChange={(e) => setFormPriority(e.target.value as TaskPriority)}>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-due">Due date</label>
              <input id="edit-due" type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
            </div>
          </div>

          <div className="edit-form-row">
            <div className="field">
              <label htmlFor="edit-effort">Effort (hours)</label>
              <input id="edit-effort" type="number" value={formEffort} onChange={(e) => setFormEffort(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="edit-recurring">Recurring</label>
              <select id="edit-recurring" value={formRecurring} onChange={(e) => setFormRecurring(e.target.value as any)}>
                <option value="None">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="edit-tags">Tags</label>
            <input
              id="edit-tags"
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="work, urgent, feature"
            />
          </div>

          <div className="edit-form-actions">
            <button type="button" className="modal-cancel" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="modal-submit" disabled={updateTask.isPending}>
              {updateTask.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
