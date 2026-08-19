import { FormEvent, useMemo, useState } from 'react';
import { useCreateKnowledgeItem, useKnowledgeItems } from '../hooks/useKnowledge';
import type { KnowledgeCategory, KnowledgeItem } from '../types/knowledge';

const CATEGORIES: KnowledgeCategory[] = ['Technical', 'Office', 'Personal', 'Research'];

export function KnowledgeBasePage() {
  const { data: items, isLoading } = useKnowledgeItems();
  const createItem = useCreateKnowledgeItem();

  const [categoryFilter, setCategoryFilter] = useState<KnowledgeCategory | 'All'>('All');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>('Technical');

  const filtered = useMemo(() => {
    if (!items) return [];
    return categoryFilter === 'All' ? items : items.filter((i) => i.category === categoryFilter);
  }, [items, categoryFilter]);

  const grouped = useMemo(() => {
    const groups = new Map<string, KnowledgeItem[]>();
    for (const item of filtered) {
      const key = item.folder ?? 'Unsorted';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createItem.mutate({ title: newTitle.trim(), content: '', category: newCategory, folder: null, tags: [] });
    setNewTitle('');
  }

  return (
    <div>
      <h1 className="page-title">Knowledge Base</h1>
      <p className="page-date">Store and organize reference material, docs, and snippets.</p>

      <form className="entry-quickadd" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New knowledge item…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as KnowledgeCategory)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" disabled={createItem.isPending || !newTitle.trim()}>
          {createItem.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="entries-toolbar">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as KnowledgeCategory | 'All')}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="entries-count">{filtered.length} item{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {isLoading && <p className="muted-text">Loading knowledge base…</p>}

      <div className="kb-groups">
        {grouped.map(([folder, folderItems]) => (
          <div className="kb-folder" key={folder}>
            <div className="kb-folder-label">{folder}</div>
            <div className="entry-list">
              {folderItems.map((item) => (
                <div className="entry-card" key={item.id}>
                  <div className="entry-card-top">
                    <span className="entry-type-badge">{item.category}</span>
                  </div>
                  <div className="entry-title">{item.title}</div>
                  {item.content && <p className="entry-desc">{item.content}</p>}
                  {item.tags.length > 0 && (
                    <div className="entry-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="entry-tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
