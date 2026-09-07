import { useState } from 'react';
import { BankingListPage } from './BankingListPage';
import { BankAccountDetailPage } from './BankAccountDetailPage';

export function BankingModule() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  if (selectedAccountId) {
    return <BankAccountDetailPage accountId={selectedAccountId} onBack={() => setSelectedAccountId(null)} />;
  }
  return <BankingListPage onOpenAccount={setSelectedAccountId} />;
}
