import { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useBudgetsByMonth, useCreateBudget, useUpdateBudget, useDeleteBudget, useExpensesByMonth,
  useCategories, useCreateCategory,
  useBudgetPlans, useCreateBudgetPlan, useUpdateBudgetPlan, useDeleteBudgetPlan,
} from '../hooks/useFinance';
import type { Budget, BudgetDraft, BudgetUpdate, BudgetPlan, BudgetPlanDraft, BudgetPlanUpdate, Category } from '../types/finance';
import { DEFAULT_PLAN_TYPES } from '../types/finance';

interface BudgetsPageProps {
  month: string;
}

type BudgetsSubTab = 'monthly' | 'plans';

export function BudgetsPage({ month }: BudgetsPageProps) {
  const [subTab, setSubTab] = useState<BudgetsSubTab>('monthly');

  return (
    <div>
      <div className="sub-tabs">
        <button className={`sub-tab${subTab === 'monthly' ? ' active' : ''}`} onClick={() => setSubTab('monthly')}>
          <span className="sub-tab-icon">📆</span>Monthly Budgets
        </button>
        <button className={`sub-tab${subTab === 'plans' ? ' active' : ''}`} onClick={() => setSubTab('plans')}>
          <span className="sub-tab-icon">🎯</span>Future Plans
        </button>
      </div>

      {subTab === 'monthly' && <MonthlyBudgets month={month} />}
      {subTab === 'plans' && <FuturePlans />}
    </div>
  );
}

function MonthlyBudgets({ month }: { month: string }) {
  const { data: budgets } = useBudgetsByMonth(month);
  const { data: expenses } = useExpensesByMonth(month);
  const { data: categories } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const categoryName = (id: string) => categories?.find((c) => c.id === id)?.name ?? id;
  const budgetedCategoryIds = new Set((budgets ?? []).map((b) => b.categoryId));
  const availableCategories = (categories ?? []).filter((c) => editingBudget ? true : !budgetedCategoryIds.has(c.id));

  return (
    <div>
      <div className="budgets-header">
        <button className="budgets-add-btn" onClick={() => setShowAddModal(true)}>+ Set budget</button>
      </div>

      {budgets && budgets.length > 0 ? (
        <div className="budgets-list">
          {budgets.map((bud) => {
            const spent = expenses?.filter((e) => e.categoryId === bud.categoryId).reduce((sum, e) => sum + e.amount, 0) ?? 0;
            const pct = Math.min((spent / bud.monthlyLimit) * 100, 100);
            const over = spent > bud.monthlyLimit;
            return (
              <div key={bud.id} className="budget-item">
                <div className="budget-header">
                  <div className="budget-category">{categoryName(bud.categoryId)}</div>
                  <div className="budget-item-actions">
                    <div className="budget-limit">${bud.monthlyLimit.toFixed(2)}</div>
                    <button className="icon-btn" onClick={() => setEditingBudget(bud)}>✏️</button>
                    <button className="icon-btn delete" onClick={() => deleteBudget.mutate(bud.id)}>🗑️</button>
                  </div>
                </div>
                <div className="budget-bar">
                  <div className={`budget-fill${over ? ' over' : ''}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="budget-stats">
                  <span className="budget-spent">Spent: ${spent.toFixed(2)}</span>
                  <span className={`budget-remaining${over ? ' over-text' : ''}`}>
                    {over ? `Over by $${(spent - bud.monthlyLimit).toFixed(2)}` : `Remaining: $${(bud.monthlyLimit - spent).toFixed(2)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="muted-text">No budgets set for this month. Set one to track spending!</p>
      )}

      {showAddModal && (
        <BudgetFormModal
          title="Set budget"
          month={month}
          categories={availableCategories}
          onClose={() => setShowAddModal(false)}
          onSave={(draft) => { createBudget.mutate(draft as BudgetDraft); setShowAddModal(false); }}
        />
      )}
      {editingBudget && (
        <BudgetFormModal
          title="Edit budget"
          month={month}
          categories={categories}
          initial={editingBudget}
          onClose={() => setEditingBudget(null)}
          onSave={(updates) => { updateBudget.mutate({ id: editingBudget.id, updates: updates as BudgetUpdate }); setEditingBudget(null); }}
        />
      )}
    </div>
  );
}

function BudgetFormModal({
  title, month, categories, initial, onClose, onSave,
}: {
  title: string; month: string; categories: Category[] | undefined; initial?: Budget;
  onClose: () => void; onSave: (payload: BudgetDraft | BudgetUpdate) => void;
}) {
  const createCategory = useCreateCategory();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories?.[0]?.id ?? '');
  const [monthlyLimit, setMonthlyLimit] = useState(initial ? String(initial.monthlyLimit) : '');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  function handleConfirmNewCategory() {
    if (!newCategoryName.trim()) return;
    createCategory.mutate(
      { name: newCategoryName.trim(), colorHex: '#8b5cf6' },
      { onSuccess: (newCat) => { setCategoryId(newCat.id); setAddingCategory(false); setNewCategoryName(''); } },
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!monthlyLimit.trim() || parseFloat(monthlyLimit) <= 0 || !categoryId) return;
    onSave({ categoryId, monthlyLimit: parseFloat(monthlyLimit), month });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal budgets-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={handleSubmit} className="budgets-modal-form">
          <div className="field">
            <label>Category</label>
            <select value={addingCategory ? '__add_new__' : categoryId} onChange={(e) => e.target.value === '__add_new__' ? setAddingCategory(true) : setCategoryId(e.target.value)}>
              {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              <option value="__add_new__">+ Add new category…</option>
            </select>
            {addingCategory && (
              <div className="inline-add-row">
                <input type="text" placeholder="Category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                <button type="button" className="inline-add-confirm" onClick={handleConfirmNewCategory}>Add</button>
                <button type="button" className="inline-add-cancel" onClick={() => setAddingCategory(false)}>Cancel</button>
              </div>
            )}
          </div>
          <div className="field">
            <label>Monthly Limit</label>
            <input type="number" placeholder="0.00" value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} step="0.01" required autoFocus />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">{initial ? 'Save changes' : 'Set budget'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function FuturePlans() {
  const { data: plans } = useBudgetPlans();
  const createPlan = useCreateBudgetPlan();
  const updatePlan = useUpdateBudgetPlan();
  const deletePlan = useDeleteBudgetPlan();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BudgetPlan | null>(null);

  // Collect existing plan types (defaults + any custom ones already used) for the picker
  const usedTypes = Array.from(new Set((plans ?? []).map((p) => p.planType)));
  const allTypes = Array.from(new Set([...DEFAULT_PLAN_TYPES, ...usedTypes]));

  return (
    <div>
      <p className="plans-intro">Track savings goals for a specific asset, business investment, or long-term target — separate from your monthly spending budgets.</p>
      <button className="budgets-add-btn" style={{ marginBottom: 16 }} onClick={() => setShowAddModal(true)}>+ Add plan</button>

      {plans && plans.length > 0 ? (
        <div className="plans-list">
          {plans.map((plan) => {
            const pct = Math.min((plan.currentAmount / plan.targetAmount) * 100, 100);
            return (
              <div key={plan.id} className="plan-item">
                <div className="budget-header">
                  <div>
                    <div className="plan-name">{plan.name}</div>
                    <span className="plan-type-badge">{plan.planType}</span>
                  </div>
                  <div className="budget-item-actions">
                    <button className="icon-btn" onClick={() => setEditingPlan(plan)}>✏️</button>
                    <button className="icon-btn delete" onClick={() => deletePlan.mutate(plan.id)}>🗑️</button>
                  </div>
                </div>
                <div className="budget-bar">
                  <div className="budget-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="budget-stats">
                  <span className="budget-spent">${plan.currentAmount.toFixed(2)} of ${plan.targetAmount.toFixed(2)}</span>
                  <span className="budget-remaining">{pct.toFixed(0)}% funded</span>
                </div>
                {plan.targetDate && <div className="plan-target-date">Target date: {plan.targetDate}</div>}
                {plan.notes && <div className="debt-notes">{plan.notes}</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="muted-text">No future plans yet. Add one for a big purchase, business goal, or savings target.</p>
      )}

      {showAddModal && (
        <PlanFormModal
          title="Add plan"
          allTypes={allTypes}
          onClose={() => setShowAddModal(false)}
          onSave={(draft) => { createPlan.mutate(draft as BudgetPlanDraft); setShowAddModal(false); }}
        />
      )}
      {editingPlan && (
        <PlanFormModal
          title="Edit plan"
          allTypes={allTypes}
          initial={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={(updates) => { updatePlan.mutate({ id: editingPlan.id, updates: updates as BudgetPlanUpdate }); setEditingPlan(null); }}
        />
      )}
    </div>
  );
}

function PlanFormModal({
  title, initial, allTypes, onClose, onSave,
}: {
  title: string; initial?: BudgetPlan; allTypes: string[]; onClose: () => void; onSave: (payload: BudgetPlanDraft | BudgetPlanUpdate) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [planType, setPlanType] = useState(initial?.planType ?? allTypes[0] ?? 'Asset');
  const [addingType, setAddingType] = useState(false);
  const [newType, setNewType] = useState('');
  const [targetAmount, setTargetAmount] = useState(initial ? String(initial.targetAmount) : '');
  const [currentAmount, setCurrentAmount] = useState(initial ? String(initial.currentAmount) : '0');
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  function handleConfirmNewType() {
    if (!newType.trim()) return;
    setPlanType(newType.trim());
    setAddingType(false);
    setNewType('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !targetAmount.trim() || parseFloat(targetAmount) <= 0) return;
    onSave({
      name: name.trim(),
      planType,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || undefined,
      notes: notes.trim(),
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal budgets-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={handleSubmit} className="budgets-modal-form">
          <div className="field">
            <label>Name</label>
            <input type="text" placeholder="e.g., New laptop, Shop renovation" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="budgets-modal-row">
            <div className="field">
              <label>Type</label>
              <select value={addingType ? '__add_new__' : planType} onChange={(e) => e.target.value === '__add_new__' ? setAddingType(true) : setPlanType(e.target.value)}>
                {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                <option value="__add_new__">+ Add new type…</option>
              </select>
              {addingType && (
                <div className="inline-add-row">
                  <input type="text" placeholder="Type name" value={newType} onChange={(e) => setNewType(e.target.value)} autoFocus />
                  <button type="button" className="inline-add-confirm" onClick={handleConfirmNewType}>Add</button>
                  <button type="button" className="inline-add-cancel" onClick={() => setAddingType(false)}>Cancel</button>
                </div>
              )}
            </div>
            <div className="field">
              <label>Target Date (optional)</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
          </div>
          <div className="budgets-modal-row">
            <div className="field">
              <label>Target Amount</label>
              <input type="number" placeholder="0.00" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} step="0.01" required />
            </div>
            <div className="field">
              <label>Current Amount Saved</label>
              <input type="number" placeholder="0.00" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} step="0.01" />
            </div>
          </div>
          <div className="field">
            <label>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit">{initial ? 'Save changes' : 'Add plan'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
