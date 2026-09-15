import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Receipt, 
  ArrowDownRight, 
  Banknote,
  CreditCard,
  X,
  Layers,
  Building,
  Users,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { ExpenseCategory } from '../../types';

export const FinanceView: React.FC = () => {
  const { 
    currentBranch,
    branches,
    todayRevenue, 
    totalExpenses, 
    totalWithdrawals, 
    netProfit, 
    cashInDrawer, 
    branchExpenses, 
    branchWithdrawals, 
    branchBarbers,
    branchRevenueRecords,
    barberPerformanceList,
    expensesByCategory,
    addExpense, 
    addWithdrawal 
  } = useCash();

  // Active Ledger Tab: 'revenue' | 'expenses' | 'barber-payments'
  const [activeTab, setActiveTab] = useState<'revenue' | 'expenses' | 'barber-payments'>('revenue');

  // Expense Form Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Operational');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Withdrawal Form Modal
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState(branchBarbers[0]?.id || '');
  const [withdrawalAmount, setWithdrawalAmount] = useState('50');
  const [withdrawalReason, setWithdrawalReason] = useState('Midday advance');

  const activeBranchName = branches.find((b) => b.id === currentBranch)?.name || currentBranch;

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !parseFloat(expenseAmount)) return;
    addExpense(
      expenseTitle.trim(), 
      parseFloat(expenseAmount), 
      expenseCategory, 
      expenseDescription.trim() || undefined,
      currentBranch
    );
    setExpenseTitle('');
    setExpenseDescription('');
    setExpenseAmount('');
    setShowExpenseModal(false);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarberId || !parseFloat(withdrawalAmount)) return;
    addWithdrawal(selectedBarberId, parseFloat(withdrawalAmount), withdrawalReason);
    setWithdrawalAmount('50');
    setWithdrawalReason('Midday advance');
    setShowWithdrawalModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#D4AF37]" />
            Financial Operations & Cash Flow
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Real-time revenues, categorized operational expenses, and barber compensation settlements for {activeBranchName}.
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
            <span>+ Disburse Advance</span>
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
            {branchRevenueRecords.length} completed transactions
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
            Business, barber, customer & operational
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
            Midday cash advances drawn from drawer
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

      {/* Physical Cash Drawer Indicator */}
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
              Opening Float + Cash Collections − Cash Expenses − Barber Advances
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-[#D4AF37]">
            ₾{cashInDrawer.toFixed(2)}
          </span>
          <span className="text-xs text-[var(--text-dim)] font-bold">GEL on hand</span>
        </div>
      </div>

      {/* Categorized Expenses Summary Tiles */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Expense Category Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Business</div>
            <div className="text-lg font-black font-mono text-rose-500 mt-1">
              ₾{expensesByCategory['Business'].toFixed(2)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Internet, licenses, POS fees</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Barber/Worker</div>
            <div className="text-lg font-black font-mono text-rose-500 mt-1">
              ₾{expensesByCategory['Barber/worker'].toFixed(2)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Blades, tool replacements</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Customer-related</div>
            <div className="text-lg font-black font-mono text-rose-500 mt-1">
              ₾{expensesByCategory['Customer-related'].toFixed(2)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Espresso beans, refreshments</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Operational</div>
            <div className="text-lg font-black font-mono text-rose-500 mt-1">
              ₾{expensesByCategory['Operational'].toFixed(2)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Barbicide, towels, sanitation</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Financial Ledgers */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'revenue'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Receipt className="w-4 h-4 text-[#D4AF37]" />
          <span>Revenue Transactions ({branchRevenueRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'expenses'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Layers className="w-4 h-4 text-rose-500" />
          <span>Categorized Expenses ({branchExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('barber-payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'barber-payments'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Users className="w-4 h-4 text-amber-500" />
          <span>Barber Payments & Balances ({barberPerformanceList.length})</span>
        </button>
      </div>

      {/* TAB 1: REVENUE LEDGER */}
      {activeTab === 'revenue' && (
        <div className="card-executive p-5 overflow-hidden space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              Revenue Transactions Log
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-500">
              Total: ₾{todayRevenue.toFixed(2)} GEL
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Ticket</th>
                  <th className="pb-3 font-bold">Service</th>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Barber</th>
                  <th className="pb-3 font-bold">Branch</th>
                  <th className="pb-3 font-bold">Payment Method</th>
                  <th className="pb-3 font-bold">Date / Time</th>
                  <th className="pb-3 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {branchRevenueRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-xs text-[var(--text-dim)]">
                      No revenue transactions logged yet for this branch.
                    </td>
                  </tr>
                ) : (
                  branchRevenueRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="py-3 font-mono font-bold text-[var(--text-main)]">{r.ticketNumber}</td>
                      <td className="py-3 font-semibold text-[var(--text-main)]">{r.serviceName}</td>
                      <td className="py-3 text-[var(--text-main)]">{r.customerName}</td>
                      <td className="py-3 font-bold text-[var(--text-main)]">{r.barberName}</td>
                      <td className="py-3 uppercase text-[10px] font-bold text-[var(--text-muted)]">{r.branchId}</td>
                      <td className="py-3">
                        <span className="badge-status badge-gold uppercase text-[10px]">
                          {r.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-[var(--text-dim)] font-mono text-[11px]">{r.dateTime}</td>
                      <td className="py-3 text-right font-mono font-black text-emerald-500 text-sm">
                        +₾{r.amount.toFixed(2)} GEL
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIZED EXPENSES LEDGER */}
      {activeTab === 'expenses' && (
        <div className="card-executive p-5 overflow-hidden space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              Expenses Ledger (Business, Barber, Customer, Operational)
            </h3>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="btn-primary-gold text-xs py-1 px-2.5"
            >
              + Log Expense
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Title</th>
                  <th className="pb-3 font-bold">Description</th>
                  <th className="pb-3 font-bold">Branch</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {branchExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-[var(--text-dim)]">
                      No operating expenses recorded for this branch.
                    </td>
                  </tr>
                ) : (
                  branchExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="py-3">
                        <span className="badge-status badge-red text-[10px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[var(--text-main)]">{exp.title}</td>
                      <td className="py-3 text-[var(--text-muted)] text-[11px] max-w-xs truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="py-3 uppercase text-[10px] font-bold text-[var(--text-dim)]">{exp.branchId}</td>
                      <td className="py-3 text-[var(--text-dim)] font-mono">{exp.date}</td>
                      <td className="py-3 text-right font-mono font-black text-rose-500 dark:text-rose-400 text-sm">
                        -₾{exp.amount.toFixed(2)} GEL
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BARBER PAYMENT SETTLEMENT TABLE */}
      {activeTab === 'barber-payments' && (
        <div className="card-executive p-5 overflow-hidden space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                Barber Payment & Earnings Settlement (50% Commission)
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Each barber earns 50% net on completed haircuts. Outstanding balances are payable at cycle end.
              </p>
            </div>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="btn-primary-gold text-xs py-1.5 px-3"
            >
              + Disburse Advance
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Barber</th>
                  <th className="pb-3 font-bold">Services Done</th>
                  <th className="pb-3 font-bold">Gross Revenue</th>
                  <th className="pb-3 font-bold text-[#D4AF37]">Barber Earned (50%)</th>
                  <th className="pb-3 font-bold text-amber-500">Withdrawn / Advances</th>
                  <th className="pb-3 font-bold text-right text-emerald-500">Remaining Owed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {barberPerformanceList.map((stat) => (
                  <tr key={stat.barber.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                    <td className="py-3 font-bold text-[var(--text-main)] flex items-center gap-2.5">
                      <img
                        src={stat.barber.avatar}
                        alt={stat.barber.name}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <div>
                        <div>{stat.barber.name}</div>
                        <div className="text-[10px] text-[var(--text-dim)] font-normal">{stat.barber.specialty}</div>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[var(--text-main)]">{stat.servicesCompleted} cuts</td>
                    <td className="py-3 font-mono font-bold text-[var(--text-main)]">₾{stat.revenueGenerated.toFixed(2)} GEL</td>
                    <td className="py-3 font-mono font-black text-[#D4AF37]">₾{stat.monthEarnings.toFixed(2)} GEL</td>
                    <td className="py-3 font-mono font-black text-amber-500">-₾{stat.totalWithdrawn.toFixed(2)} GEL</td>
                    <td className="py-3 font-mono font-black text-emerald-500 dark:text-emerald-400 text-sm text-right">
                      ₾{stat.remainingOwed.toFixed(2)} GEL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD EXPENSE */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-main)]">Record Operating Expense</h3>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Expense Category *</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full font-semibold"
                >
                  <option value="Operational">Operational (Barbicide, Towels, Sanitation)</option>
                  <option value="Customer-related">Customer-related (Espresso, Beverages, Lounge)</option>
                  <option value="Barber/worker">Barber/worker (Clipper Blades, Maintenance)</option>
                  <option value="Business">Business (Internet, Licenses, Terminal)</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barbicide Restock"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full font-medium"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Description / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Disinfection liquid for 6 stations"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Amount (GEL) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-[var(--text-dim)]">₾</span>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="45.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full pl-8 font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold">
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISBURSE BARBER ADVANCE */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-main)]">Disburse Barber Cash Advance</h3>
              </div>
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Select Barber *</label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full font-semibold"
                >
                  {branchBarbers.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Advance Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midday personal advance"
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Advance Amount (GEL) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-[var(--text-dim)]">₾</span>
                  <input
                    type="number"
                    step="5"
                    required
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full pl-8 font-mono font-bold text-sm"
                  />
                </div>
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
