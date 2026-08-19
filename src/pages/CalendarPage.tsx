import { useMemo, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useEntries } from '../hooks/useEntries';
import { useJournalEntries } from '../hooks/useJournal';

type AgendaKind = 'task' | 'reminder' | 'journal';

interface AgendaItem {
  date: string;
  label: string;
  kind: AgendaKind;
  detail: string;
  mood?: number;
}

const KIND_LABELS: Record<AgendaKind, string> = {
  task: 'Tasks',
  reminder: 'Reminders',
  journal: 'Journal',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - start.getDay()); // back up to the preceding Sunday

  const days: Date[] = [];
  const cursor = new Date(start);
  // Always render 6 full weeks (42 days) so the grid height stays stable across months.
  for (let i = 0; i < 42; i++) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function CalendarPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: entries, isLoading: entriesLoading } = useEntries();
  const { data: journalEntries, isLoading: journalLoading } = useJournalEntries();
  const isLoading = tasksLoading || entriesLoading || journalLoading;

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [activeFilters, setActiveFilters] = useState<Set<AgendaKind>>(
    new Set(['task', 'reminder', 'journal']),
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));

  const allItems = useMemo(() => {
    const items: AgendaItem[] = [];
    for (const task of tasks ?? []) {
      if (!task.dueDate) continue;
      const checklistPart =
        task.checklist.length > 0
          ? ` · ${task.checklist.filter((c) => c.done).length}/${task.checklist.length} done`
          : '';
      const effortPart = task.effortEstimateHours != null ? ` · ${task.effortEstimateHours}h est.` : '';
      items.push({
        date: task.dueDate,
        label: task.title,
        kind: 'task',
        detail: `${task.status} · ${task.priority} priority${checklistPart}${effortPart}`,
      });
    }
    for (const entry of entries ?? []) {
      if (entry.type === 'Reminder' && entry.dueDate) {
        items.push({
          date: entry.dueDate,
          label: entry.title,
          kind: 'reminder',
          detail: entry.description || `${entry.priority} priority`,
        });
      }
    }
    for (const journal of journalEntries ?? []) {
      const snippet = journal.content.length > 80 ? `${journal.content.slice(0, 80)}…` : journal.content;
      items.push({
        date: journal.date,
        label: `${journal.logType} log`,
        kind: 'journal',
        detail: snippet || 'No notes written',
        mood: journal.mood,
      });
    }
    return items;
  }, [tasks, entries, journalEntries]);

  const filteredItems = useMemo(
    () => allItems.filter((item) => activeFilters.has(item.kind)),
    [allItems, activeFilters],
  );

  const itemsByDate = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    for (const item of filteredItems) {
      if (!map.has(item.date)) map.set(item.date, []);
      map.get(item.date)!.push(item);
    }
    return map;
  }, [filteredItems]);

  const monthGrid = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayKey = toDateKey(new Date());

  function toggleFilter(kind: AgendaKind) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  function shiftMonth(delta: number) {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  const selectedItems = itemsByDate.get(selectedDate) ?? [];

  return (
    <div>
      <h1 className="page-title">Calendar</h1>
      <p className="page-date">Pulled live from Tasks, Reminders, and Journal — no data of its own.</p>

      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
          <span className="calendar-month-label">{monthLabel}</span>
          <button onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
        </div>
        <div className="calendar-filters">
          {(Object.keys(KIND_LABELS) as AgendaKind[]).map((kind) => (
            <button
              key={kind}
              className={`calendar-filter-chip kind-${kind}${activeFilters.has(kind) ? ' active' : ''}`}
              onClick={() => toggleFilter(kind)}
            >
              <span className="calendar-kind-dot" />
              {KIND_LABELS[kind]}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="muted-text">Loading calendar…</p>}

      <div className="calendar-grid-wrap">
        <div className="calendar-weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {monthGrid.map((date) => {
            const key = toDateKey(date);
            const inMonth = date.getMonth() === cursor.getMonth();
            const dayItems = itemsByDate.get(key) ?? [];
            const isSelected = key === selectedDate;
            const isToday = key === todayKey;
            return (
              <button
                key={key}
                className={`calendar-cell${inMonth ? '' : ' outside'}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                onClick={() => setSelectedDate(key)}
              >
                <span className="calendar-cell-date">{date.getDate()}</span>
                <span className="calendar-cell-dots">
                  {dayItems.slice(0, 3).map((item, i) => (
                    <span key={i} className={`calendar-kind-dot kind-${item.kind}`} />
                  ))}
                  {dayItems.length > 3 && <span className="calendar-cell-more">+{dayItems.length - 3}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section>
        <h2 className="section-title">{selectedDate}</h2>
        <div className="stat-card">
          {selectedItems.length === 0 && <p className="muted-text">Nothing on this day.</p>}
          {selectedItems.map((item, i) => (
            <div className="calendar-item" key={i}>
              <span className={`calendar-kind-dot kind-${item.kind}`} />
              <div className="calendar-item-body">
                <div className="calendar-item-top">
                  <span className="calendar-kind-label">{item.kind}</span>
                  <span className="calendar-item-label">{item.label}</span>
                  {item.mood !== undefined && (
                    <span className="mood-picker readonly">
                      {[1, 2, 3, 4, 5].map((m) => (
                        <span key={m} className={`mood-dot${m <= item.mood! ? ' active' : ''}`} />
                      ))}
                    </span>
                  )}
                </div>
                <p className="calendar-item-detail">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
