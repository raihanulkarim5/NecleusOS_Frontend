import { FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useBankAccount, useUpdateBankAccount, useDeleteBankAccount, useUpdateAccountCredentials,
  useAddCard, useUpdateCard, useDeleteCard, useAddBalanceEntry, useBalanceHistoryByMonth,
} from '../hooks/useFinance';
import type { AccountType, BankCard, BankCardDraft } from '../types/finance';

type SubTab = 'overview' | 'security' | 'cards';

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

const SUB_TABS: { key: SubTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'overview', label: 'Overview', icon: OverviewIcon },
  { key: 'security', label: 'Security', icon: LockIcon },
  { key: 'cards', label: 'Cards', icon: CardIcon },
];

interface BankAccountDetailPageProps {
  accountId: string;
  onBack: () => void;
}

export function BankAccountDetailPage({ accountId, onBack }: BankAccountDetailPageProps) {
  const { data: account, isLoading } = useBankAccount(accountId);
  const updateAccount = useUpdateBankAccount();
  const deleteAccount = useDeleteBankAccount();
  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Checking');
  const [currency, setCurrency] = useState('USD');
  const [balance, setBalance] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (account && !editing) {
      setBankName(account.bankName);
      setBranch(account.branch);
      setAccountType(account.accountType);
      setCurrency(account.currency);
      setBalance(String(account.balance));
      setNotes(account.notes);
    }
  }, [account?.id, editing]);

  if (isLoading || !account) {
    return (
      <div>
        <button className="back-button" onClick={onBack}>← Back</button>
        <p>Loading…</p>
      </div>
    );
  }

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    updateAccount.mutate({
      id: account!.id,
      updates: {
        bankName: bankName.trim(),
        branch: branch.trim(),
        accountType,
        currency: currency.trim() || 'USD',
        balance: parseFloat(balance) || 0,
        notes: notes.trim(),
      },
    });
    setEditing(false);
  }

  return (
    <div>
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="detail-header-actions">
          {!editing && (
            <>
              <button className="icon-btn" onClick={() => setEditing(true)}>✏️</button>
              <button className="icon-btn delete" onClick={() => setShowDeleteConfirm(true)}>🗑️</button>
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="confirm-dialog">
          <p>Delete <strong>{account.bankName}</strong>? This removes the account and all its cards. This cannot be undone.</p>
          <div className="confirm-actions">
            <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button className="delete" onClick={() => { deleteAccount.mutate(account.id); onBack(); }}>Delete</button>
          </div>
        </div>
      )}

      {!editing ? (
        <>
          <h1 className="page-title">{account.bankName}</h1>
          <div className="account-detail-meta">
            <span className="entry-type-badge">{account.accountType}</span>
            <span className="account-number">{account.accountNumberMasked} · {account.branch || 'No branch set'}</span>
            <span className="account-balance-large">${account.balance.toFixed(2)} {account.currency}</span>
          </div>
        </>
      ) : (
        <form onSubmit={handleSaveEdit} className="edit-form">
          <h2 className="modal-title">Edit account</h2>
          <div className="edit-form-row">
            <div className="field"><label>Bank Name</label><input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required /></div>
            <div className="field"><label>Branch</label><input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} /></div>
          </div>
          <div className="edit-form-row">
            <div className="field">
              <label>Account Type</label>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)}>
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
            <div className="field"><label>Currency</label><input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} /></div>
            <div className="field"><label>Balance</label><input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} /></div>
          </div>
          <div className="field"><label>Other Info</label><input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., joint account, linked to business" /></div>
          <div className="edit-form-actions">
            <button type="button" className="modal-cancel" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="modal-submit">Save changes</button>
          </div>
        </form>
      )}

      <div className="sub-tabs">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} className={`sub-tab${subTab === tab.key ? ' active' : ''}`} onClick={() => setSubTab(tab.key)}>
              <span className="sub-tab-icon"><Icon /></span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {subTab === 'overview' && <OverviewTab accountId={account.id} notes={account.notes} branch={account.branch} />}
      {subTab === 'security' && <SecurityTab accountId={account.id} lastVerified={account.credentials.lastVerified} otpEmailEnabled={account.otpEmailEnabled} otpMobileEnabled={account.otpMobileEnabled} />}
      {subTab === 'cards' && <CardsTab accountId={account.id} cards={account.cards} />}
    </div>
  );
}

function OverviewTab({ accountId, notes, branch }: { accountId: string; notes: string; branch: string }) {
  const { data: account } = useBankAccount(accountId);
  const addBalanceEntry = useAddBalanceEntry();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { data: history } = useBalanceHistoryByMonth(accountId, month);
  const [showTopUp, setShowTopUp] = useState(false);

  if (!account) return null;

  return (
    <div className="detail-panel">
      <div className="detail-row"><div className="detail-label">Account Number</div><div className="detail-value">{account.accountNumberMasked}</div></div>
      <div className="detail-row"><div className="detail-label">Branch</div><div className="detail-value">{branch || '—'}</div></div>
      <div className="detail-row"><div className="detail-label">Type</div><div className="detail-value">{account.accountType}</div></div>
      <div className="detail-row"><div className="detail-label">Currency</div><div className="detail-value">{account.currency}</div></div>
      <div className="detail-row"><div className="detail-label">Balance</div><div className="detail-value">${account.balance.toFixed(2)}</div></div>
      <div className="detail-row"><div className="detail-label">Other Info</div><div className="detail-value">{notes || '—'}</div></div>
      <div className="detail-row"><div className="detail-label">Cards on file</div><div className="detail-value">{account.cards.length}</div></div>

      <div className="balance-history-header">
        <h4 className="subsection-title">Balance History</h4>
        <div className="balance-history-controls">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="month-input" />
          <button className="balance-topup-btn" onClick={() => setShowTopUp(true)}>+ Add balance</button>
        </div>
      </div>

      {history && history.length > 0 ? (
        <div className="balance-history-list">
          {history.map((entry) => (
            <div key={entry.id} className="balance-history-row">
              <span>{entry.date} — {entry.note || 'Balance entry'}</span>
              <span className={`balance-history-amount ${entry.amount >= 0 ? 'positive' : 'negative'}`}>
                {entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No balance entries for this month.</p>
      )}

      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          onSubmit={(entry) => { addBalanceEntry.mutate({ id: accountId, entry }); setShowTopUp(false); }}
        />
      )}
    </div>
  );
}

function TopUpModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (entry: { date: string; amount: number; note: string }) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [direction, setDirection] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    onSubmit({ date, amount: direction === 'deposit' ? value : -value, note: note.trim() });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal finance-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add balance entry</h2>
        <form onSubmit={handleSubmit} className="finance-modal-form">
          <div className="finance-modal-row">
            <div className="field">
              <label>Type</label>
              <select value={direction} onChange={(e) => setDirection(e.target.value as 'deposit' | 'withdrawal')}>
                <option value="deposit">Deposit (+)</option>
                <option value="withdrawal">Withdrawal (-)</option>
              </select>
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label>Amount</label>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" required autoFocus />
          </div>
          <div className="field">
            <label>Note (optional)</label>
            <input type="text" placeholder="e.g., Salary, ATM withdrawal" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Save</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function SecurityTab({
  accountId, lastVerified, otpEmailEnabled, otpMobileEnabled,
}: { accountId: string; lastVerified: string; otpEmailEnabled: boolean; otpMobileEnabled: boolean }) {
  const updateCredentials = useUpdateAccountCredentials();
  const updateAccount = useUpdateBankAccount();
  const [showForm, setShowForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!/^\d{4,6}$/.test(pin)) { setError('PIN must be 4–6 digits.'); return; }
    if (pin !== confirmPin) { setError('PINs do not match.'); return; }

    updateCredentials.mutate(
      { id: accountId, updates: { newPassword: password, newPin: pin } },
      {
        onSuccess: () => {
          setSuccess(true);
          setShowForm(false);
          setPassword(''); setConfirmPassword(''); setPin(''); setConfirmPin('');
        },
      },
    );
  }

  return (
    <div className="detail-panel security-panel">
      <div className="security-status">
        <span className="security-icon">🔒</span>
        <div>
          <div className="security-title">Two-factor secured</div>
          <div className="security-subtitle">Password + PIN · last verified {lastVerified}</div>
        </div>
      </div>

      {success && <p className="security-success">✓ Credentials updated successfully.</p>}

      {!showForm ? (
        <button className="modal-submit" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>
          Update password & PIN
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="security-form">
          {error && <p className="security-error">{error}</p>}
          <div className="edit-form-row">
            <div className="field"><label>New Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required /></div>
            <div className="field"><label>Confirm Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
          </div>
          <div className="edit-form-row">
            <div className="field"><label>New PIN</label><input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="4–6 digits" maxLength={6} required /></div>
            <div className="field"><label>Confirm PIN</label><input type="password" inputMode="numeric" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required /></div>
          </div>
          <div className="edit-form-actions">
            <button type="button" className="modal-cancel" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
            <button type="submit" className="modal-submit">Save credentials</button>
          </div>
        </form>
      )}

      <div className="otp-notice">
        <span>🛡️</span>
        <div>
          <div><strong>Two-factor OTP (coming soon)</strong> — once enabled, unlocking this account's credentials or cards will require a one-time code sent to your chosen channel(s).</div>
          <div className="otp-toggle-row">
            <label>
              <input type="checkbox" checked={otpEmailEnabled} onChange={(e) => updateAccount.mutate({ id: accountId, updates: { otpEmailEnabled: e.target.checked } })} />
              Email OTP
            </label>
            <label>
              <input type="checkbox" checked={otpMobileEnabled} onChange={(e) => updateAccount.mutate({ id: accountId, updates: { otpMobileEnabled: e.target.checked } })} />
              Mobile OTP
            </label>
          </div>
        </div>
      </div>

      <p className="security-note-small">Passwords and PINs are encrypted and never displayed once saved.</p>
    </div>
  );
}

function CardsTab({ accountId, cards }: { accountId: string; cards: BankCard[] }) {
  const addCard = useAddCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div>
      <button className="expenses-add-btn" onClick={() => setShowAddModal(true)}>+ Add card</button>

      {cards.length > 0 ? (
        <div className="cards-grid">
          {cards.map((card) => (
            <div key={card.id} className={`bank-card-visual${card.isDefault ? ' default' : ''}`}>
              {card.isDefault && <span className="card-default-badge">Default</span>}
              <div className="card-number">{card.cardNumber}</div>
              <div className="card-footer">
                <div>
                  <div className="card-label-small">Cardholder</div>
                  <div className="card-value-small">{card.cardholderName}</div>
                </div>
                <div>
                  <div className="card-label-small">Expires</div>
                  <div className="card-value-small">{String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}</div>
                </div>
              </div>
              <div className="card-actions">
                {!card.isDefault && (
                  <button className="icon-btn" title="Set as default" onClick={() => updateCard.mutate({ accountId, cardId: card.id, updates: { isDefault: true } })}>⭐</button>
                )}
                <button className="icon-btn delete" onClick={() => deleteCard.mutate({ accountId, cardId: card.id })}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No cards on file for this account.</p>
      )}

      {showAddModal && (
        <AddCardModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(draft) => { addCard.mutate({ accountId, draft }); setShowAddModal(false); }}
        />
      )}
    </div>
  );
}

function AddCardModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (draft: BankCardDraft) => void }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('01');
  const [expiryYear, setExpiryYear] = useState(String(new Date().getFullYear() + 3));
  const [cvv, setCvv] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (cardNumber.trim().length < 4 || !cardholderName.trim() || cvv.trim().length < 3) return;

    onSubmit({
      cardNumberLast4: cardNumber.trim(),
      cardholderName: cardholderName.trim(),
      expiryMonth: parseInt(expiryMonth, 10),
      expiryYear: parseInt(expiryYear, 10),
      cvv: cvv.trim(),
      isDefault,
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal finance-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add card</h2>
        <form onSubmit={handleSubmit} className="finance-modal-form">
          <div className="field">
            <label>Card Number (last 4 digits)</label>
            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))} maxLength={4} placeholder="4432" required autoFocus />
          </div>
          <div className="field">
            <label>Cardholder Name</label>
            <input type="text" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} placeholder="As printed on card" required />
          </div>
          <div className="finance-modal-row">
            <div className="field">
              <label>Expiry Month</label>
              <select value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Expiry Year</label>
              <select value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)}>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="finance-modal-row">
            <div className="field">
              <label>CVV</label>
              <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} maxLength={4} placeholder="•••" required />
            </div>
            <div className="field">
              <label>Card PIN (optional)</label>
              <input type="password" inputMode="numeric" value={cardPin} onChange={(e) => setCardPin(e.target.value.replace(/\D/g, ''))} maxLength={6} placeholder="••••" />
            </div>
          </div>
          <label className="checkbox-field">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            Set as default card
          </label>
          <p className="finance-security-hint">🔒 CVV and PIN are encrypted and never displayed once saved.</p>
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Add card</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
