import { FormEvent, useMemo, useState } from 'react';
import { useCreateEntry, useEntries, useToggleFavorite, useUpdateEntryStatus } from '../hooks/useEntries';
import type { Entry, EntryStatus, EntryType } from '../types/entry';

const TYPES: EntryType[] = [
  'Note', 'Idea', 'Problem', 'Solution', 'Reminder', 'Reference', 'Decision', 'Meeting Note',
];
const STATUSES: EntryStatus[] = ['Open', 'In Progress', 'Done', 'Archived'];
const STATUS_CYCLE: Record<EntryStatus, EntryStatus> = {
  Open: 'In Progress',
  'In Progress': 'Done',
  Done: 'Archived',
  Archived: 'Open',
};

export function EntriesPage() {
  const { data: entries, isLoading } = useEntries();
  const createEntry = useCreateEntry();
  const updateStatus = useUpdateEntryStatus();
  const toggleFavorite = useToggleFavorite();

  const [typeFilter, setTypeFilter] = useState<EntryType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<EntryStatus | 'All'>('All');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<EntryType>('Note');

  const filtered = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => {
      const typeOk = typeFilter === 'All' || e.type === typeFilter;
      const statusOk = statusFilter === 'All' || e.status === statusFilter;
      return typeOk && statusOk;
    });
  }, [entries, typeFilter, statusFilter]);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createEntry.mutate({
      title: newTitle.trim(),
      description: '',
      type: newType,
      priority: 'Medium',
      tags: [],
      dueDate: null,
    });
    setNewTitle('');
  }

  return (
    <div>
      <h1 className="page-title">Entries</h1>
      <p className="page-date">Everything is an entry — tasks, notes, decisions, and more, in one place.</p>

      <form className="entry-quickadd" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Quick capture… (title only, refine later)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <select value={newType} onChange={(e) => setNewType(e.target.value as EntryType)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button type="submit" disabled={createEntry.isPending || !newTitle.trim()}>
          {createEntry.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="entries-toolbar">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as EntryType | 'All')}>
          <option value="All">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as EntryStatus | 'All')}>
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="entries-count">{filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}</span>
      </div>

      {isLoading && <p className="muted-text">Loading entries…</p>}

      <div className="entry-list">
        {filtered.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onCycleStatus={() => updateStatus.mutate({ id: entry.id, status: STATUS_CYCLE[entry.status] })}
            onToggleFavorite={() => toggleFavorite.mutate(entry.id)}
          />
        ))}
        {!isLoading && filtered.length === 0 && (
          <p className="muted-text">No entries match these filters.</p>
        )}
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  onCycleStatus,
  onToggleFavorite,
}: {
  entry: Entry;
  onCycleStatus: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="entry-card">
      <div className="entry-card-top">
        <span className="entry-type-badge">{entry.type}</span>
        <button
          className={`entry-fav${entry.favorite ? ' active' : ''}`}
          onClick={onToggleFavorite}
          aria-label={entry.favorite ? 'Unfavorite' : 'Favorite'}
        >
          ★
        </button>
      </div>
      <div className="entry-title">{entry.title}</div>
      {entry.description && <p className="entry-desc">{entry.description}</p>}
      <div className="entry-card-bottom">
        <button className={`entry-status-badge status-${entry.status.replace(' ', '-').toLowerCase()}`} onClick={onCycleStatus}>
          {entry.status}
        </button>
        <span className={`entry-priority priority-${entry.priority.toLowerCase()}`}>{entry.priority}</span>
        {entry.dueDate && <span className="entry-due">{entry.dueDate}</span>}
      </div>
      {entry.tags.length > 0 && (
        <div className="entry-tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="entry-tag">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
