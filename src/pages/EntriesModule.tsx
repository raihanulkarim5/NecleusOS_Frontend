import { useState } from 'react';
import { EntriesListPage } from './EntriesListPage';
import { EntryDetailPage } from './EntryDetailPage';

export function EntriesModule() {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  if (selectedEntryId) {
    return <EntryDetailPage entryId={selectedEntryId} onBack={() => setSelectedEntryId(null)} />;
  }
  return <EntriesListPage onOpenEntry={setSelectedEntryId} />;
}
