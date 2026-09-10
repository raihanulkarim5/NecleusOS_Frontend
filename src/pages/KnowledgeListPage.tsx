import { FormEvent, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateKnowledgeItem, useDeleteKnowledgeItem, useKnowledgeItems, useUpdateKnowledgeItem } from '../hooks/useKnowledge';
import { RichNotesEditor } from '../components/RichNotesEditor';
import type { KnowledgeCategory } from '../types/knowledge';

const CATEGORIES: KnowledgeCategory[] = ['Technical', 'Office', 'Personal', 'Research'];

const CATEGORY_DOTS: Record<KnowledgeCategory, string> = {
  Technical: 'dot-violet',
  Office: 'dot-cyan',
  Personal: 'dot-magenta',
  Research: 'dot-gold',
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

interface KnowledgeListPageProps {
  onOpenItem: (id: string) => void;
}

export function KnowledgeListPage({ onOpenItem }: KnowledgeListPageProps) {
  const { data: items } = useKnowledgeItems();
  const deleteItem = useDeleteKnowledgeItem();
  const updateItem = useUpdateKnowledgeItem();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<KnowledgeCategory | 'All'>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    let list = items ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || stripHtml(i.content).toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') list = list.filter(i => i.category === categoryFilter);
    if (favoritesOnly) list = list.filter(i => i.favorite);
    return list;
  }, [items, search, categoryFilter, favoritesOnly]);

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const key = item.folder ?? 'Unsorted';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <div>
      <div className="breadcrumb"><span className="breadcrumb-current">Knowledge</span></div>
      <h1 className="page-title">Knowledge Base</h1>
      <p className="page-date">Reference material, docs, and snippets — organized by folder</p>

      <div className="entries-toolbar">
        <input type="text" placeholder="Search knowledge base…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as KnowledgeCategory | 'All')}>
          <option value="All">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          className={`entries-fav-filter${favoritesOnly ? ' active' : ''}`}
          onClick={() => setFavoritesOnly(f => !f)}
          title="Favorites only"
        >
          {favoritesOnly ? '⭐' : '☆'} Favorites
        </button>
        <button className="entries-add-btn" onClick={() => setShowAddModal(true)}>+ New item</button>
      </div>

      {grouped.length > 0 ? (
        <div className="kb-groups">
          {grouped.map(([folder, folderItems]) => (
            <div className="kb-folder" key={folder}>
              <div className="kb-folder-label">{folder}</div>
              <div className="entries-grid">
                {folderItems.map((item) => (
                  <div key={item.id} className="entry-card" onClick={() => onOpenItem(item.id)}>
                    <div className="entry-header">
                      <span className="entry-header-left">
                        <span className={`card-dot ${CATEGORY_DOTS[item.category]}`} />
                        <span className="entry-type">{item.category}</span>
                      </span>
                      <button
                        className="entry-fav-btn"
                        onClick={(e) => { e.stopPropagation(); updateItem.mutate({ id: item.id, updates: { favorite: !item.favorite } }); }}
                      >
                        {item.favorite ? '⭐' : '☆'}
                      </button>
                    </div>
                    <h3 className="entry-title">{item.title}</h3>
                    <p className="entry-desc">
                      {item.content ? `${stripHtml(item.content).slice(0, 110)}${stripHtml(item.content).length > 110 ? '…' : ''}` : <em>No content yet — click to add.</em>}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="entry-tags">{item.tags.slice(0, 3).map(t => <span key={t} className="tag-badge">#{t}</span>)}</div>
                    )}
                    <button className="entry-delete" onClick={(e) => { e.stopPropagation(); deleteItem.mutate(item.id); }}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No knowledge items match. Try a new search, or add your first item.</p>
      )}

      {showAddModal && <AddKnowledgeModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddKnowledgeModal({ onClose }: { onClose: () => void }) {
  const createItem = useCreateKnowledgeItem();
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('Technical');
  const [folder, setFolder] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createItem.mutate(
      {
        title: title.trim(),
        category,
        folder: folder.trim() || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        content,
      },
      { onSuccess: () => onClose() },
    );
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal entries-modal wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add knowledge item</h2>
        <form onSubmit={handleSubmit} className="entries-step1-form">
          <div className="entries-step1-row">
            <div className="field">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g., TanStack Query cheatsheet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label>Tags</label>
              <input type="text" placeholder="react, css" value={tags} onChange={(e) => setTags(e.target.value)} />
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
              <input ref={folderInputRef} type="text" placeholder="e.g., React / TanStack" value={folder} onChange={(e) => setFolder(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Content</label>
            <RichNotesEditor value={content} onSave={setContent} placeholder="Write the reference material here…" />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Add item</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
