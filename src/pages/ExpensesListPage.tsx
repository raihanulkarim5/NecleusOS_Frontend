import { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { useExpensesByMonth, useCreateExpense, useCategories, useBankAccounts } from '../hooks/useFinance';
import type { ExpenseDraft, PaymentMethod } from '../types/finance';

interface ExpensesListPageProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function ExpensesListPage({ month, onMonthChange }: ExpensesListPageProps) {
  const { data: expenses } = useExpensesByMonth(month);
  const { data: categories } = useCategories();
  const { data: accounts } = useBankAccounts();
  const createExpense = useCreateExpense();
  const [showAddModal, setShowAddModal] = useState(false);

  const totalExpense = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <div>
      <h2>Expenses - {month}</h2>
      <div className="expenses-header">
        <input type="month" value={month} onChange={(e) => onMonthChange(e.target.value)} className="month-input" />
        <button className="expenses-add-btn" onClick={() => setShowAddModal(true)}>+ Add expense</button>
      </div>

      <div className="expenses-total">
        <span>Total this month:</span>
        <strong>${totalExpense.toFixed(2)}</strong>
      </div>

      {expenses && expenses.length > 0 ? (
        <div className="expenses-list">
          {expenses.map((exp) => (
            <div key={exp.id} className="expense-item">
              <div className="expense-info">
                <div className="expense-category">{exp.categoryId}</div>
                <div className="expense-note">{exp.note || 'Expense'}</div>
              </div>
              <div className="expense-amount">${exp.amount.toFixed(2)}</div>
              <div className="expense-date">{exp.date}</div>
              <div className="expense-method">{exp.paymentMethod}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No expenses for this month. Add one to get started!</p>
      )}

      {showAddModal && (
        <AddExpenseModal
          month={month}
          categories={categories}
          accounts={accounts}
          onClose={() => setShowAddModal(false)}
          onSubmit={(draft) => {
            createExpense.mutate(draft);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddExpenseModal({
  month,
  categories,
  accounts,
  onClose,
  onSubmit,
}: {
  month: string;
  categories: any[] | undefined;
  accounts: any[] | undefined;
  onClose: () => void;
  onSubmit: (draft: ExpenseDraft) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('cat-food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [accountId, setAccountId] = useState(accounts?.[0]?.id ?? null);
  const [note, setNote] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!amount.trim() || parseFloat(amount) <= 0) return;

    onSubmit({
      amount: parseFloat(amount),
      date,
      categoryId,
      paymentMethod,
      bankAccountId: accountId,
      note: note.trim(),
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal expenses-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add expense</h2>
        <form onSubmit={handleSubmit} className="expenses-modal-form">
          <div className="expenses-modal-row">
            <div className="field">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="field">
              <label>Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="expenses-modal-row">
            <div className="field">
              <label>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="cat-food">Food & Dining</option>
                <option value="cat-transport">Transport</option>
                <option value="cat-utilities">Utilities</option>
                <option value="cat-entertainment">Entertainment</option>
                <option value="cat-health">Health & Medical</option>
                <option value="cat-shopping">Shopping</option>
                <option value="cat-other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank transfer">Bank transfer</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Bank Account (optional)</label>
            <select value={accountId || ''} onChange={(e) => setAccountId(e.target.value || null)}>
              <option value="">None</option>
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.bankName} - {acc.accountNumberMasked}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Note (optional)</label>
            <input type="text" placeholder="e.g., Groceries, Uber ride" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Add expense</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
