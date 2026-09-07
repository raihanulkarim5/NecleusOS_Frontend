import { useMonthSummary, useOverallBalance, useBankAccounts } from '../hooks/useFinance';

const CATEGORY_NAMES: Record<string, string> = {
  'cat-food': 'Food & Dining',
  'cat-transport': 'Transport',
  'cat-utilities': 'Utilities',
  'cat-entertainment': 'Entertainment',
  'cat-health': 'Health & Medical',
  'cat-shopping': 'Shopping',
  'cat-other': 'Other',
};

interface FinanceOverviewPageProps {
  month: string;
  onManageAccounts: () => void;
}

export function FinanceOverviewPage({ month, onManageAccounts }: FinanceOverviewPageProps) {
  const { data: summary, isLoading: summaryLoading } = useMonthSummary(month);
  const { data: overallBalance } = useOverallBalance();
  const { data: accounts } = useBankAccounts();

  return (
    <div>
      {/* Overall Balance Card */}
      <div className="finance-card overall-balance">
        <div className="card-label">Overall Balance</div>
        <div className="card-value">${(overallBalance ?? 0).toFixed(2)}</div>
      </div>

      {/* Account Balances */}
      <div className="finance-accounts-grid">
        <div className="finance-section-header">
          <h3 className="section-title">Bank Accounts</h3>
          <button className="finance-manage-btn" onClick={onManageAccounts}>Manage accounts →</button>
        </div>
        {accounts && accounts.length > 0 ? (
          accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <div className="account-name">{account.bankName}</div>
                <div className="account-type">{account.accountType}</div>
              </div>
              <div className="account-number">{account.accountNumberMasked}</div>
              <div className="account-balance">${account.balance.toFixed(2)}</div>
              <div className="account-currency">{account.currency}</div>
            </div>
          ))
        ) : (
          <p className="muted-text" style={{ gridColumn: '1 / -1' }}>
            No bank accounts yet. Add one from the Banking tab.
          </p>
        )}
      </div>

      {/* Monthly Summary */}
      {!summaryLoading && summary && (
        <div className="finance-summary">
          <h3 className="section-title">Monthly Spending — {month}</h3>
          <div className="summary-stat">
            <span>Total Spent:</span>
            <strong>${summary.totalSpent.toFixed(2)}</strong>
          </div>

          {summary.byCategory.length > 0 ? (
            <>
              <h4 className="subsection-title">By Category</h4>
              <div className="category-breakdown">
                {summary.byCategory.map((cat) => (
                  <div key={cat.categoryId} className="category-row">
                    <span className="category-label">{CATEGORY_NAMES[cat.categoryId] ?? cat.categoryId}</span>
                    <span className="category-spent">${cat.spent.toFixed(2)}</span>
                    {cat.budget !== null && (
                      <>
                        <span className="category-budget">Budget: ${cat.budget.toFixed(2)}</span>
                        <div className="budget-bar">
                          <div
                            className={`budget-fill${cat.spent > cat.budget ? ' over' : ''}`}
                            style={{ width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted-text">No spending recorded for this month yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
