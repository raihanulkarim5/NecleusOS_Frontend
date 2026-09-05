import { useMonthSummary, useOverallBalance, useBankAccounts } from '../hooks/useFinance';

interface FinanceOverviewPageProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function FinanceOverviewPage({ month, onMonthChange }: FinanceOverviewPageProps) {
  const { data: summary } = useMonthSummary(month);
  const { data: overallBalance } = useOverallBalance();
  const { data: accounts } = useBankAccounts();

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
          <h3 className="section-title">Bank Accounts</h3>
          {accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <div className="account-name">{account.bankName}</div>
                <div className="account-type">{account.accountType}</div>
              </div>
              <div className="account-number">{account.accountNumberMasked}</div>
              <div className="account-balance">${account.balance.toFixed(2)}</div>
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
                <span className="category-label">Category</span>
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
    </div>
  );
}
