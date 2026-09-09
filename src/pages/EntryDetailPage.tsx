import { FormEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

  if (isLoading || !entry) {
    return (
      <div>
        <button className="back-button" onClick={onBack}>← Back</button>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="detail-header-actions">
          <button
            className="icon-btn"
            title={entry.favorite ? 'Unfavorite' : 'Favorite'}
            onClick={() => updateEntry.mutate({ id: entry.id, updates: { favorite: !entry.favorite } })}
          >
            {entry.favorite ? '⭐' : '☆'}
          </button>
          <button className="icon-btn" onClick={() => setEditing(true)}>✏️</button>
          <button className="icon-btn delete" onClick={() => setShowDeleteConfirm(true)}>🗑️</button>
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

      <h1 className="page-title">{entry.title}</h1>
      <div className="entry-detail-meta">
        <span className="entry-type-badge">{TYPE_ICONS[entry.type]} {entry.type}</span>
        {entry.tags.map(t => <span key={t} className="tag-badge">#{t}</span>)}
      </div>

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
          {entry.imageUrl && (
            <div className="entry-detail-image"><img src={entry.imageUrl} alt="" /></div>
          )}
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

      {editing && (
        <EditEntryModal
          initial={entry}
          onClose={() => setEditing(false)}
          onSave={(updates) => { updateEntry.mutate({ id: entry.id, updates }); setEditing(false); }}
        />
      )}
    </div>
  );
}

function EditEntryModal({
  initial, onClose, onSave,
}: {
  initial: { title: string; type: EntryType; description: string; tags: string[]; imageUrl: string | null };
  onClose: () => void;
  onSave: (updates: { title: string; type: EntryType; description: string; tags: string[]; imageUrl: string | null }) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial.title);
  const [type, setType] = useState<EntryType>(initial.type);
  const [tags, setTags] = useState(initial.tags.join(', '));
  const [imageUrl, setImageUrl] = useState<string | null>(initial.imageUrl);
  const [imageError, setImageError] = useState('');
  const [description, setDescription] = useState(initial.description);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setImageError('Image is too large (max 4MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      type,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl,
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal entries-modal wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Edit entry</h2>
        <form onSubmit={handleSubmit} className="entries-step1-form">
          <div className="entries-step1-row">
            <div className="field">
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label>Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="work, urgent, idea" />
            </div>
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

          <div className="field">
            <label>Image (optional)</label>
            {!imageUrl ? (
              <button type="button" className="entries-image-upload-btn" onClick={() => fileInputRef.current?.click()}>
                📷 Add an image
              </button>
            ) : (
              <div className="entries-image-preview">
                <img src={imageUrl} alt="Preview" />
                <button type="button" className="entries-image-remove-btn" onClick={() => setImageUrl(null)}>✕ Remove</button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} hidden />
            {imageError && <p className="security-error">{imageError}</p>}
          </div>

          <div className="field">
            <label>Description</label>
            <RichNotesEditor value={description} onSave={setDescription} placeholder="Write the full details here…" />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Save changes</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
