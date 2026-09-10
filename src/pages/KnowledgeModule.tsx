import { useState } from 'react';
import { KnowledgeListPage } from './KnowledgeListPage';
import { KnowledgeDetailPage } from './KnowledgeDetailPage';

export function KnowledgeModule() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  if (selectedItemId) {
    return <KnowledgeDetailPage itemId={selectedItemId} onBack={() => setSelectedItemId(null)} />;
  }
  return <KnowledgeListPage onOpenItem={setSelectedItemId} />;
}
