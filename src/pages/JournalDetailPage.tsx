import { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDeleteJournalEntry, useJournalEntry, useMoveJournalEntry, useUpdateJournalEntry } from '../hooks/useJournal';
import { RichNotesEditor } from '../components/RichNotesEditor';
import { MoveButtons } from '../components/MoveButtons';
import type { JournalEntry, JournalLogType } from '../types/journal';

const LOG_TYPES: JournalLogType[] = ['Daily', 'Office', 'Personal', 'Meeting'];

type SubTab = 'overview' | 'reflections' | 'links';

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="8.01" />
    </svg>
  );
}

function FeatherIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const SUB_TABS: { key: SubTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'overview', label: 'Overview', icon: InfoIcon },
  { key: 'reflections', label: 'Reflections', icon: FeatherIcon },
  { key: 'links', label: 'Links', icon: LinkIcon },
];

interface JournalDetailPageProps {
  entryId: string;
  onBack: () => void;
}

export function JournalDetailPage({ entryId, onBack }: JournalDetailPageProps) {
  const { data: entry, isLoading } = useJournalEntry(entryId);
  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();
  const moveEntry = useMoveJournalEntry();

  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);

  if (isLoading || !entry) {
    return (
      <div>
        <button className="back-button" onClick={onBack}>← Back</button>
        <p className="muted-text">Loading entry…</p>
      </div>
    );
  }

  // Narrow type for TypeScript
  const currentEntry = entry!;

  function handleDelete() {
    deleteEntry.mutate(currentEntry.id);
    onBack();
  }

  function handleMoveUp() {
    moveEntry.mutate({ id: currentEntry.id, direction: 'up' });
  }

  function handleMoveDown() {
    moveEntry.mutate({ id: currentEntry.id, direction: 'down' });
  }

  return (
    <div>
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="detail-header-actions">
          <MoveButtons canMoveUp={true} canMoveDown={true} onMoveUp={handleMoveUp} onMoveDown={handleMoveDown} />
          <button className="icon-btn" onClick={() => setEditing(true)} title="Edit">✏️</button>
          <button className="icon-btn delete" onClick={() => setShowDeleteConfirm(true)} title="Delete">🗑</button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="confirm-dialog">
          <p>Delete this entry? This cannot be undone.</p>
          <div className="confirm-actions">
            <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button className="delete" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}

      <h1 className="page-title">{currentEntry.date}</h1>
      <p className="page-date">{currentEntry.logType}</p>

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

      {subTab === 'overview' && (
        <JournalOverviewTab entry={currentEntry} />
      )}

      {subTab === 'reflections' && (
        <JournalReflectionsTab entry={currentEntry} />
      )}

      {subTab === 'links' && (
        <JournalLinksTab entry={currentEntry} onAddLink={() => setShowAddLink(true)} />
      )}

      {editing && (
        <EditJournalModal
          entry={currentEntry}
          onClose={() => setEditing(false)}
          onSave={(updates) => { updateEntry.mutate({ id: currentEntry.id, updates }); setEditing(false); }}
        />
      )}
    </div>
  );
}

function EditJournalModal({
  entry, onClose, onSave,
}: {
  entry: JournalEntry;
  onClose: () => void;
  onSave: (updates: {
    logType: JournalLogType; date: string; mood: number; content: string;
    wins: string[]; mistakes: string[]; learnings: string[]; gratitude: string[]; tags: string[];
  }) => void;
}) {
  const [logType, setLogType] = useState<JournalLogType>(entry.logType);
  const [date, setDate] = useState(entry.date);
  const [mood, setMood] = useState(entry.mood);
  const [content, setContent] = useState(entry.content);
  const [wins, setWins] = useState(entry.wins.join(', '));
  const [mistakes, setMistakes] = useState(entry.mistakes.join(', '));
  const [learnings, setLearnings] = useState(entry.learnings.join(', '));
  const [gratitude, setGratitude] = useState(entry.gratitude.join(', '));
  const [tags, setTags] = useState(entry.tags.join(', '));

  function parseList(value: string): string[] {
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      logType, date, mood, content,
      wins: parseList(wins),
      mistakes: parseList(mistakes),
      learnings: parseList(learnings),
      gratitude: parseList(gratitude),
      tags: parseList(tags),
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal journal-modal wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Edit entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="edit-form-row">
            <div className="field">
              <label htmlFor="edit-log-type">Type</label>
              <select id="edit-log-type" value={logType} onChange={(e) => setLogType(e.target.value as JournalLogType)}>
                {LOG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-date">Date</label>
              <input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
            <label>Content</label>
            <RichNotesEditor value={content} onSave={setContent} placeholder="Describe your day…" />
          </div>

          <div className="journal-modal-reflections">
            <div className="field">
              <label htmlFor="edit-wins">Wins</label>
              <input id="edit-wins" type="text" value={wins} onChange={(e) => setWins(e.target.value)} placeholder="Comma separated" />
            </div>
            <div className="field">
              <label htmlFor="edit-mistakes">Mistakes</label>
              <input id="edit-mistakes" type="text" value={mistakes} onChange={(e) => setMistakes(e.target.value)} placeholder="Comma separated" />
            </div>
            <div className="field">
              <label htmlFor="edit-learnings">Learnings</label>
              <input id="edit-learnings" type="text" value={learnings} onChange={(e) => setLearnings(e.target.value)} placeholder="Comma separated" />
            </div>
            <div className="field">
              <label htmlFor="edit-gratitude">Gratitude</label>
              <input id="edit-gratitude" type="text" value={gratitude} onChange={(e) => setGratitude(e.target.value)} placeholder="Comma separated" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="edit-tags">Tags</label>
            <input id="edit-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Comma separated" />
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

function JournalOverviewTab({ entry }: { entry: JournalEntry }) {
  return (
    <div className="detail-panel">
      <div className="detail-row">
        <div className="detail-label">Date</div>
        <div className="detail-value">{entry.date}</div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Type</div>
        <div className="detail-value"><span className="entry-type-badge">{entry.logType}</span></div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Mood</div>
        <div className="detail-value">
          <div className="mood-picker readonly">
            {[1, 2, 3, 4, 5].map((m) => (
              <span key={m} className={`mood-dot${m <= entry.mood ? ' active' : ''}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Entry</div>
        <div className="detail-value rich-content" dangerouslySetInnerHTML={{ __html: entry.content }} />
      </div>
      {entry.tags.length > 0 && (
        <div className="detail-row">
          <div className="detail-label">Tags</div>
          <div className="detail-value">
            <div className="tag-group">
              {entry.tags.map((tag) => (
                <span key={tag} className="tag-badge">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JournalReflectionsTab({ entry }: { entry: JournalEntry }) {
  return (
    <div className="detail-panel reflections-panel">
      {entry.wins.length > 0 && (
        <div className="reflection-section">
          <div className="reflection-label wins">🏆 Wins</div>
          <ul className="reflection-list">
            {entry.wins.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {entry.mistakes.length > 0 && (
        <div className="reflection-section">
          <div className="reflection-label mistakes">⚠️ Mistakes</div>
          <ul className="reflection-list">
            {entry.mistakes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {entry.learnings.length > 0 && (
        <div className="reflection-section">
          <div className="reflection-label learnings">💡 Learnings</div>
          <ul className="reflection-list">
            {entry.learnings.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {entry.gratitude.length > 0 && (
        <div className="reflection-section">
          <div className="reflection-label gratitude">🙏 Gratitude</div>
          <ul className="reflection-list">
            {entry.gratitude.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {entry.wins.length === 0 &&
        entry.mistakes.length === 0 &&
        entry.learnings.length === 0 &&
        entry.gratitude.length === 0 && (
          <p className="muted-text">No reflections recorded yet.</p>
        )}
    </div>
  );
}

function JournalLinksTab({ entry, onAddLink }: { entry: JournalEntry; onAddLink: () => void }) {
  return (
    <div className="detail-panel links-panel">
      {entry.links.length > 0 ? (
        <div className="link-group">
          {entry.links.map((link) => (
            <div key={`${link.type}-${link.id}`} className="link-item">
              <div className="link-item-type">{link.type}</div>
              <div className="link-item-title">{link.title}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No links yet. Connect this entry to tasks, projects, or other modules.</p>
      )}
      <button className="link-add-btn" onClick={onAddLink}>+ Link item</button>
    </div>
  );
}
