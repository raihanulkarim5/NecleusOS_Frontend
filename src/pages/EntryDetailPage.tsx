import { FormEvent, useEffect, useState } from 'react';
import { useDeleteEntry, useEntry, useUpdateEntry } from '../hooks/useEntries';
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

type SubTab = 'overview' | 'links';

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 15l6-6" />
      <path d="M13 6l1.5-1.5a3.5 3.5 0 015 5L18 11" />
      <path d="M11 18l-1.5 1.5a3.5 3.5 0 01-5-5L6 13" />
    </svg>
  );
}

const SUB_TABS: { key: SubTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'overview', label: 'Overview', icon: OverviewIcon },
  { key: 'links', label: 'Links', icon: LinkIcon },
];

interface EntryDetailPageProps {
  entryId: string;
  onBack: () => void;
}

export function EntryDetailPage({ entryId, onBack }: EntryDetailPageProps) {
  const { data: entry, isLoading } = useEntry(entryId);
  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();
  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<EntryType>('Note');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');

  useEffect(() => {
    if (entry && !editing) {
      setFormTitle(entry.title);
      setFormType(entry.type);
      setFormDescription(entry.description);
      setFormTags(entry.tags.join(', '));
    }
  }, [entry?.id, editing]);

  if (isLoading || !entry) {
    return (
      <div>
        <button className="back-button" onClick={onBack}>← Back</button>
        <p>Loading…</p>
      </div>
    );
  }

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    updateEntry.mutate({
      id: entry!.id,
      updates: {
        title: formTitle.trim(),
        type: formType,
        description: formDescription,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
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
              <button
                className="icon-btn"
                title={entry.favorite ? 'Unfavorite' : 'Favorite'}
                onClick={() => updateEntry.mutate({ id: entry.id, updates: { favorite: !entry.favorite } })}
              >
                {entry.favorite ? '⭐' : '☆'}
              </button>
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
            <button className="delete" onClick={() => { deleteEntry.mutate(entry.id); onBack(); }}>Delete</button>
          </div>
        </div>
      )}

      {!editing ? (
        <>
          <h1 className="page-title">{entry.title}</h1>
          <div className="entry-detail-meta">
            <span className="entry-type-badge">{TYPE_ICONS[entry.type]} {entry.type}</span>
            {entry.tags.map(t => <span key={t} className="tag-badge">#{t}</span>)}
          </div>
        </>
      ) : (
        <form onSubmit={handleSaveEdit} className="edit-form">
          <h2 className="modal-title">Edit entry</h2>
          <div className="edit-form-row">
            <div className="field"><label>Title</label><input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required autoFocus /></div>
            <div className="field">
              <label>Type</label>
              <select value={formType} onChange={(e) => setFormType(e.target.value as EntryType)}>
                {TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <RichNotesEditor value={formDescription} onSave={setFormDescription} placeholder="Write the full details here…" />
          </div>
          <div className="field"><label>Tags</label><input type="text" value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="work, urgent, idea" /></div>
          <div className="edit-form-actions">
            <button type="button" className="modal-cancel" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="modal-submit">Save changes</button>
          </div>
        </form>
      )}

      <div className="sub-tabs">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} className={`sub-tab${subTab === tab.key ? ' active' : ''}`} onClick={() => setSubTab(tab.key)}>
              <span className="sub-tab-icon"><Icon /></span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {subTab === 'overview' && (
        <div className="detail-panel">
          {entry.description ? (
            <div className="detail-value rich-content" dangerouslySetInnerHTML={{ __html: entry.description }} />
          ) : (
            <p className="muted-text">No details yet. Click the pencil icon to add a description.</p>
          )}
        </div>
      )}

      {subTab === 'links' && (
        <div className="detail-panel">
          {entry.links.length > 0 ? (
            entry.links.map((link, i) => <div key={i} className="detail-row"><span className="detail-label">{link.type}</span><span className="detail-value">{link.title}</span></div>)
          ) : (
            <p className="muted-text">No links yet. Cross-module linking is coming soon.</p>
          )}
        </div>
      )}
    </div>
  );
}
