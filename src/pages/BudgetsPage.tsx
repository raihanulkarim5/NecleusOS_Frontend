import { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBudgetsByMonth, useCreateBudget, useExpensesByMonth } from '../hooks/useFinance';
import type { BudgetDraft } from '../types/finance';

interface BudgetsPageProps {
  month: string;
  onMonthChange: (month: string) => void;
}

const CATEGORIES = [
  { id: 'cat-food', name: 'Food & Dining' },
  { id: 'cat-transport', name: 'Transport' },
  { id: 'cat-utilities', name: 'Utilities' },
  { id: 'cat-entertainment', name: 'Entertainment' },
  { id: 'cat-health', name: 'Health & Medical' },
  { id: 'cat-shopping', name: 'Shopping' },
  { id: 'cat-other', name: 'Other' },
];

export function BudgetsPage({ month, onMonthChange }: BudgetsPageProps) {
  const { data: budgets } = useBudgetsByMonth(month);
  const { data: expenses } = useExpensesByMonth(month);
  const createBudget = useCreateBudget();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div>
      <h2>Budgets - {month}</h2>
      <div className="budgets-header">
        <input type="month" value={month} onChange={(e) => onMonthChange(e.target.value)} className="month-input" />
        <button className="budgets-add-btn" onClick={() => setShowAddModal(true)}>+ Set budget</button>
      </div>

      {budgets && budgets.length > 0 ? (
        <div className="budgets-list">
          {budgets.map((bud) => {
            const spent = expenses?.filter((e) => e.categoryId === bud.categoryId).reduce((sum, e) => sum + e.amount, 0) ?? 0;
            const pct = Math.min((spent / bud.monthlyLimit) * 100, 100);
            const catName = CATEGORIES.find((c) => c.id === bud.categoryId)?.name || bud.categoryId;
            return (
              <div key={bud.id} className="budget-item">
                <div className="budget-header">
                  <div className="budget-category">{catName}</div>
                  <div className="budget-limit">${bud.monthlyLimit.toFixed(2)}</div>
                </div>
                <div className="budget-bar">
                  <div className="budget-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="budget-stats">
                  <span className="budget-spent">Spent: ${spent.toFixed(2)}</span>
                  <span className="budget-remaining">Remaining: ${Math.max(0, bud.monthlyLimit - spent).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="muted-text">No budgets set for this month. Set one to track spending!</p>
      )}

      {showAddModal && (
        <AddBudgetModal
          month={month}
          onClose={() => setShowAddModal(false)}
          onSubmit={(draft) => {
            createBudget.mutate(draft);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddBudgetModal({ month, onClose, onSubmit }: { month: string; onClose: () => void; onSubmit: (draft: BudgetDraft) => void }) {
  const [categoryId, setCategoryId] = useState('cat-food');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!monthlyLimit.trim() || parseFloat(monthlyLimit) <= 0) return;

    onSubmit({
      categoryId,
      monthlyLimit: parseFloat(monthlyLimit),
      month,
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal budgets-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Set budget</h2>
        <form onSubmit={handleSubmit} className="budgets-modal-form">
          <div className="field">
            <label>Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Monthly Limit</label>
            <input
              type="number"
              placeholder="0.00"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              step="0.01"
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Set budget</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
