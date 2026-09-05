import { FormEvent, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateEntry, useDeleteEntry, useEntries } from '../hooks/useEntries';
import type { Entry, EntryDraft, EntryType, EntryPriority, EntryStatus } from '../types/entry';

const TYPES: EntryType[] = ['Note', 'Idea', 'Problem', 'Solution', 'Reminder', 'Reference', 'Decision', 'Meeting Note'];
const STATUSES: EntryStatus[] = ['Open', 'In Progress', 'Done', 'Archived'];

interface EntriesListPageProps {
  onOpenEntry: (id: string) => void;
}

export function EntriesListPage({ onOpenEntry }: EntriesListPageProps) {
  const { data: entries } = useEntries();
  const deleteEntry = useDeleteEntry();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntryType | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    let list = entries ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (typeFilter !== 'All') {
      list = list.filter(e => e.type === typeFilter);
    }
    return list;
  }, [entries, search, typeFilter]);

  return (
    <div>
      <div className="breadcrumb"><span className="breadcrumb-current">Entries</span></div>
      <h1 className="page-title">Entries</h1>
      <p className="page-date">Notes, ideas, problems, decisions, and meeting notes</p>

      <div className="entries-toolbar">
        <input type="text" placeholder="Search entries…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as EntryType | 'All')}>
          <option value="All">All types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="entries-add-btn" onClick={() => setShowAddModal(true)}>+ Add entry</button>
      </div>

      <div className="entries-grid">
        {filtered.map(entry => (
          <div key={entry.id} className="entry-card" onClick={() => onOpenEntry(entry.id)}>
            <div className="entry-header">
              <span className="entry-type">{entry.type}</span>
              <span className={`entry-status status-${entry.status.replace(' ', '-').toLowerCase()}`}>{entry.status}</span>
            </div>
            <h3 className="entry-title">{entry.title}</h3>
            <p className="entry-desc">{entry.description.slice(0, 100)}…</p>
            {entry.tags.length > 0 && <div className="entry-tags">{entry.tags.slice(0, 2).map(t => <span key={t} className="tag-badge">#{t}</span>)}</div>}
            <button className="entry-delete" onClick={(e) => { e.stopPropagation(); deleteEntry.mutate(entry.id); }}>🗑️</button>
          </div>
        ))}
      </div>

      {showAddModal && <AddEntryModal onClose={() => setShowAddModal(false)} onSubmit={(draft) => { useCreateEntry().mutate(draft); setShowAddModal(false); }} />}
    </div>
  );
}

function AddEntryModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (draft: EntryDraft) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EntryType>('Note');
  const [priority, setPriority] = useState<EntryPriority>('Medium');
  const [tags, setTags] = useState('');
  const [dueDate, setDueDate] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      dueDate: dueDate || null,
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal entries-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add entry</h2>
        <form onSubmit={handleSubmit} className="entries-modal-form">
          <div className="field"><label>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus /></div>
          <div className="field"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
          <div className="entries-modal-row">
            <div className="field"><label>Type</label><select value={type} onChange={(e) => setType(e.target.value as EntryType)}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="field"><label>Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value as EntryPriority)}><option>Low</option><option>Medium</option><option>High</option></select></div>
            <div className="field"><label>Due date</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>
          <div className="field"><label>Tags</label><input type="text" placeholder="work, urgent" value={tags} onChange={(e) => setTags(e.target.value)} /></div>
          <div className="modal-actions"><button type="button" className="modal-cancel" onClick={onClose}>Cancel</button><button type="submit" className="modal-submit">Create entry</button></div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
