import { FormEvent, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBankAccounts, useCreateBankAccount } from '../hooks/useFinance';
import { formatMoney } from '../utils/money';
import type { AccountType, BankAccountDraft } from '../types/finance';

interface BankingListPageProps {
  onOpenAccount: (id: string) => void;
}

export function BankingListPage({ onOpenAccount }: BankingListPageProps) {
  const { data: accounts } = useBankAccounts();
  const createAccount = useCreateBankAccount();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts ?? [];
    const q = search.toLowerCase();
    return (accounts ?? []).filter((a) => a.bankName.toLowerCase().includes(q) || a.branch.toLowerCase().includes(q));
  }, [accounts, search]);

  const totalBalance = (accounts ?? []).reduce((sum, a) => sum + a.balance, 0);

  return (
    <div>
      <div className="banking-toolbar">
        <input
          type="text"
          placeholder="Search banks or branches…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="finance-add-account-btn" onClick={() => setShowAddModal(true)}>+ Add account</button>
      </div>

      <div className="finance-card overall-balance" style={{ marginBottom: 20 }}>
        <div className="card-label">Total Across Accounts</div>
        <div className="card-value">{formatMoney(totalBalance)}</div>
      </div>

      {filtered.length > 0 ? (
        <div className="banking-grid">
          {filtered.map((acc) => (
            <div key={acc.id} className="banking-card" onClick={() => onOpenAccount(acc.id)}>
              <div className="account-header">
                <div className="account-name">{acc.bankName}</div>
                <div className="account-type">{acc.accountType}</div>
              </div>
              <div className="account-number">{acc.accountNumberMasked} · {acc.branch}</div>
              <div className="account-balance">{formatMoney(acc.balance, acc.currency)}</div>
              <div className="banking-card-footer">
                <span className="security-note">🔒 {acc.cards.length} card{acc.cards.length !== 1 ? 's' : ''} · 2FA secured</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No bank accounts yet. Add one to start tracking your banking info.</p>
      )}

      {showAddModal && (
        <AddBankAccountModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(draft) => {
            createAccount.mutate(draft);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddBankAccountModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (draft: BankAccountDraft) => void }) {
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Checking');
  const [accountNumber, setAccountNumber] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [balance, setBalance] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!bankName.trim() || accountNumber.trim().length < 4) return;

    onSubmit({
      bankName: bankName.trim(),
      branch: branch.trim(),
      accountType,
      accountNumberLast4: accountNumber.trim(),
      currency: currency.trim() || 'BDT',
      balance: parseFloat(balance) || 0,
      notes: notes.trim(),
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal finance-modal wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add bank account</h2>
        <form onSubmit={handleSubmit} className="finance-modal-form horizontal">
          <div className="field">
            <label>Bank Name</label>
            <input type="text" placeholder="e.g., First Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Branch</label>
            <input type="text" placeholder="e.g., Gulshan Branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
          </div>

          <div className="field">
            <label>Account Type</label>
            <select value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)}>
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Credit">Credit</option>
            </select>
          </div>
          <div className="field">
            <label>Currency</label>
            <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="BDT" />
          </div>

          <div className="field">
            <label>Account Number (last 4 digits)</label>
            <input type="text" placeholder="e.g., 5678" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} maxLength={4} required />
          </div>
          <div className="field">
            <label>Opening Balance</label>
            <input type="number" placeholder="0.00" value={balance} onChange={(e) => setBalance(e.target.value)} step="0.01" />
          </div>

          <div className="field field-full">
            <label>Other Info (optional)</label>
            <input type="text" placeholder="e.g., joint account, linked to business" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <p className="finance-security-hint field-full">
            🔒 You'll set up a password and PIN for this account after it's created (two-factor secured).
          </p>

          <div className="modal-actions field-full">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Add account</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
