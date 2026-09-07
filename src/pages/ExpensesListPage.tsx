import { FormEvent, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useExpensesByMonth, useCreateExpense, useUpdateExpense, useDeleteExpense,
  useCategories, useBankAccounts,
} from '../hooks/useFinance';
import type { Expense, ExpenseDraft, ExpenseUpdate, PaymentMethod } from '../types/finance';

const CATEGORY_NAMES: Record<string, string> = {
  'cat-food': 'Food & Dining',
  'cat-transport': 'Transport',
  'cat-utilities': 'Utilities',
  'cat-entertainment': 'Entertainment',
  'cat-health': 'Health & Medical',
  'cat-shopping': 'Shopping',
  'cat-other': 'Other',
};

interface ExpensesListPageProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function ExpensesListPage({ month, onMonthChange }: ExpensesListPageProps) {
  const { data: expenses } = useExpensesByMonth(month);
  const { data: categories } = useCategories();
  const { data: accounts } = useBankAccounts();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const filtered = useMemo(() => {
    let list = expenses ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.note.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') {
      list = list.filter((e) => e.categoryId === categoryFilter);
    }
    list = [...list].sort((a, b) =>
      sortBy === 'amount' ? b.amount - a.amount : new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return list;
  }, [expenses, search, categoryFilter, sortBy]);

  const totalExpense = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="expenses-header">
        <input type="month" value={month} onChange={(e) => onMonthChange(e.target.value)} className="month-input" />
        <button className="expenses-add-btn" onClick={() => setShowAddModal(true)}>+ Add expense</button>
      </div>

      <div className="expenses-toolbar">
        <input type="text" placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All categories</option>
          {Object.entries(CATEGORY_NAMES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}>
          <option value="date">Sort: Newest first</option>
          <option value="amount">Sort: Highest amount</option>
        </select>
      </div>

      <div className="expenses-total">
        <span>Total ({filtered.length} expense{filtered.length !== 1 ? 's' : ''}):</span>
        <strong>${totalExpense.toFixed(2)}</strong>
      </div>

      {filtered.length > 0 ? (
        <div className="expenses-list">
          {filtered.map((exp) => (
            <div key={exp.id} className="expense-item" onClick={() => setEditingExpense(exp)}>
              <div className="expense-info">
                <div className="expense-category">{CATEGORY_NAMES[exp.categoryId] ?? exp.categoryId}</div>
                <div className="expense-note">{exp.note || '—'}</div>
              </div>
              <div className="expense-amount">${exp.amount.toFixed(2)}</div>
              <div className="expense-date">{exp.date}</div>
              <div className="expense-method">{exp.paymentMethod}</div>
              <button
                className="entry-delete expense-delete-btn"
                onClick={(e) => { e.stopPropagation(); deleteExpense.mutate(exp.id); }}
              >🗑️</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No expenses match your filters. Add one to get started!</p>
      )}

      {showAddModal && (
        <ExpenseFormModal
          title="Add expense"
          categories={categories}
          accounts={accounts}
          onClose={() => setShowAddModal(false)}
          onSave={(draft) => {
            createExpense.mutate(draft as ExpenseDraft);
            setShowAddModal(false);
          }}
        />
      )}

      {editingExpense && (
        <ExpenseFormModal
          title="Edit expense"
          initial={editingExpense}
          categories={categories}
          accounts={accounts}
          onClose={() => setEditingExpense(null)}
          onSave={(updates) => {
            updateExpense.mutate({ id: editingExpense.id, updates: updates as ExpenseUpdate });
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
}

function ExpenseFormModal({
  title,
  initial,
  categories,
  accounts,
  onClose,
  onSave,
}: {
  title: string;
  initial?: Expense;
  categories: any[] | undefined;
  accounts: any[] | undefined;
  onClose: () => void;
  onSave: (payload: ExpenseDraft | ExpenseUpdate) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initial?.date ?? today);
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? 'cat-food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.paymentMethod ?? 'Card');
  const [accountId, setAccountId] = useState<string | null>(initial?.bankAccountId ?? (accounts?.[0]?.id ?? null));
  const [note, setNote] = useState(initial?.note ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!amount.trim() || parseFloat(amount) <= 0) return;

    onSave({
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
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={handleSubmit} className="expenses-modal-form">
          <div className="expenses-modal-row">
            <div className="field">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="field">
              <label>Amount</label>
              <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" required autoFocus />
            </div>
          </div>

          <div className="expenses-modal-row">
            <div className="field">
              <label>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {Object.entries(CATEGORY_NAMES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
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
                <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumberMasked}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Note (optional)</label>
            <input type="text" placeholder="e.g., Groceries, Uber ride" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">{initial ? 'Save changes' : 'Add expense'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
