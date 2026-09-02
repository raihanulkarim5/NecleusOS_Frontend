import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useDeleteJournalEntry, useJournalEntry, useMoveJournalEntry, useUpdateJournalEntry } from '../hooks/useJournal';
import { RichNotesEditor } from '../components/RichNotesEditor';
import { MoveButtons } from '../components/MoveButtons';
import type { JournalEntry, JournalLogType } from '../types/journal';
import type { LinkRef, LinkableType } from '../types/link';

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
  const [editingContent, setEditingContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);

  // Edit form state
  const [formLogType, setFormLogType] = useState<JournalLogType>('Daily');
  const [formDate, setFormDate] = useState('');
  const [formMood, setFormMood] = useState(3);
  const [formWins, setFormWins] = useState('');
  const [formMistakes, setFormMistakes] = useState('');
  const [formLearnings, setFormLearnings] = useState('');
  const [formGratitude, setFormGratitude] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formLinks, setFormLinks] = useState<LinkRef[]>([]);

  // Initialize edit form when entry loads
  useEffect(() => {
    if (entry && !editing) {
      setFormLogType(entry.logType);
      setFormDate(entry.date);
      setFormMood(entry.mood);
      setFormWins(entry.wins.join(', '));
      setFormMistakes(entry.mistakes.join(', '));
      setFormLearnings(entry.learnings.join(', '));
      setFormGratitude(entry.gratitude.join(', '));
      setFormTags(entry.tags.join(', '));
      setFormLinks(entry.links);
      setEditingContent(entry.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id, editing]);

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

  function parseList(value: string): string[] {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function handleStartEdit() {
    setEditing(true);
    setFormLogType(currentEntry.logType);
    setFormDate(currentEntry.date);
    setFormMood(currentEntry.mood);
    setFormWins(currentEntry.wins.join(', '));
    setFormMistakes(currentEntry.mistakes.join(', '));
    setFormLearnings(currentEntry.learnings.join(', '));
    setFormGratitude(currentEntry.gratitude.join(', '));
    setFormTags(currentEntry.tags.join(', '));
    setFormLinks(currentEntry.links);
    setEditingContent(currentEntry.content);
  }

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    updateEntry.mutate({
      id: currentEntry.id,
      updates: {
        logType: formLogType,
        date: formDate,
        mood: formMood,
        content: editingContent,
        wins: parseList(formWins),
        mistakes: parseList(formMistakes),
        learnings: parseList(formLearnings),
        gratitude: parseList(formGratitude),
        tags: parseList(formTags),
        links: formLinks,
      },
    });
    setEditing(false);
  }

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
          {!editing ? (
            <>
              <button className="icon-btn" onClick={handleStartEdit} title="Edit">✏️</button>
              <button className="icon-btn delete" onClick={() => setShowDeleteConfirm(true)} title="Delete">🗑</button>
            </>
          ) : (
            <>
              <button className="icon-btn" onClick={() => setEditing(false)}>✕</button>
            </>
          )}
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

      {!editing ? (
        <>
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
        </>
      ) : (
        <form onSubmit={handleSaveEdit} className="edit-form">
          <h2 className="modal-title">Edit entry</h2>

          <div className="edit-form-row">
            <div className="field">
              <label htmlFor="edit-log-type">Type</label>
              <select
                id="edit-log-type"
                value={formLogType}
                onChange={(e) => setFormLogType(e.target.value as JournalLogType)}
              >
                {LOG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-date">Date</label>
              <input
                id="edit-date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Mood</label>
              <div className="mood-picker">
                {[1, 2, 3, 4, 5].map((m) => (
                  <button
                    type="button"
                    key={m}
                    className={`mood-dot${formMood === m ? ' active' : ''}`}
                    onClick={() => setFormMood(m)}
                    aria-label={`Mood ${m} of 5`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="field">
            <label>Content</label>
            <RichNotesEditor
              value={editingContent}
              onSave={setEditingContent}
              placeholder="Describe your day…"
            />
          </div>

          <div className="edit-form-reflections">
            <div className="field">
              <label htmlFor="edit-wins">Wins (comma separated)</label>
              <input
                id="edit-wins"
                type="text"
                value={formWins}
                onChange={(e) => setFormWins(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="edit-mistakes">Mistakes (comma separated)</label>
              <input
                id="edit-mistakes"
                type="text"
                value={formMistakes}
                onChange={(e) => setFormMistakes(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="edit-learnings">Learnings (comma separated)</label>
              <input
                id="edit-learnings"
                type="text"
                value={formLearnings}
                onChange={(e) => setFormLearnings(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="edit-gratitude">Gratitude (comma separated)</label>
              <input
                id="edit-gratitude"
                type="text"
                value={formGratitude}
                onChange={(e) => setFormGratitude(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="edit-tags">Tags (comma separated)</label>
            <input
              id="edit-tags"
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
            />
          </div>

          <div className="edit-form-actions">
            <button type="button" className="modal-cancel" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="auth-submit" disabled={updateEntry.isPending}>
              {updateEntry.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </div>
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
