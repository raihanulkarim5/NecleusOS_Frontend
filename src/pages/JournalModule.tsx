import { useState } from 'react';
import { JournalListPage } from './JournalListPage';
import { JournalDetailPage } from './JournalDetailPage';

export function JournalModule() {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  if (selectedEntryId) {
    return <JournalDetailPage entryId={selectedEntryId} onBack={() => setSelectedEntryId(null)} />;
  }
  return <JournalListPage onOpenEntry={setSelectedEntryId} />;
}
