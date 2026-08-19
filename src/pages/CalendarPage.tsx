import { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useEntries } from '../hooks/useEntries';
import { useJournalEntries } from '../hooks/useJournal';

interface AgendaItem {
  date: string;
  label: string;
  kind: 'task' | 'reminder' | 'journal';
}

export function CalendarPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: entries, isLoading: entriesLoading } = useEntries();
  const { data: journalEntries, isLoading: journalLoading } = useJournalEntries();

  const isLoading = tasksLoading || entriesLoading || journalLoading;

  const agenda = useMemo(() => {
    const items: AgendaItem[] = [];

    for (const task of tasks ?? []) {
      if (task.dueDate) items.push({ date: task.dueDate, label: task.title, kind: 'task' });
    }
    for (const entry of entries ?? []) {
      if (entry.type === 'Reminder' && entry.dueDate) {
        items.push({ date: entry.dueDate, label: entry.title, kind: 'reminder' });
      }
    }
    for (const journal of journalEntries ?? []) {
      items.push({ date: journal.date, label: `${journal.logType} log`, kind: 'journal' });
    }

    const grouped = new Map<string, AgendaItem[]>();
    for (const item of items) {
      if (!grouped.has(item.date)) grouped.set(item.date, []);
      grouped.get(item.date)!.push(item);
    }
    return Array.from(grouped.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [tasks, entries, journalEntries]);

  return (
    <div>
      <h1 className="page-title">Calendar</h1>
      <p className="page-date">Pulled live from Tasks, Reminders, and Journal — no data of its own.</p>

      {isLoading && <p className="muted-text">Loading calendar…</p>}

      <div className="calendar-agenda">
        {agenda.map(([date, items]) => (
          <div className="calendar-day" key={date}>
            <div className="calendar-day-label">{date}</div>
            <div className="calendar-day-items">
              {items.map((item, i) => (
                <div className="calendar-item" key={i}>
                  <span className={`calendar-kind-dot kind-${item.kind}`} />
                  <span className="calendar-kind-label">{item.kind}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!isLoading && agenda.length === 0 && <p className="muted-text">Nothing scheduled yet.</p>}
      </div>
    </div>
  );
}
