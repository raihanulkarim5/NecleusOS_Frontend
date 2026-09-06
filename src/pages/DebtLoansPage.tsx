import { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebtLoans, useCreateDebtLoan } from '../hooks/useFinance';
import type { DebtLoanDraft, DebtType } from '../types/finance';

export function DebtLoansPage() {
  const { data: debts } = useDebtLoans();
  const createDebtLoan = useCreateDebtLoan();
  const [showAddModal, setShowAddModal] = useState(false);

  const totalDebt = debts?.reduce((sum, d) => sum + d.amountRemaining, 0) ?? 0;
  const totalGiven = debts?.filter((d) => d.type === 'Loan Given').reduce((sum, d) => sum + d.amountRemaining, 0) ?? 0;

  return (
    <div>
      <h2>Debts & Loans</h2>
      <button className="debts-add-btn" onClick={() => setShowAddModal(true)}>+ Add debt/loan</button>

      <div className="debts-summary">
        <div className="debt-stat">
          <span>Total Owed:</span>
          <strong>${totalDebt.toFixed(2)}</strong>
        </div>
        <div className="debt-stat">
          <span>Loans Given:</span>
          <strong>${totalGiven.toFixed(2)}</strong>
        </div>
      </div>

      {debts && debts.length > 0 ? (
        <div className="debts-list">
          {debts.map((debt) => (
            <div key={debt.id} className={`debt-item debt-type-${debt.type.replace(' ', '-').toLowerCase()}`}>
              <div className="debt-header">
                <h3>{debt.personName}</h3>
                <span className={`debt-badge debt-${debt.type.replace(' ', '-').toLowerCase()}`}>{debt.type}</span>
              </div>
              <div className="debt-details">
                <div className="detail-row">
                  <span>Amount:</span>
                  <strong>${debt.amount.toFixed(2)}</strong>
                </div>
                <div className="detail-row">
                  <span>Remaining:</span>
                  <strong>${debt.amountRemaining.toFixed(2)}</strong>
                </div>
                {debt.personPhone && <div className="detail-row"><span>Phone:</span><span>{debt.personPhone}</span></div>}
                {debt.personEmail && <div className="detail-row"><span>Email:</span><span>{debt.personEmail}</span></div>}
                <div className="detail-row">
                  <span>Purpose:</span>
                  <span>{debt.purpose}</span>
                </div>
                <div className="detail-row">
                  <span>Date:</span>
                  <span>{debt.date}</span>
                </div>
                {debt.dueDate && <div className="detail-row"><span>Due:</span><span>{debt.dueDate}</span></div>}
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={`debt-status status-${debt.status.toLowerCase()}`}>{debt.status}</span>
                </div>
              </div>
              {debt.notes && <div className="debt-notes">{debt.notes}</div>}
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No debts or loans tracked yet. Add one to get started!</p>
      )}

      {showAddModal && (
        <AddDebtLoanModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(draft) => {
            createDebtLoan.mutate(draft);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddDebtLoanModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (draft: DebtLoanDraft) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState<DebtType>('Loan Given');
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [personAddress, setPersonAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(today);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'Open' | 'Partial' | 'Settled'>('Open');
  const [notes, setNotes] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!personName.trim() || !amount.trim() || !purpose.trim()) return;

    onSubmit({
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

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal debts-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add debt/loan</h2>
        <form onSubmit={handleSubmit} className="debts-modal-form">
          <div className="field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as DebtType)}>
              <option value="Loan Given">Loan Given</option>
              <option value="Loan Received">Loan Received</option>
              <option value="Debt">Debt</option>
            </select>
          </div>

          <div className="field">
            <label>Person Name *</label>
            <input
              type="text"
              placeholder="e.g., John Doe"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="debts-modal-row">
            <div className="field">
              <label>Phone (optional)</label>
              <input type="tel" placeholder="+1-555-0000" value={personPhone} onChange={(e) => setPersonPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Email (optional)</label>
              <input type="email" placeholder="john@example.com" value={personEmail} onChange={(e) => setPersonEmail(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Address (optional)</label>
            <input type="text" placeholder="123 Main St" value={personAddress} onChange={(e) => setPersonAddress(e.target.value)} />
          </div>

          <div className="debts-modal-row">
            <div className="field">
              <label>Amount *</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                required
              />
            </div>
            <div className="field">
              <label>Purpose *</label>
              <input
                type="text"
                placeholder="e.g., Emergency fund"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="debts-modal-row">
            <div className="field">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label>Due Date (optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="Open">Open</option>
              <option value="Partial">Partial</option>
              <option value="Settled">Settled</option>
            </select>
          </div>

          <div className="field">
            <label>Notes (optional)</label>
            <textarea
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">Add debt/loan</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
