import { useState } from 'react';
import { FinanceOverviewPage } from './FinanceOverviewPage';
import { ExpensesListPage } from './ExpensesListPage';
import { BankingPage } from './BankingPage';
import { BudgetsPage } from './BudgetsPage';
import { DebtLoansPage } from './DebtLoansPage';

type Tab = 'overview' | 'expenses' | 'banking' | 'budgets' | 'debts';

export function FinanceModule() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div>
      <div className="finance-nav">
        {(['overview', 'expenses', 'banking', 'budgets', 'debts'] as const).map((tab) => (
          <button
            key={tab}
            className={`finance-nav-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'expenses' && '💳 Expenses'}
            {tab === 'banking' && '🏦 Banking'}
            {tab === 'budgets' && '📈 Budgets'}
            {tab === 'debts' && '📋 Debts & Loans'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <FinanceOverviewPage month={selectedMonth} onMonthChange={setSelectedMonth} />}
      {activeTab === 'expenses' && <ExpensesListPage month={selectedMonth} onMonthChange={setSelectedMonth} />}
      {activeTab === 'banking' && <BankingPage />}
      {activeTab === 'budgets' && <BudgetsPage month={selectedMonth} onMonthChange={setSelectedMonth} />}
      {activeTab === 'debts' && <DebtLoansPage />}
    </div>
  );
}
