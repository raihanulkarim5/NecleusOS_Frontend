import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEntries } from '../hooks/useEntries';
import { useTasks } from '../hooks/useTasks';
import { useJournalEntries } from '../hooks/useJournal';
import { useProjects } from '../hooks/useProjects';
import { useSkills } from '../hooks/useSkills';
import { useKnowledgeItems } from '../hooks/useKnowledge';
import type { LinkRef, LinkableType } from '../types/link';

const TYPE_LABELS: Record<LinkableType, string> = {
  entry: 'Entry',
  task: 'Task',
  journal: 'Journal',
  project: 'Project',
  skill: 'Skill',
  knowledge: 'Knowledge',
};

const TYPE_ICONS: Record<LinkableType, string> = {
  entry: '📝',
  task: '✅',
  journal: '📔',
  project: '📁',
  skill: '🎯',
  knowledge: '📚',
};

interface PickableItem {
  id: string;
  title: string;
}

interface LinkPickerModalProps {
  /** The type/id of the record we're adding a link *from* — excluded from its own type's list. */
  currentType: LinkableType;
  currentId: string;
  /** Already-linked refs, so we don't offer duplicates. */
  existingLinks: LinkRef[];
  onClose: () => void;
  onSelect: (ref: LinkRef) => void;
}

export function LinkPickerModal({ currentType, currentId, existingLinks, onClose, onSelect }: LinkPickerModalProps) {
  const [type, setType] = useState<LinkableType>(currentType === 'entry' ? 'task' : 'entry');
  const [search, setSearch] = useState('');

  const { data: entries } = useEntries();
  const { data: tasks } = useTasks();
  const { data: journalEntries } = useJournalEntries();
  const { data: projects } = useProjects();
  const { data: skills } = useSkills();
  const { data: knowledgeItems } = useKnowledgeItems();

  const itemsByType: Record<LinkableType, PickableItem[]> = useMemo(() => ({
    entry: (entries ?? []).map((e) => ({ id: e.id, title: e.title })),
    task: (tasks ?? []).map((t) => ({ id: t.id, title: t.title })),
    journal: (journalEntries ?? []).map((j) => ({ id: j.id, title: `${j.logType} — ${j.date}` })),
    project: (projects ?? []).map((p) => ({ id: p.id, title: p.name })),
    skill: (skills ?? []).map((s) => ({ id: s.id, title: s.name })),
    knowledge: (knowledgeItems ?? []).map((k) => ({ id: k.id, title: k.title })),
  }), [entries, tasks, journalEntries, projects, skills, knowledgeItems]);

  const existingKey = (t: LinkableType, id: string) => `${t}:${id}`;
  const existingSet = useMemo(
    () => new Set(existingLinks.map((l) => existingKey(l.type, l.id))),
    [existingLinks],
  );

  const filtered = useMemo(() => {
    let list = itemsByType[type];
    if (type === currentType) list = list.filter((item) => item.id !== currentId);
    list = list.filter((item) => !existingSet.has(existingKey(type, item.id)));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) => item.title.toLowerCase().includes(q));
    }
    return list;
  }, [itemsByType, type, currentType, currentId, existingSet, search]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal link-picker-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Link to…</h2>

        <div className="entry-type-picker link-picker-types">
          {(Object.keys(TYPE_LABELS) as LinkableType[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`entry-type-chip${type === t ? ' active' : ''}`}
              onClick={() => setType(t)}
            >
              {TYPE_ICONS[t]} {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder={`Search ${TYPE_LABELS[type].toLowerCase()}s…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="link-picker-search"
          autoFocus
        />

        <div className="link-picker-results">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className="link-picker-result"
                onClick={() => { onSelect({ type, id: item.id, title: item.title }); onClose(); }}
              >
                <span className="link-picker-result-icon">{TYPE_ICONS[type]}</span>
                {item.title}
              </button>
            ))
          ) : (
            <p className="muted-text">Nothing to link here — try another type or search.</p>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
