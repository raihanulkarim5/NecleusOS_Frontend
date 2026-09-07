import { FormEvent, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebtLoans, useCreateDebtLoan, useUpdateDebtLoan, useDeleteDebtLoan } from '../hooks/useFinance';
import type { DebtLoan, DebtLoanDraft, DebtLoanUpdate, DebtType } from '../types/finance';

type StatusFilter = 'All' | 'Open' | 'Partial' | 'Settled';
type TypeFilter = 'All' | DebtType;

export function DebtLoansPage() {
  const { data: debts } = useDebtLoans();
  const createDebtLoan = useCreateDebtLoan();
  const updateDebtLoan = useUpdateDebtLoan();
  const deleteDebtLoan = useDeleteDebtLoan();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtLoan | null>(null);
  const [filterPerson, setFilterPerson] = useState<string>('All');
  const [filterType, setFilterType] = useState<TypeFilter>('All');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('All');

  const persons = useMemo(() => {
    const unique = new Set<string>();
    debts?.forEach((d) => unique.add(d.personName));
    return Array.from(unique).sort();
  }, [debts]);

  const filtered = useMemo(() => {
    let list = debts ?? [];
    if (filterPerson !== 'All') list = list.filter((d) => d.personName === filterPerson);
    if (filterType !== 'All') list = list.filter((d) => d.type === filterType);
    if (filterStatus !== 'All') list = list.filter((d) => d.status === filterStatus);
    return list;
  }, [debts, filterPerson, filterType, filterStatus]);

  const totalDebt = filtered.reduce((sum, d) => sum + d.amountRemaining, 0);
  const totalGiven = filtered.filter((d) => d.type === 'Loan Given').reduce((sum, d) => sum + d.amountRemaining, 0);
  const totalReceived = filtered.filter((d) => d.type === 'Loan Received').reduce((sum, d) => sum + d.amountRemaining, 0);

  return (
    <div>
      <div className="debts-header">
        <button className="debts-add-btn" onClick={() => setShowAddModal(true)}>+ Add debt/loan</button>
      </div>

      <div className="debts-filters">
        <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)}>
          <option value="All">All people</option>
          {persons.map((person) => <option key={person} value={person}>{person}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as TypeFilter)}>
          <option value="All">All types</option>
          <option value="Loan Given">Loan Given</option>
          <option value="Loan Received">Loan Received</option>
          <option value="Debt">Debt</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}>
          <option value="All">All statuses</option>
          <option value="Open">Open</option>
          <option value="Partial">Partial</option>
          <option value="Settled">Settled</option>
        </select>
      </div>

      <div className="debts-summary">
        <div className="debt-stat"><span>Total Owed:</span><strong>${totalDebt.toFixed(2)}</strong></div>
        <div className="debt-stat"><span>Loans Given:</span><strong>${totalGiven.toFixed(2)}</strong></div>
        <div className="debt-stat"><span>Loans Received:</span><strong>${totalReceived.toFixed(2)}</strong></div>
      </div>

      {filtered.length > 0 ? (
        <div className="debts-list">
          {filtered.map((debt) => (
            <div key={debt.id} className={`debt-item debt-type-${debt.type.replace(' ', '-').toLowerCase()}`}>
              <div className="debt-header">
                <div>
                  <h3>{debt.personName}</h3>
                  <span className="debt-contact-info">
                    {debt.personPhone && <span>{debt.personPhone}</span>}
                    {debt.personEmail && <span>{debt.personEmail}</span>}
                  </span>
                </div>
                <div className="debt-actions">
                  <span className={`debt-badge debt-${debt.type.replace(' ', '-').toLowerCase()}`}>{debt.type}</span>
                  {debt.status === 'Settled' ? (
                    <span className="debt-paid-badge">✓ Paid {debt.paidDate}</span>
                  ) : (
                    <button
                      className="debt-mark-paid-btn"
                      onClick={() => updateDebtLoan.mutate({
                        id: debt.id,
                        updates: { status: 'Settled', amountRemaining: 0, paidDate: new Date().toISOString().slice(0, 10) },
                      })}
                    >Mark paid</button>
                  )}
                  <button className="icon-btn" onClick={() => setEditingDebt(debt)}>✏️</button>
                  <button className="icon-btn delete" onClick={() => deleteDebtLoan.mutate(debt.id)}>🗑️</button>
                </div>
              </div>
              <div className="debt-details">
                <div className="detail-row"><span>Amount:</span><strong>${debt.amount.toFixed(2)}</strong></div>
                <div className="detail-row"><span>Remaining:</span><strong>${debt.amountRemaining.toFixed(2)}</strong></div>
                {debt.personAddress && <div className="detail-row"><span>Address:</span><span>{debt.personAddress}</span></div>}
                <div className="detail-row"><span>Purpose:</span><span>{debt.purpose}</span></div>
                <div className="detail-row"><span>Date:</span><span>{debt.date}</span></div>
                {debt.dueDate && <div className="detail-row"><span>Due:</span><span>{debt.dueDate}</span></div>}
                {debt.paidDate && <div className="detail-row"><span>Paid:</span><span>{debt.paidDate}</span></div>}
                <div className="detail-row"><span>Status:</span><span className={`debt-status status-${debt.status.toLowerCase()}`}>{debt.status}</span></div>
              </div>
              {debt.notes && <div className="debt-notes">{debt.notes}</div>}
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No debts or loans match your filters.</p>
      )}

      {showAddModal && (
        <DebtLoanFormModal
          title="Add debt/loan"
          onClose={() => setShowAddModal(false)}
          onSave={(draft) => { createDebtLoan.mutate(draft as DebtLoanDraft); setShowAddModal(false); }}
        />
      )}
      {editingDebt && (
        <DebtLoanFormModal
          title="Edit debt/loan"
          initial={editingDebt}
          onClose={() => setEditingDebt(null)}
          onSave={(updates) => { updateDebtLoan.mutate({ id: editingDebt.id, updates: updates as DebtLoanUpdate }); setEditingDebt(null); }}
        />
      )}
    </div>
  );
}

function DebtLoanFormModal({
  title, initial, onClose, onSave,
}: {
  title: string;
  initial?: DebtLoan;
  onClose: () => void;
  onSave: (payload: DebtLoanDraft | DebtLoanUpdate) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState<DebtType>(initial?.type ?? 'Loan Given');
  const [personName, setPersonName] = useState(initial?.personName ?? '');
  const [personPhone, setPersonPhone] = useState(initial?.personPhone ?? '');
  const [personEmail, setPersonEmail] = useState(initial?.personEmail ?? '');
  const [personAddress, setPersonAddress] = useState(initial?.personAddress ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [amountRemaining, setAmountRemaining] = useState(initial ? String(initial.amountRemaining) : '');
  const [purpose, setPurpose] = useState(initial?.purpose ?? '');
  const [date, setDate] = useState(initial?.date ?? today);
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [paidDate, setPaidDate] = useState(initial?.paidDate ?? '');
  const [status, setStatus] = useState<'Open' | 'Partial' | 'Settled'>(initial?.status ?? 'Open');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!personName.trim() || !amount.trim() || !purpose.trim()) return;

    if (initial) {
      onSave({
        amount: parseFloat(amount),
        personName: personName.trim(),
        personPhone: personPhone.trim() || undefined,
        personEmail: personEmail.trim() || undefined,
        personAddress: personAddress.trim() || undefined,
        purpose: purpose.trim(),
        dueDate: dueDate || undefined,
        paidDate: paidDate || undefined,
        status,
        amountRemaining: parseFloat(amountRemaining) || 0,
        notes: notes.trim(),
      });
    } else {
      onSave({
        type,
        personName: personName.trim(),
        personPhone: personPhone.trim() || undefined,
        personEmail: personEmail.trim() || undefined,
        personAddress: personAddress.trim() || undefined,
        amount: parseFloat(amount),
        purpose: purpose.trim(),
        date,
        dueDate: dueDate || undefined,
        status,
        amountRemaining: parseFloat(amount),
        notes: notes.trim(),
      });
    }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal debts-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={handleSubmit} className="debts-modal-form">
          <div className="field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as DebtType)} disabled={!!initial}>
              <option value="Loan Given">Loan Given</option>
              <option value="Loan Received">Loan Received</option>
              <option value="Debt">Debt</option>
            </select>
          </div>

          <div className="field">
            <label>Person Name *</label>
            <input type="text" placeholder="e.g., John Doe" value={personName} onChange={(e) => setPersonName(e.target.value)} required autoFocus />
          </div>

          <div className="debts-modal-row">
            <div className="field"><label>Phone (optional)</label><input type="tel" placeholder="+1-555-0000" value={personPhone} onChange={(e) => setPersonPhone(e.target.value)} /></div>
            <div className="field"><label>Email (optional)</label><input type="email" placeholder="john@example.com" value={personEmail} onChange={(e) => setPersonEmail(e.target.value)} /></div>
          </div>

          <div className="field"><label>Address (optional)</label><input type="text" placeholder="123 Main St" value={personAddress} onChange={(e) => setPersonAddress(e.target.value)} /></div>

          <div className="debts-modal-row">
            <div className="field"><label>Amount *</label><input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" required disabled={!!initial} /></div>
            <div className="field"><label>Purpose *</label><input type="text" placeholder="e.g., Emergency fund" value={purpose} onChange={(e) => setPurpose(e.target.value)} required /></div>
          </div>

          {initial && (
            <div className="field"><label>Amount Remaining</label><input type="number" step="0.01" value={amountRemaining} onChange={(e) => setAmountRemaining(e.target.value)} /></div>
          )}

          <div className="debts-modal-row">
            <div className="field"><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={!!initial} /></div>
            <div className="field"><label>Due Date (optional)</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>

          <div className="debts-modal-row">
            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="Open">Open</option>
                <option value="Partial">Partial</option>
                <option value="Settled">Settled</option>
              </select>
            </div>
            {status === 'Settled' && (
              <div className="field"><label>Paid Date</label><input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} /></div>
            )}
          </div>

          <div className="field">
            <label>Notes (optional)</label>
            <textarea placeholder="Add any additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">{initial ? 'Save changes' : 'Add debt/loan'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
