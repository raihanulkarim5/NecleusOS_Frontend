import { FormEvent, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateEntry, useDeleteEntry, useEntries, useUpdateEntry } from '../hooks/useEntries';
import { RichNotesEditor } from '../components/RichNotesEditor';
import type { EntryType } from '../types/entry';

const TYPES: EntryType[] = ['Note', 'Idea', 'Problem/Solution', 'Reminder', 'Reference', 'Decision', 'Meeting Note'];

const TYPE_ICONS: Record<EntryType, string> = {
  'Note': '📝',
  'Idea': '💡',
  'Problem/Solution': '🧩',
  'Reminder': '⏰',
  'Reference': '📎',
  'Decision': '⚖️',
  'Meeting Note': '🗓️',
};

function stripHtml(html: string): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text;
}

interface EntriesListPageProps {
  onOpenEntry: (id: string) => void;
}

export function EntriesListPage({ onOpenEntry }: EntriesListPageProps) {
  const { data: entries } = useEntries();
  const deleteEntry = useDeleteEntry();
  const updateEntry = useUpdateEntry();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntryType | 'All'>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    let list = entries ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || stripHtml(e.description).toLowerCase().includes(q));
    }
    if (typeFilter !== 'All') {
      list = list.filter(e => e.type === typeFilter);
    }
    if (favoritesOnly) {
      list = list.filter(e => e.favorite);
    }
    return list;
  }, [entries, search, typeFilter, favoritesOnly]);

  return (
    <div>
      <div className="breadcrumb"><span className="breadcrumb-current">Entries</span></div>
      <h1 className="page-title">Entries</h1>
      <p className="page-date">Quick-capture notes, ideas, decisions, and everything in between</p>

      <div className="entries-toolbar">
        <input type="text" placeholder="Search entries…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as EntryType | 'All')}>
          <option value="All">All types</option>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
        </select>
        <button
          className={`entries-fav-filter${favoritesOnly ? ' active' : ''}`}
          onClick={() => setFavoritesOnly(f => !f)}
          title="Favorites only"
        >
          {favoritesOnly ? '⭐' : '☆'} Favorites
        </button>
        <button className="entries-add-btn" onClick={() => setShowAddModal(true)}>+ New entry</button>
      </div>

      {filtered.length > 0 ? (
        <div className="entries-grid">
          {filtered.map(entry => (
            <div key={entry.id} className="entry-card" onClick={() => onOpenEntry(entry.id)}>
              <div className="entry-header">
                <span className="entry-type">{TYPE_ICONS[entry.type]} {entry.type}</span>
                <button
                  className="entry-fav-btn"
                  onClick={(e) => { e.stopPropagation(); updateEntry.mutate({ id: entry.id, updates: { favorite: !entry.favorite } }); }}
                >
                  {entry.favorite ? '⭐' : '☆'}
                </button>
              </div>
              <h3 className="entry-title">{entry.title}</h3>
              <p className="entry-desc">
                {entry.description ? `${stripHtml(entry.description).slice(0, 110)}${stripHtml(entry.description).length > 110 ? '…' : ''}` : <em>No details yet — click to add.</em>}
              </p>
              {entry.tags.length > 0 && (
                <div className="entry-tags">{entry.tags.slice(0, 3).map(t => <span key={t} className="tag-badge">#{t}</span>)}</div>
              )}
              <button className="entry-delete" onClick={(e) => { e.stopPropagation(); deleteEntry.mutate(entry.id); }}>🗑️</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No entries match. Try a new search, or create your first entry.</p>
      )}

      {showAddModal && (
        <QuickCaptureModal
          onClose={() => setShowAddModal(false)}
          onOpenCreated={onOpenEntry}
        />
      )}
    </div>
  );
}

/** Two-step quick-capture flow: title + type first (like triaging an inbox item),
 *  then a second step for the full write-up (rich description) and tags. */
function QuickCaptureModal({ onClose, onOpenCreated }: { onClose: () => void; onOpenCreated: (id: string) => void }) {
  const createEntry = useCreateEntry();
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EntryType>('Note');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [creating, setCreating] = useState(false);

  function handleStep1Submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setStep(2);
  }

  function handleSaveForLater() {
    if (!title.trim()) return;
    createEntry.mutate(
      { title: title.trim(), type, description: '', tags: [] },
      { onSuccess: () => onClose() },
    );
  }

  function handleFinalSubmit(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    createEntry.mutate(
      {
        title: title.trim(),
        type,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      },
      { onSuccess: () => onClose() },
    );
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal entries-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="entries-wizard-steps">
          <span className={`wizard-step${step === 1 ? ' active' : ''}`}>1. Capture</span>
          <span className="wizard-step-arrow">→</span>
          <span className={`wizard-step${step === 2 ? ' active' : ''}`}>2. Details</span>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="entries-step1-form">
            <h2 className="modal-title">What's on your mind?</h2>
            <div className="field">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g., Modal stacking context bug"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label>Type</label>
              <div className="entry-type-picker">
                {TYPES.map(t => (
                  <button
                    type="button"
                    key={t}
                    className={`entry-type-chip${type === t ? ' active' : ''}`}
                    onClick={() => setType(t)}
                  >
                    {TYPE_ICONS[t]} {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-actions entries-step1-actions">
              <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
              <button type="button" className="entries-save-later-btn" onClick={handleSaveForLater} disabled={!title.trim()}>
                Save & add details later
              </button>
              <button type="submit" className="modal-submit">Next: Add details →</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="entries-step2-form">
            <h2 className="modal-title">{TYPE_ICONS[type]} {title}</h2>
            <div className="field">
              <label>Description</label>
              <RichNotesEditor value={description} onSave={setDescription} placeholder="Write the full details here…" />
            </div>
            <div className="field">
              <label>Tags</label>
              <input type="text" placeholder="work, urgent, idea" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button type="button" className="modal-cancel" onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className="modal-submit" disabled={creating}>Create entry</button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
