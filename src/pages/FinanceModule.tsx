import { useState } from 'react';
import { FinanceOverviewPage } from './FinanceOverviewPage';
import { ExpensesListPage } from './ExpensesListPage';
import { BankingModule } from './BankingModule';
import { BudgetsPage } from './BudgetsPage';
import { DebtLoansPage } from './DebtLoansPage';

export type FinanceTab = 'overview' | 'expenses' | 'banking' | 'budgets' | 'debts';

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12l4-4 4 4 4-6 4 4" />
      <path d="M3 19h18" />
    </svg>
  );
}
function ExpenseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  );
}
function BankIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10l9-6 9 6" />
      <path d="M4 10v9h16v-9" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}
function BudgetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function DebtIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6" />
      <path d="M17 8h4M19 6v4" />
    </svg>
  );
}

const TABS: { key: FinanceTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'overview', label: 'Overview', icon: OverviewIcon },
  { key: 'expenses', label: 'Expenses', icon: ExpenseIcon },
  { key: 'banking', label: 'Banking', icon: BankIcon },
  { key: 'budgets', label: 'Budgets', icon: BudgetIcon },
  { key: 'debts', label: 'Debts & Loans', icon: DebtIcon },
];

export function FinanceModule() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-current">Finance</span>
      </div>
      <h1 className="page-title">Finance</h1>

      <div className="sub-tabs finance-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`sub-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="sub-tab-icon"><Icon /></span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <FinanceOverviewPage month={selectedMonth} onMonthChange={setSelectedMonth} onManageAccounts={() => setActiveTab('banking')} />
      )}
      {activeTab === 'expenses' && <ExpensesListPage month={selectedMonth} onMonthChange={setSelectedMonth} />}
      {activeTab === 'banking' && <BankingModule />}
      {activeTab === 'budgets' && <BudgetsPage month={selectedMonth} onMonthChange={setSelectedMonth} />}
      {activeTab === 'debts' && <DebtLoansPage />}
    </div>
  );
}
