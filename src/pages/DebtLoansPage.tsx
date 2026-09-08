import { FormEvent, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebtLoans, useCreateDebtLoan, useUpdateDebtLoan, useDeleteDebtLoan, usePersons, useCreatePerson } from '../hooks/useFinance';
import { formatMoney } from '../utils/money';
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

  const personNames = useMemo(() => {
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

  // "Loan Given" = money others owe me. "Debt" = money I owe others.
  const youAreOwed = filtered.filter((d) => d.type === 'Loan Given').reduce((sum, d) => sum + d.amountRemaining, 0);
  const youOwe = filtered.filter((d) => d.type === 'Debt').reduce((sum, d) => sum + d.amountRemaining, 0);

  return (
    <div>
      <div className="debts-header">
        <button className="debts-add-btn" onClick={() => setShowAddModal(true)}>+ Add debt/loan</button>
      </div>

      <div className="debts-filters">
        <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)}>
          <option value="All">All people</option>
          {personNames.map((person) => <option key={person} value={person}>{person}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as TypeFilter)}>
          <option value="All">All types</option>
          <option value="Loan Given">Loan Given (they owe you)</option>
          <option value="Debt">Debt (you owe)</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}>
          <option value="All">All statuses</option>
          <option value="Open">Open</option>
          <option value="Partial">Partial</option>
          <option value="Settled">Settled</option>
        </select>
      </div>

      <div className="debts-summary">
        <div className="debt-stat"><span>You Are Owed:</span><strong>{formatMoney(youAreOwed)}</strong></div>
        <div className="debt-stat"><span>You Owe:</span><strong>{formatMoney(youOwe)}</strong></div>
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
                  <span className={`debt-badge debt-${debt.type.replace(' ', '-').toLowerCase()}`}>
                    {debt.type === 'Loan Given' ? 'They owe you' : 'You owe'}
                  </span>
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
                <div className="detail-row"><span>Amount:</span><strong>{formatMoney(debt.amount)}</strong></div>
                <div className="detail-row"><span>Remaining:</span><strong>{formatMoney(debt.amountRemaining)}</strong></div>
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
  const { data: persons } = usePersons();
  const createPerson = useCreatePerson();
  const today = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<DebtType>(initial?.type ?? 'Loan Given');

  const initialPersonId = initial ? persons?.find((p) => p.name === initial.personName)?.id ?? '' : '';
  const [selectedPersonId, setSelectedPersonId] = useState(initialPersonId);
  const [addingPerson, setAddingPerson] = useState(!initial && !persons?.length);
  const [personName, setPersonName] = useState(initial?.personName ?? '');

  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [amountRemaining, setAmountRemaining] = useState(initial ? String(initial.amountRemaining) : '');
  const [purpose, setPurpose] = useState(initial?.purpose ?? '');
  const [date, setDate] = useState(initial?.date ?? today);
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [paidDate, setPaidDate] = useState(initial?.paidDate ?? '');
  const [status, setStatus] = useState<'Open' | 'Partial' | 'Settled'>(initial?.status ?? 'Open');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  function handlePersonSelect(value: string) {
    if (value === '__add_new__') {
      setAddingPerson(true);
      setSelectedPersonId('');
      setPersonName('');
      return;
    }
    setAddingPerson(false);
    setSelectedPersonId(value);
    const person = persons?.find((p) => p.id === value);
    if (person) setPersonName(person.name);
  }

  function buildPayloadAndSave(finalPersonName: string) {
    if (initial) {
      onSave({
        amount: parseFloat(amount),
        personName: finalPersonName,
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
        personName: finalPersonName,
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!personName.trim() || !amount.trim() || !purpose.trim()) return;

    // Brand-new person? Save them to the People list so they show up in
    // the picker next time, name only — no other info is required.
    if (addingPerson && !initial && !persons?.some((p) => p.name.toLowerCase() === personName.trim().toLowerCase())) {
      createPerson.mutate(
        { name: personName.trim() },
        { onSuccess: () => buildPayloadAndSave(personName.trim()) },
      );
    } else {
      buildPayloadAndSave(personName.trim());
    }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal debts-modal wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={handleSubmit} className="debts-modal-form horizontal">
          <div className="field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as DebtType)} disabled={!!initial}>
              <option value="Loan Given">Loan Given (they owe you)</option>
              <option value="Debt">Debt (you owe)</option>
            </select>
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
            <label>Person *</label>
            {!addingPerson ? (
              <select value={selectedPersonId} onChange={(e) => handlePersonSelect(e.target.value)} disabled={!!initial} required>
                <option value="" disabled>Select a person…</option>
                {persons?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                <option value="__add_new__">+ Add new person…</option>
              </select>
            ) : (
              <div className="person-picker-row">
                <input type="text" placeholder="Person's name" value={personName} onChange={(e) => setPersonName(e.target.value)} required autoFocus />
                {!!persons?.length && (
                  <button type="button" className="add-person-toggle" onClick={() => { setAddingPerson(false); setPersonName(''); }}>← Pick existing</button>
                )}
              </div>
            )}
          </div>

          <div className="field">
            <label>Amount *</label>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" required disabled={!!initial} />
          </div>

          {initial ? (
            <div className="field">
              <label>Amount Remaining</label>
              <input type="number" step="0.01" value={amountRemaining} onChange={(e) => setAmountRemaining(e.target.value)} />
            </div>
          ) : (
            <div className="field">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          )}

          <div className="field">
            <label>Due Date (optional)</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="field field-full">
            <label>Purpose *</label>
            <input type="text" placeholder="e.g., Emergency fund" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
          </div>

          {status === 'Settled' && (
            <div className="field">
              <label>Paid Date</label>
              <input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
            </div>
          )}

          <div className="field field-full">
            <label>Notes (optional)</label>
            <input type="text" placeholder="Any additional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="modal-actions field-full">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">{initial ? 'Save changes' : 'Add debt/loan'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
