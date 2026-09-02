import { FormEvent, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateJournalEntry, useJournalEntries, useJournalStreak } from '../hooks/useJournal';
import type { JournalEntry, JournalLogType, JournalDraft } from '../types/journal';

const LOG_TYPES: JournalLogType[] = ['Daily', 'Office', 'Personal', 'Meeting'];
type SubTab = 'all' | 'by-type' | 'by-mood' | 'favorites';
type SortKey = 'date' | 'mood';

// Icon components
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="9" y1="4" x2="9" y2="22" />
      <line x1="15" y1="4" x2="15" y2="22" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9" y2="9.01" />
      <line x1="15" y1="9" x2="15" y2="9.01" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12 2 15.09 10.26 24 10.27 17.55 16.64 19.64 25.02 12 19.65 4.36 25.02 6.45 16.64 0 10.27 8.91 10.26 12 2" />
    </svg>
  );
}

const SUB_TABS: { key: SubTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'all', label: 'All entries', icon: CalendarIcon },
  { key: 'by-type', label: 'By type', icon: TagIcon },
  { key: 'by-mood', label: 'By mood', icon: SmileIcon },
  { key: 'favorites', label: 'Favorites', icon: StarIcon },
];

interface JournalListPageProps {
  onOpenEntry: (id: string) => void;
}

export function JournalListPage({ onOpenEntry }: JournalListPageProps) {
  const { data: entries, isLoading } = useJournalEntries();
  const { data: streak } = useJournalStreak();
  const createEntry = useCreateJournalEntry();

  const [subTab, setSubTab] = useState<SubTab>('all');
  const [search, setSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState<JournalLogType | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [modalOpen, setModalOpen] = useState(false);

  const logTypes = useMemo(() => {
    const set = new Set((entries ?? []).map((e) => e.logType));
    return ['All', ...Array.from(set)] as (JournalLogType | 'All')[];
  }, [entries]);

  const filtered = useMemo(() => {
    let list = entries ?? [];

    // Filter by search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.content.toLowerCase().includes(q) ||
          e.wins.some((w) => w.toLowerCase().includes(q)) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Filter by log type
    if (logTypeFilter !== 'All') {
      list = list.filter((e) => e.logType === logTypeFilter);
    }

    // Sub-tab filtering
    if (subTab === 'by-type') {
      // Keep all, shown grouped by type
    } else if (subTab === 'by-mood') {
      // Keep all, shown grouped by mood
    } else if (subTab === 'favorites') {
      // Entries with tags containing 'favorite' or mood >= 4
      list = list.filter((e) => e.tags.includes('favorite') || e.mood >= 4);
    }

    // Sort
    const sorted = [...list];
    if (sortKey === 'mood') {
      sorted.sort((a, b) => b.mood - a.mood);
    } else {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return sorted;
  }, [entries, search, logTypeFilter, sortKey, subTab]);

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-current">Journal</span>
      </div>
      <h1 className="page-title">Journal</h1>
      <p className="page-date">
        {streak !== undefined ? `${streak} day streak` : 'Record your journey'}
      </p>

      <div className="sub-tabs">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`sub-tab${subTab === tab.key ? ' active' : ''}`}
              onClick={() => setSubTab(tab.key)}
            >
              <span className="sub-tab-icon"><Icon /></span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="journal-toolbar">
        <input
          type="text"
          placeholder="Search entries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={logTypeFilter} onChange={(e) => setLogTypeFilter(e.target.value as JournalLogType | 'All')}>
          {logTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
          <option value="date">Recent first</option>
          <option value="mood">Mood (best first)</option>
        </select>
        <button className="journal-add-btn" onClick={() => setModalOpen(true)}>+ Add entry</button>
      </div>

      {isLoading && <p className="muted-text">Loading journal…</p>}

      {subTab === 'all' && (
        <div className="journal-list">
          {filtered.map((entry) => (
            <JournalListCard key={entry.id} entry={entry} onOpen={() => onOpenEntry(entry.id)} />
          ))}
          {!isLoading && filtered.length === 0 && <p className="muted-text">No entries match these filters.</p>}
        </div>
      )}

      {subTab === 'by-type' && (
        <JournalByType filtered={filtered} isLoading={isLoading} onOpenEntry={onOpenEntry} />
      )}

      {subTab === 'by-mood' && (
        <JournalByMood filtered={filtered} isLoading={isLoading} onOpenEntry={onOpenEntry} />
      )}

      {subTab === 'favorites' && (
        <div className="journal-list">
          {filtered.map((entry) => (
            <JournalListCard key={entry.id} entry={entry} onOpen={() => onOpenEntry(entry.id)} />
          ))}
          {!isLoading && filtered.length === 0 && <p className="muted-text">No favorite entries yet.</p>}
        </div>
      )}

      {modalOpen && (
        <AddJournalModal
          onClose={() => setModalOpen(false)}
          onSubmit={(draft) => {
            createEntry.mutate(draft);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function JournalListCard({ entry, onOpen }: { entry: JournalEntry; onOpen: () => void }) {
  return (
    <div className="journal-card" onClick={onOpen}>
      <div className="journal-card-top">
        <span className="entry-type-badge">{entry.logType}</span>
        <span className="journal-date">{entry.date}</span>
        <div className="mood-picker readonly">
          {[1, 2, 3, 4, 5].map((m) => (
            <span key={m} className={`mood-dot${m <= entry.mood ? ' active' : ''}`} />
          ))}
        </div>
      </div>
      <p className="entry-desc">{entry.content.substring(0, 120)}…</p>
      {entry.tags.length > 0 && (
        <div className="journal-tags">
          {entry.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="tag-badge">{tag}</span>
          ))}
          {entry.tags.length > 2 && <span className="tag-badge muted">+{entry.tags.length - 2}</span>}
        </div>
      )}
    </div>
  );
}

function JournalByType({
  filtered,
  isLoading,
  onOpenEntry,
}: {
  filtered: JournalEntry[];
  isLoading: boolean;
  onOpenEntry: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const byType = new Map<string, JournalEntry[]>();
    for (const entry of filtered) {
      if (!byType.has(entry.logType)) byType.set(entry.logType, []);
      byType.get(entry.logType)!.push(entry);
    }
    return byType;
  }, [filtered]);

  return (
    <div className="kb-groups">
      {LOG_TYPES.map((type) => {
        const items = grouped.get(type) ?? [];
        return (
          <div key={type} className="kb-folder">
            <div className="kb-folder-label">{type}</div>
            {items.length > 0 ? (
              <div className="journal-list">
                {items.map((entry) => (
                  <JournalListCard key={entry.id} entry={entry} onOpen={() => onOpenEntry(entry.id)} />
                ))}
              </div>
            ) : (
              <p className="muted-text">No entries</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function JournalByMood({
  filtered,
  isLoading,
  onOpenEntry,
}: {
  filtered: JournalEntry[];
  isLoading: boolean;
  onOpenEntry: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const byMood = new Map<number, JournalEntry[]>();
    for (const entry of filtered) {
      if (!byMood.has(entry.mood)) byMood.set(entry.mood, []);
      byMood.get(entry.mood)!.push(entry);
    }
    // Sort by mood descending
    return new Map([...byMood.entries()].sort((a, b) => b[0] - a[0]));
  }, [filtered]);

  const moodLabels = {
    5: 'Great 🌟',
    4: 'Good 😊',
    3: 'Okay 😐',
    2: 'Tough 😔',
    1: 'Rough 😞',
  };

  return (
    <div className="kb-groups">
      {Array.from(grouped.entries()).map(([mood, items]) => (
        <div key={mood} className="kb-folder">
          <div className="kb-folder-label">{moodLabels[mood as keyof typeof moodLabels]}</div>
          {items.length > 0 ? (
            <div className="journal-list">
              {items.map((entry) => (
                <JournalListCard key={entry.id} entry={entry} onOpen={() => onOpenEntry(entry.id)} />
              ))}
            </div>
          ) : (
            <p className="muted-text">No entries</p>
          )}
        </div>
      ))}
    </div>
  );
}

function AddJournalModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (draft: JournalDraft) => void;
}) {
  const [logType, setLogType] = useState<JournalLogType>('Daily');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [wins, setWins] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [learnings, setLearnings] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [tags, setTags] = useState('');

  function parseList(value: string): string[] {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({
      date: new Date().toISOString().slice(0, 10),
      logType,
      content: content.trim(),
      wins: parseList(wins),
      mistakes: parseList(mistakes),
      learnings: parseList(learnings),
      gratitude: parseList(gratitude),
      mood,
      tags: parseList(tags),
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add journal entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="journal-modal-top">
            <div className="field">
              <label htmlFor="log-type">Type</label>
              <select id="log-type" value={logType} onChange={(e) => setLogType(e.target.value as JournalLogType)}>
                {LOG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Mood</label>
              <div className="mood-picker">
                {[1, 2, 3, 4, 5].map((m) => (
                  <button
                    type="button"
                    key={m}
                    className={`mood-dot${mood === m ? ' active' : ''}`}
                    onClick={() => setMood(m)}
                    aria-label={`Mood ${m} of 5`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="content">What happened today?</label>
            <textarea
              id="content"
              placeholder="Describe your day…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="journal-modal-lists">
            <div className="field">
              <label htmlFor="wins">Wins (comma separated)</label>
              <input
                id="wins"
                type="text"
                placeholder="e.g., Shipped feature, Great meeting"
                value={wins}
                onChange={(e) => setWins(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="mistakes">Mistakes (comma separated)</label>
              <input
                id="mistakes"
                type="text"
                placeholder="e.g., Forgot deadline, Miscommunication"
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="learnings">Learnings (comma separated)</label>
              <input
                id="learnings"
                type="text"
                placeholder="e.g., Process improvement, Technical insight"
                value={learnings}
                onChange={(e) => setLearnings(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="gratitude">Gratitude (comma separated)</label>
              <input
                id="gratitude"
                type="text"
                placeholder="e.g., Good team support, Clear weather"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              id="tags"
              type="text"
              placeholder="e.g., work, important, favorite"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="auth-submit">Save entry</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
