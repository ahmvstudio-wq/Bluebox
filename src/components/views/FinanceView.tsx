import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Receipt, 
  ArrowDownRight, 
  Banknote,
  X
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { 
    todayRevenue, 
    totalExpenses, 
    totalWithdrawals, 
    netProfit, 
    cashInDrawer, 
    branchExpenses, 
    branchWithdrawals, 
    branchBarbers,
    addExpense, 
    addWithdrawal 
  } = useCash();

  // Expense Form Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Withdrawal Form Modal
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState(branchBarbers[0]?.id || '');
  const [withdrawalAmount, setWithdrawalAmount] = useState('50');
  const [withdrawalReason, setWithdrawalReason] = useState('Mid-month advance');

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !parseFloat(expenseAmount)) return;
    addExpense(expenseTitle, parseFloat(expenseAmount));
    setExpenseTitle('');
    setExpenseAmount('');
    setShowExpenseModal(false);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarberId || !parseFloat(withdrawalAmount)) return;
    addWithdrawal(selectedBarberId, parseFloat(withdrawalAmount), withdrawalReason);
    setWithdrawalAmount('50');
    setWithdrawalReason('Mid-month advance');
    setShowWithdrawalModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#D4AF37]" />
            Financial Overview & Cash Flow
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Single source of truth for branch revenues, daily operational expenses, and barber advance withdrawals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="btn-secondary text-xs text-rose-500 dark:text-rose-400"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Expense</span>
          </button>
          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="btn-primary-gold text-xs"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>+ Barber Advance</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Revenue */}
        <div className="card-executive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Revenue</span>
            <span className="badge-status badge-gold">Gross</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[var(--text-main)] font-mono">₾{todayRevenue.toFixed(2)}</span>
            <span className="text-xs font-bold text-[#D4AF37]">GEL</span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2">
            Earned from completed haircuts
          </div>
        </div>

        {/* 2. Expenses */}
        <div className="card-executive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Expenses</span>
            <span className="badge-status badge-red">Shop Costs</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-rose-500 dark:text-rose-400 font-mono">₾{totalExpenses.toFixed(2)}</span>
            <span className="text-xs font-bold text-rose-500 dark:text-rose-400">GEL</span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2">
            Disinfectants, towels, utilities & tea
          </div>
        </div>

        {/* 3. Barber Withdrawals */}
        <div className="card-executive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Barber Withdrawals</span>
            <span className="badge-status badge-amber">Advances</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-500 dark:text-amber-400 font-mono">₾{totalWithdrawals.toFixed(2)}</span>
            <span className="text-xs font-bold text-amber-500 dark:text-amber-400">GEL</span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2">
            Mid-month cash disbursements to barbers
          </div>
        </div>

        {/* 4. Net Profit */}
        <div className="card-executive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Net Profit</span>
            <span className="badge-status badge-neutral">Profit</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-500 dark:text-emerald-400 font-mono">₾{netProfit.toFixed(2)}</span>
            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400">GEL</span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2">
            Revenue minus operational expenses
          </div>
        </div>

      </div>

      {/* Drawer Cash Indicator Banner */}
      <div className="card-executive p-4 bg-[var(--bg-card)] border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              Physical Cash in Drawer
            </span>
            <p className="text-[11px] text-[var(--text-muted)]">
              Initial float (₾250) + cash sales − operating expenses − cash advances disbursed.
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-[#D4AF37]">
            ₾{cashInDrawer.toFixed(2)}
          </span>
          <span className="text-xs text-[var(--text-dim)]">GEL on hand</span>
        </div>
      </div>

      {/* 2-Column Lists: Expenses vs Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Operating Expenses */}
        <div className="card-executive p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              Operating Expenses
            </h3>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="text-xs font-bold text-rose-500 dark:text-rose-400 hover:underline"
            >
              + Add New
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {branchExpenses.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-dim)]">No expenses recorded today.</div>
            ) : (
              branchExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--text-main)]">{exp.title}</div>
                    <div className="text-[10px] text-[var(--text-dim)]">{exp.date}</div>
                  </div>
                  <span className="font-mono font-bold text-rose-500 dark:text-rose-400 text-sm">
                    -₾{exp.amount.toFixed(2)} GEL
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Barber Withdrawals */}
        <div className="card-executive p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Barber Withdrawals & Advances
            </h3>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="text-xs font-bold text-amber-500 dark:text-amber-400 hover:underline"
            >
              + Disburse
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {branchWithdrawals.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-dim)]">No barber advances disbursed today.</div>
            ) : (
              branchWithdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--text-main)]">{w.barberName}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{w.reason} • {w.date}</div>
                  </div>
                  <span className="font-mono font-bold text-amber-500 dark:text-amber-400 text-sm">
                    -₾{w.amount.toFixed(2)} GEL
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card-executive w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)]">Record Shop Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barbicide & Disinfectants"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Amount (GEL) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  placeholder="25.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full text-rose-500 dark:text-rose-400 font-mono font-bold text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Barber Advance Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card-executive w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)]">Disburse Barber Advance</h3>
              <button onClick={() => setShowWithdrawalModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Select Barber *</label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full"
                >
                  {branchBarbers.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Advance Amount (GEL) *</label>
                <input
                  type="number"
                  required
                  min="5"
                  step="5"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full text-amber-500 dark:text-amber-400 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Reason / Memo</label>
                <input
                  type="text"
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button type="button" onClick={() => setShowWithdrawalModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold">
                  Disburse Cash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
