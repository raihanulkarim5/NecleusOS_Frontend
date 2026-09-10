import { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDeleteKnowledgeItem, useKnowledgeItem, useUpdateKnowledgeItem } from '../hooks/useKnowledge';
import { RichNotesEditor } from '../components/RichNotesEditor';
import type { KnowledgeCategory } from '../types/knowledge';

const CATEGORIES: KnowledgeCategory[] = ['Technical', 'Office', 'Personal', 'Research'];

interface KnowledgeDetailPageProps {
  itemId: string;
  onBack: () => void;
}

export function KnowledgeDetailPage({ itemId, onBack }: KnowledgeDetailPageProps) {
  const { data: item, isLoading } = useKnowledgeItem(itemId);
  const updateItem = useUpdateKnowledgeItem();
  const deleteItem = useDeleteKnowledgeItem();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading || !item) {
    return (
      <div>
        <button className="back-button" onClick={onBack}>← Back</button>
        <p className="muted-text">Loading…</p>
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
            title={item.favorite ? 'Unfavorite' : 'Favorite'}
            onClick={() => updateItem.mutate({ id: item.id, updates: { favorite: !item.favorite } })}
          >
            {item.favorite ? '⭐' : '☆'}
          </button>
          <button className="icon-btn" onClick={() => setEditing(true)}>✏️</button>
          <button className="icon-btn delete" onClick={() => setShowDeleteConfirm(true)}>🗑️</button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="confirm-dialog">
          <p>Delete this knowledge item? This cannot be undone.</p>
          <div className="confirm-actions">
            <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button className="delete" onClick={() => { deleteItem.mutate(item.id); onBack(); }}>Delete</button>
          </div>
        </div>
      )}

      <h1 className="page-title">{item.title}</h1>
      <div className="entry-detail-meta">
        <span className="entry-type-badge">{item.category}</span>
        {item.folder && <span className="tag-badge">📁 {item.folder}</span>}
        {item.tags.map(t => <span key={t} className="tag-badge">#{t}</span>)}
      </div>

      <div className="detail-panel">
        {item.content ? (
          <div className="detail-value rich-content" dangerouslySetInnerHTML={{ __html: item.content }} />
        ) : (
          <p className="muted-text">No content yet. Click the pencil icon to add some.</p>
        )}
      </div>

      {editing && (
        <EditKnowledgeModal
          initial={item}
          onClose={() => setEditing(false)}
          onSave={(updates) => { updateItem.mutate({ id: item.id, updates }); setEditing(false); }}
        />
      )}
    </div>
  );
}

function EditKnowledgeModal({
  initial, onClose, onSave,
}: {
  initial: { title: string; category: KnowledgeCategory; folder: string | null; tags: string[]; content: string };
  onClose: () => void;
  onSave: (updates: { title: string; category: KnowledgeCategory; folder: string | null; tags: string[]; content: string }) => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState<KnowledgeCategory>(initial.category);
  const [folder, setFolder] = useState(initial.folder ?? '');
  const [tags, setTags] = useState(initial.tags.join(', '));
  const [content, setContent] = useState(initial.content);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      category,
      folder: folder.trim() || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      content,
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal entries-modal wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Edit knowledge item</h2>
        <form onSubmit={handleSubmit} className="entries-step1-form">
          <div className="entries-step1-row">
            <div className="field">
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label>Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, css" />
            </div>
          </div>

          <div className="entries-step1-row">
            <div className="field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Folder (optional)</label>
              <input type="text" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="e.g., React / TanStack" />
            </div>
          </div>

          <div className="field">
            <label>Content</label>
            <RichNotesEditor value={content} onSave={setContent} placeholder="Write the reference material here…" />
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
