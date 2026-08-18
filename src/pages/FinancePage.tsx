import { FormEvent, useState } from 'react';
import { useAccounts, useCategories, useCreateExpense, useExpenses, useMonthSummary } from '../hooks/useFinance';
import type { Expense, PaymentMethod } from '../types/finance';

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Bank transfer'];

function formatMoney(n: number) {
  return n.toLocaleString('en-US');
}

export function FinancePage() {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: expenses, isLoading } = useExpenses();
  const { data: summary } = useMonthSummary();
  const createExpense = useCreateExpense();

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [note, setNote] = useState('');

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c]));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || !categoryId) return;
    createExpense.mutate({
      amount: parsed,
      date: new Date().toISOString().slice(0, 10),
      categoryId,
      bankAccountId: null,
      paymentMethod,
      note: note.trim(),
    });
    setAmount('');
    setNote('');
  }

  return (
    <div>
      <h1 className="page-title">Finance</h1>
      <p className="page-date">Expenses, budgets, and accounts — encrypted at the field level once the API exists.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Spent this month</div>
          <div className="stat-big glow-magenta">৳{summary ? formatMoney(summary.totalSpent) : '—'}</div>
        </div>
        {accounts?.map((acc) => (
          <div className="stat-card" key={acc.id}>
            <div className="stat-label">{acc.bankName} · {acc.type}</div>
            <div className="stat-big glow-cyan">৳{formatMoney(acc.balance)}</div>
            <div className="account-masked">{acc.accountNumberMasked}</div>
          </div>
        ))}
      </div>

      {summary && summary.byCategory.length > 0 && (
        <section>
          <h2 className="section-title">Budget vs. actual</h2>
          <div className="stat-card">
            {summary.byCategory.map((row) => {
              const category = categoryMap.get(row.categoryId);
              const pct = row.budget ? Math.min(100, Math.round((row.spent / row.budget) * 100)) : null;
              return (
                <div className="budget-row" key={row.categoryId}>
                  <div className="budget-row-top">
                    <span className="budget-cat" style={{ color: category?.colorHex }}>{category?.name}</span>
                    <span className="budget-amounts">
                      ৳{formatMoney(row.spent)}{row.budget ? ` / ৳${formatMoney(row.budget)}` : ''}
                    </span>
                  </div>
                  {pct !== null && (
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--magenta)' : undefined }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Add expense</h2>
        <form className="expense-quickadd" onSubmit={handleSubmit}>
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input type="text" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="submit" disabled={createExpense.isPending || !amount || !categoryId}>
            {createExpense.isPending ? 'Adding…' : 'Add'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="section-title">Recent expenses</h2>
        {isLoading && <p className="muted-text">Loading expenses…</p>}
        <div className="stat-card">
          {expenses?.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} categoryName={categoryMap.get(expense.categoryId)?.name} categoryColor={categoryMap.get(expense.categoryId)?.colorHex} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ExpenseRow({
  expense,
  categoryName,
  categoryColor,
}: {
  expense: Expense;
  categoryName?: string;
  categoryColor?: string;
}) {
  const isIncome = categoryName === 'Income';
  return (
    <div className="task-row">
      <span className="task-dot" style={{ background: categoryColor }} />
      <span style={{ flex: 1 }}>{expense.note || categoryName}</span>
      <span className="entry-due">{expense.date}</span>
      <span className={isIncome ? 'glow-cyan' : 'glow-magenta'} style={{ marginLeft: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
        {isIncome ? '+' : '-'}৳{formatMoney(expense.amount)}
      </span>
    </div>
  );
}
