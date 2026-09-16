import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  Wallet, 
  Plus, 
  Receipt, 
  ArrowDownRight, 
  Banknote,
  X,
  Layers,
  Building,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sliders,
  Scale,
  ShieldCheck
} from 'lucide-react';
import { ExpenseCategory, DailyCloseStatus } from '../../types';

export const FinanceView: React.FC = () => {
  const { 
    currentBranch,
    setCurrentBranch,
    branches,
    todayRevenue, 
    totalExpenses, 
    totalWithdrawals, 
    netProfit, 
    cashInDrawer, 
    branchExpenses, 
    branchBarbers,
    branchRevenueRecords,
    barberPerformanceList,
    expensesByCategory,
    addExpense, 
    addWithdrawal,
    reconciliations,
    performDailyClose,
    updateReconciliationStatus,
    commissionBaseRule,
    setCommissionBaseRule,
    t
  } = useCash();

  // Active Ledger Tab: 'revenue' | 'expenses' | 'barber-payments' | 'reconciliation'
  const [activeTab, setActiveTab] = useState<'revenue' | 'expenses' | 'barber-payments' | 'reconciliation'>('revenue');

  // Expense Form Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Operational');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseBarberId, setExpenseBarberId] = useState<string>('all');

  // Withdrawal Form Modal
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState(branchBarbers[0]?.id || '');
  const [withdrawalAmount, setWithdrawalAmount] = useState('50');
  const [withdrawalReason, setWithdrawalReason] = useState('Midday advance');

  // Daily Close Modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [physicalCashCount, setPhysicalCashCount] = useState('');
  const [reconciliationNotes, setReconciliationNotes] = useState('');

  const currentRecon = reconciliations[currentBranch];
  const activeBranchName = branches.find((b) => b.id === currentBranch)?.name || currentBranch;

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !parseFloat(expenseAmount)) return;
    const targetBarber = branchBarbers.find(b => b.id === expenseBarberId);
    const fullDesc = targetBarber 
      ? `Allocated to ${targetBarber.name}: ${expenseDescription.trim() || 'Supplies'}` 
      : (expenseDescription.trim() || undefined);

    addExpense(
      expenseTitle.trim(), 
      parseFloat(expenseAmount), 
      expenseCategory, 
      fullDesc,
      currentBranch
    );
    setExpenseTitle('');
    setExpenseDescription('');
    setExpenseAmount('');
    setExpenseBarberId('all');
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

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const countVal = parseFloat(physicalCashCount);
    if (isNaN(countVal)) return;
    performDailyClose(currentBranch, countVal, reconciliationNotes);
    setShowCloseModal(false);
    setPhysicalCashCount('');
    setReconciliationNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#D4AF37]" />
            {t('finance.title', 'Financial Operations, Audit & Cash Reconciliation')}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {t('finance.subtitle', 'Single-source atomic transaction rollup, end-of-day cash drawer balancing, and branch audit trails.')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="btn-secondary text-xs text-rose-500 dark:text-rose-400"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('header.addExpense', '+ Add Expense')}</span>
          </button>
          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="btn-secondary text-xs text-amber-500 dark:text-amber-400"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{t('finance.disburseAdvance', '+ Disburse Advance')}</span>
          </button>
          <button
            onClick={() => {
              setPhysicalCashCount(cashInDrawer.toString());
              setShowCloseModal(true);
            }}
            className="btn-primary-gold text-xs shadow-lg shadow-[#D4AF37]/15"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{t('finance.endOfDayClose', 'End-of-Day Close')}</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* 1. Revenue */}
        <div className="card-executive p-3.5 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('finance.revenue', 'Revenue')}</span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-1.5 py-0.5">{t('finance.gross', 'Gross')}</span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-black text-[var(--text-main)] font-mono">₾{todayRevenue.toFixed(2)}</span>
            <span className="text-[10px] sm:text-xs font-bold text-[#D4AF37]">GEL</span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-1.5 sm:pt-2 truncate">
            {branchRevenueRecords.length} {t('finance.completedTransactions', 'completed transactions')}
          </div>
        </div>

        {/* 2. Expenses */}
        <div className="card-executive p-3.5 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('nav.short.expenses', 'Expenses')}</span>
            <span className="badge-status badge-red text-[9px] sm:text-[10px] px-1.5 py-0.5">{t('finance.costs', 'Costs')}</span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-black text-rose-500 dark:text-rose-400 font-mono">₾{totalExpenses.toFixed(2)}</span>
            <span className="text-[10px] sm:text-xs font-bold text-rose-500 dark:text-rose-400">GEL</span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-1.5 sm:pt-2 truncate">
            {t('finance.allCategorizedCosts', 'All categorized costs')}
          </div>
        </div>

        {/* 3. Barber Withdrawals */}
        <div className="card-executive p-3.5 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('auth.scope.advances', 'Advances')}</span>
            <span className="badge-status badge-amber text-[9px] sm:text-[10px] px-1.5 py-0.5">{t('finance.staff', 'Staff')}</span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 font-mono">₾{totalWithdrawals.toFixed(2)}</span>
            <span className="text-[10px] sm:text-xs font-bold text-amber-500 dark:text-amber-400">GEL</span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-1.5 sm:pt-2 truncate">
            {t('finance.middayAdvancesDrawn', 'Midday advances drawn')}
          </div>
        </div>

        {/* 4. Net Profit */}
        <div className="card-executive p-3.5 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('header.netProfit', 'Net Profit')}</span>
            <span className="badge-status badge-neutral text-[9px] sm:text-[10px] px-1.5 py-0.5">{t('finance.profit', 'Profit')}</span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="text-xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400 font-mono">₾{netProfit.toFixed(2)}</span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-500 dark:text-emerald-400">GEL</span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-1.5 sm:pt-2 truncate">
            {t('finance.netCashRetained', 'Net cash retained')}
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
              {t('finance.physicalDrawer', 'Physical Cash in Drawer')}
            </span>
            <p className="text-[11px] text-[var(--text-muted)]">
              {t('finance.physicalDrawerDesc', 'Opening Float + Cash Collections − Cash Expenses − Barber Advances')}
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-[#D4AF37]">
            ₾{cashInDrawer.toFixed(2)}
          </span>
          <span className="text-xs text-[var(--text-dim)] font-bold">{t('header.cashOnHand', 'GEL on hand')}</span>
        </div>
      </div>

      {/* Multi-Branch Reconciliation & Close Status Bar */}
      <div className="card-executive p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              {t('finance.multiBranchStatus', 'Multi-Branch Daily Close Status Flow')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-dim)]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{t('finance.statusFlowDesc', 'Flow: Open → Counted → Reviewed → Closed/Locked')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {branches.map((b) => {
            const recon = reconciliations[b.id];
            const isCurrent = b.id === currentBranch;
            const status = recon?.status || 'open';
            const variance = recon?.variance || 0;

            const statusBadgeConfig: Record<DailyCloseStatus, { label: string; color: string }> = {
              open: { label: t('status.open', 'Open'), color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
              counted: { label: t('status.counted', 'Counted'), color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
              reviewed: { label: t('status.reviewed', 'Reviewed'), color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
              closed: { label: t('status.closed', 'Closed / Locked'), color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
            };
            const currentBadge = statusBadgeConfig[status];

            return (
              <div
                key={b.id}
                onClick={() => setCurrentBranch(b.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#18181B] border-[#D4AF37]/40 shadow-sm ring-1 ring-[#D4AF37]/30'
                    : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] hover:border-[var(--border-card)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-[var(--text-main)] flex items-center gap-1.5">
                    {b.name}
                    {isCurrent && <span className="text-[10px] text-[#D4AF37] font-semibold">({t('finance.active', 'Active')})</span>}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentBadge.color}`}>
                    {currentBadge.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border-subtle)]/60">
                  <span className="text-[var(--text-dim)]">{t('finance.expectedCash', 'Expected Cash')}:</span>
                  <span className="font-mono font-bold text-[var(--text-main)]">
                    ₾{(recon?.expectedCash || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] mt-0.5">
                  <span className="text-[var(--text-dim)]">{t('finance.variance', 'Variance')}:</span>
                  <span className={`font-mono font-bold ${
                    variance === 0 ? 'text-emerald-500' : variance > 0 ? 'text-blue-400' : 'text-rose-500'
                  }`}>
                    {variance === 0 ? `₾0.00 ${t('finance.exact', 'Exact')}` : `${variance > 0 ? '+' : ''}₾${variance.toFixed(2)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commission Base Pricing Rule Settings Card */}
      <div className="card-executive p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 mt-0.5">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)]">
                {t('finance.ruleSetting', 'Commission Pricing Base Rule (Student 20% Discount Policy)')}
              </span>
              <span className="badge-status badge-gold text-[9px] px-1.5 py-0.2">{t('finance.shopSetting', 'Shop Setting')}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {t('finance.ruleSettingDesc', 'Choose whether barber commission split is calculated on actual discounted amount collected vs standard full list price.')}
            </p>
          </div>
        </div>

        <div className="flex items-center bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] shrink-0 self-end sm:self-center">
          <button
            onClick={() => setCommissionBaseRule('discounted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              commissionBaseRule === 'discounted'
                ? 'bg-[#D4AF37] text-black shadow-xs font-black'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {t('finance.actualDiscounted', 'Actual Discounted Price (e.g. ₾36)')}
          </button>
          <button
            onClick={() => setCommissionBaseRule('list_price')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              commissionBaseRule === 'list_price'
                ? 'bg-[#D4AF37] text-black shadow-xs font-black'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {t('finance.fullListPrice', 'Full List Price (e.g. ₾45)')}
          </button>
        </div>
      </div>

      {/* Categorized Expenses Summary Tiles */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {t('finance.catBreakdown', 'Expense Category Breakdown')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="text-[10px] uppercase font-bold text-[var(--text-dim)]">{t('expenses.category.business', 'Business')}</div>
            <div className="text-lg font-black font-mono text-rose-500 mt-1">
              ₾{expensesByCategory['Business'].toFixed(2)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Internet, licenses, POS fees</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="text-[10px] uppercase font-bold text-[var(--text-dim)]">{t('expenses.category.barber', 'Barber/Worker')}</div>
            <div className="text-lg font-black font-mono text-rose-500 mt-1">
              ₾{expensesByCategory['Barber/worker'].toFixed(2)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Blades, tool replacements</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="text-[10px] uppercase font-bold text-[var(--text-dim)]">{t('expenses.category.customer', 'Customer-related')}</div>
            <div className="text-lg font-black font-mono text-rose-500 mt-1">
              ₾{expensesByCategory['Customer-related'].toFixed(2)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Espresso beans, refreshments</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="text-[10px] uppercase font-bold text-[var(--text-dim)]">{t('expenses.category.operational', 'Operational')}</div>
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
          <span>{t('finance.tab.revenue', '1. Atomic Revenue Ledger')} ({branchRevenueRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'reconciliation'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-500" />
          <span>{t('finance.tab.recon', '4. Cash Drawer Reconciliation & Audit')}</span>
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
          <span>{t('finance.tab.expenses', '2. Categorized Expenses')} ({branchExpenses.length})</span>
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
          <span>{t('finance.tab.barbers', '3. Barber Payout Settlements')} ({barberPerformanceList.length})</span>
        </button>
      </div>

      {/* TAB 1: REVENUE LEDGER */}
      {activeTab === 'revenue' && (
        <div className="card-executive p-5 overflow-hidden space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                {t('finance.revenueLedger', 'Atomic Revenue Ledger')}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Each completed service derives barber earnings, shop margin, and cash flow automatically.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500">
              {t('finance.totalRevenue', 'Total Revenue:')} ₾{todayRevenue.toFixed(2)} GEL
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">{t('finance.th.ticket', 'Ticket')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.service', 'Service')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.customer', 'Customer')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.barber', 'Barber')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.branch', 'Branch')}</th>
                  <th className="pb-3 font-bold">{t('payment.method', 'Payment Method')}</th>
                  <th className="pb-3 font-bold">{t('finance.dateTime', 'Date / Time')}</th>
                  <th className="pb-3 font-bold text-right">{t('finance.amount', 'Amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {branchRevenueRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-xs text-[var(--text-dim)]">
                      {t('finance.noRevenue', 'No revenue transactions recorded for this branch today.')}
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

      {/* TAB 2: CASH RECONCILIATION & AUDIT SUITE */}
      {activeTab === 'reconciliation' && currentRecon && (
        <div className="space-y-4">
          
          {/* Main Reconciliation Audit Card */}
          <div className="card-executive p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-500" />
                  {t('finance.dailyReconTitle', 'Daily Cash Drawer Audit & Reconciliation')} — {activeBranchName}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {t('finance.dailyReconSubtitle', 'Verifies physical register cash against recorded sales to prevent leakage and detect cash variances.')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-dim)] font-semibold">{t('finance.status', 'Status:')}</span>
                <select
                  value={currentRecon.status}
                  onChange={(e) => updateReconciliationStatus(currentBranch, e.target.value as DailyCloseStatus)}
                  className="text-xs font-bold bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1"
                >
                  <option value="open">{t('status.open', 'Open')}</option>
                  <option value="counted">{t('status.counted', 'Counted')}</option>
                  <option value="reviewed">{t('status.reviewed', 'Reviewed')}</option>
                  <option value="closed">{t('status.closed', 'Closed / Locked')}</option>
                </select>

                <button
                  onClick={() => {
                    setPhysicalCashCount(cashInDrawer.toString());
                    setShowCloseModal(true);
                  }}
                  className="btn-primary-gold text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('finance.performClose', 'Perform Count & Close')}</span>
                </button>
              </div>
            </div>

            {/* Reconciliation Math Ledger Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">{t('finance.openingRegisterFloat', '1. Opening Float')}</span>
                <div className="text-lg font-black font-mono text-[var(--text-main)]">
                  ₾{currentRecon.openingFloat.toFixed(2)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">Initial cash in register</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-500">{t('finance.plusCashCollections', '(+) Cash Sales')}</span>
                <div className="text-lg font-black font-mono text-emerald-500">
                  +₾{currentRecon.cashSales.toFixed(2)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">{t('finance.cashSales', 'Cash Sales')}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-500">{t('finance.minusCashExpenses', '(-) Cash Expenses')}</span>
                <div className="text-lg font-black font-mono text-rose-500">
                  -₾{currentRecon.cashExpenses.toFixed(2)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">{t('finance.cashExpenses', 'Cash Expenses')}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-500">{t('finance.minusStaffAdvances', '(-) Staff Advances')}</span>
                <div className="text-lg font-black font-mono text-amber-500">
                  -₾{currentRecon.barberAdvances.toFixed(2)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">{t('finance.staffAdvances', 'Staff Advances')}</div>
              </div>

              <div className="space-y-1 p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                <span className="text-[10px] uppercase font-black text-[#D4AF37]">{t('finance.expectedPhysicalCash', '(=) Expected Cash')}</span>
                <div className="text-xl font-black font-mono text-[#D4AF37]">
                  ₾{currentRecon.expectedCash.toFixed(2)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-bold">{t('finance.expectedCash', 'Expected Cash')}</div>
              </div>

            </div>

            {/* Expected vs Counted Comparison Banner */}
            {(() => {
              const counted = currentRecon.countedCash ?? currentRecon.expectedCash;
              const reconVariance = currentRecon.variance ?? 0;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="p-4 rounded-xl border bg-[var(--bg-card)] border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">{t('finance.countedPhysicalCash', 'Counted Physical Cash')}</span>
                      <div className="text-2xl font-black font-mono text-[var(--text-main)] mt-0.5">
                        ₾{counted.toFixed(2)} GEL
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Last counted at {currentRecon.closedAt ? new Date(currentRecon.closedAt).toLocaleTimeString() : 'In Progress'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                      <Banknote className="w-6 h-6" />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    reconVariance === 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : reconVariance > 0
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                  }`}>
                    <div>
                      <span className="text-[10px] uppercase font-bold opacity-80">
                        {t('finance.netCashVariance', 'Reconciliation Variance Result')}
                      </span>
                      <div className="text-2xl font-black font-mono mt-0.5">
                        {reconVariance === 0 && `₾0.00 ${t('finance.exactMatch', 'Exact match verified')}`}
                        {reconVariance > 0 && `+₾${reconVariance.toFixed(2)} ${t('finance.overage', 'Overage')}`}
                        {reconVariance < 0 && `-₾${Math.abs(reconVariance).toFixed(2)} ${t('finance.shortage', 'Shortage Alert')}`}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/10">
                      {reconVariance === 0 ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                  </div>

                </div>
              );
            })()}

            {currentRecon.notes && (
              <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                <span className="font-bold text-[var(--text-main)]">{t('finance.notesSignoff', 'Closing Audit Notes')}: </span>
                {currentRecon.notes}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: CATEGORIZED EXPENSES LEDGER */}
      {activeTab === 'expenses' && (
        <div className="card-executive p-5 overflow-hidden space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              {t('finance.expensesLedger', 'Categorized Expenses')}
            </h3>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="btn-primary-gold text-xs py-1 px-2.5"
            >
              {t('header.addExpense', '+ Add Expense')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">{t('finance.th.category', 'Category')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.title', 'Title')}</th>
                  <th className="pb-3 font-bold">{t('expenses.modal.notesLabel', 'Description')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.branch', 'Branch')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.date', 'Date')}</th>
                  <th className="pb-3 font-bold text-right">{t('finance.amount', 'Amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {branchExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-[var(--text-dim)]">
                      {t('finance.noExpenses', 'No operating expenses recorded for this branch.')}
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

      {/* TAB 4: BARBER PAYMENT SETTLEMENT TABLE */}
      {activeTab === 'barber-payments' && (
        <div className="card-executive p-5 overflow-hidden space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                {t('finance.payoutTitle', 'Barber Commission & Settlement Ledger (50% Standard)')}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {t('finance.payoutSubtitle', 'Automated 50% commission calculation minus advances drawn during shift.')}
              </p>
            </div>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="btn-primary-gold text-xs py-1.5 px-3"
            >
              {t('finance.disburseAdvance', '+ Disburse Advance')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">{t('finance.th.barberStylist', 'Barber')}</th>
                  <th className="pb-3 font-bold">{t('dash.cutsDone', 'Services Done')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.grossGenerated', 'Gross Revenue')}</th>
                  <th className="pb-3 font-bold text-[#D4AF37]">{t('finance.th.earned', 'Barber Earned (50%)')}</th>
                  <th className="pb-3 font-bold text-amber-500">{t('finance.th.advances', 'Withdrawn / Advances')}</th>
                  <th className="pb-3 font-bold text-right text-emerald-500">{t('barber.remainingBalance', 'Remaining Owed')}</th>
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
                    <td className="py-3 font-mono text-[var(--text-main)]">{stat.servicesCompleted} {t('dash.cuts', 'cuts')}</td>
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-main)]">{t('finance.modal.expenseTitle', 'Record Business / Shop Expense')}</h3>
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
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('finance.modal.expenseCategory', 'Expense Category *')}</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full font-semibold"
                >
                  <option value="Operational">{t('expenses.category.operational', 'Operational')}</option>
                  <option value="Customer-related">{t('expenses.category.customer', 'Customer-related')}</option>
                  <option value="Barber/worker">{t('expenses.category.barber', 'Barber/Worker')}</option>
                  <option value="Business">{t('expenses.category.business', 'Business')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('finance.modal.assignBarber', 'Assign to Barber / Station (Optional)')}</label>
                <select
                  value={expenseBarberId}
                  onChange={(e) => setExpenseBarberId(e.target.value)}
                  className="w-full font-semibold"
                >
                  <option value="all">{t('finance.modal.allStaff', 'General Shop (All Staff)')}</option>
                  {branchBarbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('finance.modal.expenseItem', 'Expense Title / Item Description *')}</label>
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
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('finance.modal.expenseNotes', 'Notes / Memo (Optional)')}</label>
                <input
                  type="text"
                  placeholder="e.g. Disinfection liquid for 6 stations"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('finance.modal.expenseAmount', 'Expense Amount (GEL) *')}</label>
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
                  {t('action.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn-primary-gold">
                  {t('finance.modal.recordExpense', 'Record Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISBURSE BARBER ADVANCE */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-main)]">{t('finance.modal.advanceTitle', 'Disburse Barber Cash Advance')}</h3>
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
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('finance.modal.selectBarber', 'Select Barber Receiving Advance *')}</label>
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
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('finance.modal.advanceReason', 'Reason / Memo *')}</label>
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
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('finance.modal.advanceAmount', 'Advance Amount (GEL) *')}</label>
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
                  {t('action.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn-primary-gold">
                  {t('finance.modal.disburseAdvance', 'Disburse Cash Advance')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: END OF DAY CASH DRAWER RECONCILIATION */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)]">
                    {t('finance.closeModalTitle', 'End-of-Day Cash Close')} — {activeBranchName}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {t('finance.dailyReconSubtitle', 'Verify cash drawer balance and audit variance')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCloseModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReconcileSubmit} className="space-y-4 text-xs">
              
              {/* Drawer Math Review */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-dim)]">{t('finance.expectedPhysicalCash', 'Expected Physical Register Cash:')}</span>
                  <span className="font-mono font-bold text-base text-[#D4AF37]">
                    ₾{cashInDrawer.toFixed(2)} GEL
                  </span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {t('finance.physicalDrawerDesc', 'Opening Float + Cash Collections − Cash Expenses − Barber Advances')}
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  {t('finance.modal.countedCash', 'Counted Physical Cash in Drawer (GEL) *')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-[var(--text-dim)]">₾</span>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="575.00"
                    value={physicalCashCount}
                    onChange={(e) => setPhysicalCashCount(e.target.value)}
                    className="w-full pl-8 font-mono font-bold text-base"
                  />
                </div>
              </div>

              {/* Dynamic Live Variance Display */}
              {physicalCashCount && !isNaN(parseFloat(physicalCashCount)) && (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  parseFloat(physicalCashCount) - cashInDrawer === 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : parseFloat(physicalCashCount) - cashInDrawer > 0
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                }`}>
                  <div className="flex items-center gap-2">
                    {parseFloat(physicalCashCount) - cashInDrawer === 0 ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span className="font-bold">
                      {parseFloat(physicalCashCount) - cashInDrawer === 0 && `Variance: ₾0.00 ${t('finance.exactMatch', 'Exact match verified')}`}
                      {parseFloat(physicalCashCount) - cashInDrawer > 0 && `Variance: +₾${(parseFloat(physicalCashCount) - cashInDrawer).toFixed(2)} ${t('finance.overage', 'Overage')}`}
                      {parseFloat(physicalCashCount) - cashInDrawer < 0 && `Variance: -₾${Math.abs(parseFloat(physicalCashCount) - cashInDrawer).toFixed(2)} ${t('finance.shortage', 'Shortage Alert')}`}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  {t('finance.modal.reconNotes', 'Reconciliation Notes & Sign-off *')}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Counted by manager, all physical receipts matched."
                  value={reconciliationNotes}
                  onChange={(e) => setReconciliationNotes(e.target.value)}
                  className="w-full resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button type="button" onClick={() => setShowCloseModal(false)} className="btn-secondary">
                  {t('action.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn-primary-gold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t('finance.modal.lockClose', 'Lock & Complete Day Close')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
