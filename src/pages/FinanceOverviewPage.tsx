import { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMonthSummary, useOverallBalance, useBankAccounts, useCreateBankAccount } from '../hooks/useFinance';
import type { BankAccount } from '../types/finance';

interface FinanceOverviewPageProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function FinanceOverviewPage({ month, onMonthChange }: FinanceOverviewPageProps) {
  const { data: summary } = useMonthSummary(month);
  const { data: overallBalance } = useOverallBalance();
  const { data: accounts } = useBankAccounts();
  const createBankAccount = useCreateBankAccount();
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-current">Finance</span>
      </div>
      <h1 className="page-title">Finance Overview</h1>

      {/* Month Selector */}
      <div className="finance-month-selector">
        <input
          type="month"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="month-input"
        />
      </div>

      {/* Overall Balance Card */}
      <div className="finance-card overall-balance">
        <div className="card-label">Overall Balance</div>
        <div className="card-value">${overallBalance?.toFixed(2) ?? '0.00'}</div>
      </div>

      {/* Account Balances */}
      {accounts && accounts.length > 0 && (
        <div className="finance-accounts-grid">
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="section-title">Bank Accounts</h3>
            <button className="finance-add-account-btn" onClick={() => setShowAddAccountModal(true)}>+ Add account</button>
          </div>
          {accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <div className="account-name">{account.bankName}</div>
                <div className="account-type">{account.accountType}</div>
              </div>
              <div className="account-number">{account.accountNumberMasked}</div>
              <div className="account-balance">${account.balance.toFixed(2)}</div>
              <div className="account-currency">{account.currency}</div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Summary */}
      {summary && (
        <div className="finance-summary">
          <h3 className="section-title">Monthly Spending - {month}</h3>
          <div className="summary-stat">
            <span>Total Spent:</span>
            <strong>${summary.totalSpent.toFixed(2)}</strong>
          </div>

          <h4 className="subsection-title">By Category</h4>
          <div className="category-breakdown">
            {summary.byCategory.map((cat) => (
              <div key={cat.categoryId} className="category-row">
                <span className="category-label">{cat.categoryId}</span>
                <span className="category-spent">${cat.spent.toFixed(2)}</span>
                {cat.budget !== null && (
                  <>
                    <span className="category-budget">Budget: ${cat.budget.toFixed(2)}</span>
                    <div className="budget-bar">
                      <div
                        className="budget-fill"
                        style={{ width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddAccountModal && (
        <AddBankAccountModal
          onClose={() => setShowAddAccountModal(false)}
          onSubmit={(account) => {
            createBankAccount.mutate(account);
            setShowAddAccountModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddBankAccountModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (account: any) => void }) {
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'Checking' | 'Savings' | 'Credit'>('Checking');
  const [accountNumber, setAccountNumber] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [balance, setBalance] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim()) return;

    onSubmit({
      bankName: bankName.trim(),
      accountType,
      accountNumberMasked: `****${accountNumber.slice(-4)}`,
      currency,
      balance: parseFloat(balance) || 0,
      cards: [],
      credentials: {
        encryptedPassword: '[ENCRYPTED]',
        encryptedPin: '[ENCRYPTED]',
        lastVerified: new Date().toISOString().slice(0, 10),
      },
      order: 0,
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal finance-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add bank account</h2>
        <form onSubmit={handleSubmit} className="finance-modal-form">
          <div className="field">
            <label>Bank Name</label>
            <input
              type="text"
              placeholder="e.g., First Bank, Chase, Wells Fargo"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="finance-modal-row">
            <div className="field">
              <label>Account Type</label>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value as any)}>
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
            <div className="field">
              <label>Currency</label>
              <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
            </div>
          </div>

          <div className="field">
            <label>Account Number (last 4 digits)</label>
            <input
              type="text"
              placeholder="e.g., 5678"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              maxLength={4}
              required
            />
          </div>

          <div className="field">
            <label>Current Balance</label>
            <input
              type="number"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              step="0.01"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Add account</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
