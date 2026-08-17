import { FormEvent, useState } from 'react';
import { useCreateJournalEntry, useJournalEntries, useJournalStreak } from '../hooks/useJournal';
import type { JournalEntry, JournalLogType } from '../types/journal';

const LOG_TYPES: JournalLogType[] = ['Daily', 'Office', 'Personal', 'Meeting'];

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function JournalPage() {
  const { data: entries, isLoading } = useJournalEntries();
  const { data: streak } = useJournalStreak();
  const createEntry = useCreateJournalEntry();

  const [logType, setLogType] = useState<JournalLogType>('Daily');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [wins, setWins] = useState('');
  const [gratitude, setGratitude] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    createEntry.mutate({
      date: new Date().toISOString().slice(0, 10),
      logType,
      content: content.trim(),
      wins: parseList(wins),
      mistakes: [],
      learnings: [],
      gratitude: parseList(gratitude),
      mood,
      tags: [],
    });
    setContent('');
    setWins('');
    setGratitude('');
    setMood(3);
  }

  return (
    <div>
      <h1 className="page-title">Journal</h1>
      <p className="page-date">
        {streak !== undefined ? `${streak} day streak` : 'Record your journey'}
      </p>

      <form className="journal-composer" onSubmit={handleSubmit}>
        <div className="journal-composer-top">
          <select value={logType} onChange={(e) => setLogType(e.target.value as JournalLogType)}>
            {LOG_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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
        <textarea
          placeholder="What happened today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <div className="journal-composer-lists">
          <input
            type="text"
            placeholder="Wins (comma separated)"
            value={wins}
            onChange={(e) => setWins(e.target.value)}
          />
          <input
            type="text"
            placeholder="Gratitude (comma separated)"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
          />
        </div>
        <button type="submit" disabled={createEntry.isPending || !content.trim()}>
          {createEntry.isPending ? 'Saving…' : 'Save entry'}
        </button>
      </form>

      {isLoading && <p className="muted-text">Loading journal…</p>}

      <div className="journal-timeline">
        {entries?.map((entry) => (
          <JournalCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  return (
    <div className="journal-entry">
      <div className="journal-entry-top">
        <span className="entry-type-badge">{entry.logType}</span>
        <span className="journal-date">{entry.date}</span>
        <div className="mood-picker readonly">
          {[1, 2, 3, 4, 5].map((m) => (
            <span key={m} className={`mood-dot${m <= entry.mood ? ' active' : ''}`} />
          ))}
        </div>
      </div>
      <p className="entry-desc">{entry.content}</p>
      {(entry.wins.length > 0 || entry.gratitude.length > 0 || entry.learnings.length > 0) && (
        <div className="journal-lists">
          {entry.wins.length > 0 && (
            <div className="journal-list-row">
              <span className="journal-list-label wins">Wins</span>
              {entry.wins.join(' · ')}
            </div>
          )}
          {entry.learnings.length > 0 && (
            <div className="journal-list-row">
              <span className="journal-list-label learnings">Learnings</span>
              {entry.learnings.join(' · ')}
            </div>
          )}
          {entry.gratitude.length > 0 && (
            <div className="journal-list-row">
              <span className="journal-list-label gratitude">Gratitude</span>
              {entry.gratitude.join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
