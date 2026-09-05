import { FormEvent, useEffect, useState } from 'react';
import { useDeleteEntry, useEntry, useUpdateEntry } from '../hooks/useEntries';
import type { Entry, EntryStatus, EntryPriority, EntryType, EntryUpdate } from '../types/entry';

const TYPES: EntryType[] = ['Note', 'Idea', 'Problem', 'Solution', 'Reminder', 'Reference', 'Decision', 'Meeting Note'];
const STATUSES: EntryStatus[] = ['Open', 'In Progress', 'Done', 'Archived'];

interface EntryDetailPageProps {
  entryId: string;
  onBack: () => void;
}

export function EntryDetailPage({ entryId, onBack }: EntryDetailPageProps) {
  const { data: entry, isLoading } = useEntry(entryId);
  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<EntryType>('Note');
  const [formStatus, setFormStatus] = useState<EntryStatus>('Open');
  const [formPriority, setFormPriority] = useState<EntryPriority>('Medium');
  const [formTags, setFormTags] = useState('');
  const [formDueDate, setFormDueDate] = useState('');

  useEffect(() => {
    if (entry && !editing) {
      setFormTitle(entry.title);
      setFormDesc(entry.description);
      setFormType(entry.type);
      setFormStatus(entry.status);
      setFormPriority(entry.priority);
      setFormTags(entry.tags.join(', '));
      setFormDueDate(entry.dueDate || '');
    }
  }, [entry?.id, editing]);

  if (isLoading || !entry) return <div><button className="back-button" onClick={onBack}>← Back</button><p>Loading…</p></div>;

  const currentEntry = entry!;

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    updateEntry.mutate({
      id: currentEntry.id,
      updates: {
        title: formTitle.trim(),
        description: formDesc.trim(),
        type: formType,
        status: formStatus,
        priority: formPriority,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        dueDate: formDueDate || null,
      },
    });
    setEditing(false);
  }

  return (
    <div>
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="detail-header-actions">
          {!editing && (
            <>
              <button className="icon-btn" onClick={() => setEditing(true)}>✏️</button>
              <button className="icon-btn delete" onClick={() => setShowDeleteConfirm(true)}>🗑️</button>
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="confirm-dialog">
          <p>Delete this entry? This cannot be undone.</p>
          <div className="confirm-actions">
            <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button className="delete" onClick={() => { deleteEntry.mutate(currentEntry.id); onBack(); }}>Delete</button>
          </div>
        </div>
      )}

      {!editing ? (
        <>
          <h1 className="page-title">{currentEntry.title}</h1>
          <div className="entry-detail-meta">
            <span className="entry-type-badge">{currentEntry.type}</span>
            <span className={`entry-status-badge status-${currentEntry.status.replace(' ', '-').toLowerCase()}`}>{currentEntry.status}</span>
            <span className={`entry-priority-badge priority-${currentEntry.priority.toLowerCase()}`}>{currentEntry.priority}</span>
            {currentEntry.dueDate && <span className="entry-due">Due {currentEntry.dueDate}</span>}
          </div>
          <div className="detail-panel">
            <div className="detail-row"><div className="detail-label">Description</div><div className="detail-value">{currentEntry.description}</div></div>
            {currentEntry.tags.length > 0 && <div className="detail-row"><div className="detail-label">Tags</div><div className="detail-value">{currentEntry.tags.map(t => <span key={t} className="tag-badge">#{t}</span>)}</div></div>}
          </div>
        </>
      ) : (
        <form onSubmit={handleSaveEdit} className="edit-form entries-edit-form">
          <h2 className="modal-title">Edit entry</h2>
          <div className="field"><label>Title</label><input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required /></div>
          <div className="field"><label>Description</label><textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} /></div>
          <div className="edit-form-row">
            <div className="field"><label>Type</label><select value={formType} onChange={(e) => setFormType(e.target.value as EntryType)}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="field"><label>Status</label><select value={formStatus} onChange={(e) => setFormStatus(e.target.value as EntryStatus)}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="field"><label>Priority</label><select value={formPriority} onChange={(e) => setFormPriority(e.target.value as EntryPriority)}><option>Low</option><option>Medium</option><option>High</option></select></div>
          </div>
          <div className="field"><label>Due date</label><input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} /></div>
          <div className="field"><label>Tags</label><input type="text" value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="work, urgent" /></div>
          <div className="edit-form-actions"><button type="button" className="modal-cancel" onClick={() => setEditing(false)}>Cancel</button><button type="submit" className="modal-submit">Save changes</button></div>
        </form>
      )}
    </div>
  );
}
