import { CalendarWidget } from '../components/CalendarWidget';

export function CalendarPage() {
  return (
    <div>
      <h1 className="page-title">Calendar</h1>
      <p className="page-date">Pulled live from Tasks and Journal — no data of its own.</p>
      <CalendarWidget variant="full" />
    </div>
  );
}
