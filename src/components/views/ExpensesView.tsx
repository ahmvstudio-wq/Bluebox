import React, { useState, useMemo } from 'react';
import { useCash } from '../../context/CashContext';
import { ExpenseCategory, ExpensePaymentSource, BranchId } from '../../types';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Building2, 
  Banknote, 
  CreditCard, 
  TrendingDown, 
  PieChart, 
  ShieldCheck, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Layers, 
  User, 
  Tag, 
  FileText,
  Percent,
  DollarSign
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { 
    expenses, 
    addExpense, 
    deleteExpense, 
    branches, 
    barbers, 
    currentBranch, 
    setCurrentBranch,
    todayRevenue,
    cashInDrawer,
    t,
    language
  } = useCash();

  // Filters State
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Tab: 'all' | 'categories' | 'cash_drawer' | 'bank_transfer'
  const [activeLedgerTab, setActiveLedgerTab] = useState<'all' | 'categories' | 'cash_drawer' | 'bank_transfer'>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Operational');
  const [branchId, setBranchId] = useState<BranchId>(currentBranch);
  const [paymentSource, setPaymentSource] = useState<ExpensePaymentSource>('cash_drawer');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [allocatedBarberId, setAllocatedBarberId] = useState<string>('all');
  const [description, setDescription] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Branch filter
      if (selectedBranchFilter !== 'all' && exp.branchId !== selectedBranchFilter) {
        return false;
      }
      // Tab filter
      if (activeLedgerTab === 'cash_drawer' && exp.paymentSource === 'bank_transfer') {
        return false;
      }
      if (activeLedgerTab === 'bank_transfer' && exp.paymentSource !== 'bank_transfer') {
        return false;
      }
      // Category filter
      if (selectedCategoryFilter !== 'all' && exp.category !== selectedCategoryFilter) {
        return false;
      }
      // Source filter
      if (selectedSourceFilter !== 'all' && (exp.paymentSource || 'cash_drawer') !== selectedSourceFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = exp.title.toLowerCase().includes(query);
        const matchDesc = (exp.description || '').toLowerCase().includes(query);
        const matchReceipt = (exp.receiptNumber || '').toLowerCase().includes(query);
        const matchBarber = (exp.allocatedBarberName || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchReceipt && !matchBarber) {
          return false;
        }
      }
      return true;
    });
  }, [expenses, selectedBranchFilter, selectedCategoryFilter, selectedSourceFilter, searchQuery, activeLedgerTab]);

  // Aggregate Metrics Calculations
  const totalAllExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const totalCashDrawerExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.paymentSource === 'cash_drawer' || !e.paymentSource)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalBankExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.paymentSource === 'bank_transfer')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const map: Record<ExpenseCategory, { amount: number; count: number }> = {
      'Business': { amount: 0, count: 0 },
      'Barber/worker': { amount: 0, count: 0 },
      'Customer-related': { amount: 0, count: 0 },
      'Operational': { amount: 0, count: 0 },
      'Utilities': { amount: 0, count: 0 },
    };

    expenses.forEach((e) => {
      const cat = e.category || 'Operational';
      if (map[cat]) {
        map[cat].amount += e.amount;
        map[cat].count += 1;
      }
    });

    return map;
  }, [expenses]);

  // Top Category
  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryStats) as [ExpenseCategory, { amount: number; count: number }][];
    return entries.sort((a, b) => b[1].amount - a[1].amount)[0];
  }, [categoryStats]);

  // Expense to Revenue Ratio
  const expenseRatio = useMemo(() => {
    if (todayRevenue === 0) return 0;
    return (totalAllExpenses / todayRevenue) * 100;
  }, [totalAllExpenses, todayRevenue]);

  // Handle Create Expense Submit
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !parseFloat(amount)) return;

    const targetBarber = barbers.find((b) => b.id === allocatedBarberId);
    const allocatedBarberName = targetBarber ? targetBarber.name : (allocatedBarberId === 'all' ? t('expenses.modal.generalShop') : undefined);

    addExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      description: description.trim() || undefined,
      branchId,
      paymentSource,
      receiptNumber: receiptNumber.trim() || undefined,
      allocatedBarberId: allocatedBarberId !== 'all' ? allocatedBarberId : undefined,
      allocatedBarberName,
    });

    setToastMessage(`✓ ${t('expenses.modal.submit')}: "${title.trim()}" (₾${parseFloat(amount).toFixed(2)} GEL)`);
    setTitle('');
    setAmount('');
    setDescription('');
    setReceiptNumber('');
    setAllocatedBarberId('all');
    setIsAddModalOpen(false);

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Get localized category name
  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Business':
        return t('expenses.category.business');
      case 'Barber/worker':
        return t('expenses.category.barber');
      case 'Customer-related':
        return t('expenses.category.customer');
      case 'Operational':
        return t('expenses.category.operational');
      case 'Utilities':
        return t('expenses.category.utilities');
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-500 flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-[var(--text-main)]">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 text-sm font-bold">×</button>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="card-executive p-5 bg-[var(--bg-card)] border-[var(--border-subtle)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/30 shrink-0">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)]">
                {t('expenses.title')}
              </h2>
              <span className="badge-status badge-red text-[10px]">
                <ShieldCheck className="w-3 h-3" />
                {t('expenses.adminBadge')}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
              {t('expenses.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setBranchId(currentBranch);
              setIsAddModalOpen(true);
            }}
            className="btn-primary-gold text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('expenses.addBtn')}</span>
          </button>
        </div>
      </div>

      {/* 2. 5 Primary Expense KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Metric 1: Today's Expenses */}
        <div className="card-executive p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('expenses.metric.today')}
            </span>
            <span className="badge-status badge-red text-[9px] px-1.5 py-0.5 font-bold">
              {expenses.length} Records
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-rose-500 font-mono block">
              ₾{totalAllExpenses.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-dim)] block mt-0.5">
              GEL total recorded
            </span>
          </div>
        </div>

        {/* Metric 2: Cash Drawer Outflows */}
        <div className="card-executive p-4 flex flex-col justify-between border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('expenses.tab.cashDrawer')}
            </span>
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-500">
              <Banknote className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-amber-500 font-mono block">
              ₾{totalCashDrawerExpenses.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-dim)] block mt-0.5">
              Deducted from register
            </span>
          </div>
        </div>

        {/* Metric 3: Bank & Card Outflows */}
        <div className="card-executive p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('expenses.tab.bank')}
            </span>
            <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
              <CreditCard className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-mono block">
              ₾{totalBankExpenses.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-dim)] block mt-0.5">
              Non-cash payments
            </span>
          </div>
        </div>

        {/* Metric 4: Top Category */}
        <div className="card-executive p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('expenses.metric.topCategory')}
            </span>
            <span className="badge-status badge-gold text-[9px] px-1.5 py-0.5 font-bold">
              Top
            </span>
          </div>
          <div className="mt-3 min-w-0">
            <span className="text-sm sm:text-base font-bold text-[#D4AF37] block truncate">
              {topCategory ? getCategoryLabel(topCategory[0]) : 'Operational'}
            </span>
            <span className="text-xs font-mono font-bold text-[var(--text-main)] block mt-0.5">
              ₾{(topCategory ? topCategory[1].amount : 0).toFixed(2)} GEL
            </span>
          </div>
        </div>

        {/* Metric 5: Cost to Revenue Ratio */}
        <div className="card-executive p-4 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('expenses.metric.ratio')}
            </span>
            <span className="p-1 rounded-md bg-purple-500/10 text-purple-400">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black font-mono block text-purple-500 dark:text-purple-400">
              {expenseRatio.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[var(--text-dim)] block mt-0.5">
              Of daily gross revenue
            </span>
          </div>
        </div>

      </div>

      {/* 3. Categorized Breakdown Tiles */}
      <div className="card-executive p-4 sm:p-5 space-y-3 bg-[var(--bg-card)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              {t('expenses.tab.categories')}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-rose-500">
            Total: ₾{totalAllExpenses.toFixed(2)} GEL
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {(Object.entries(categoryStats) as [ExpenseCategory, { amount: number; count: number }][]).map(([cat, stat]) => {
            const percentOfTotal = totalAllExpenses > 0 ? (stat.amount / totalAllExpenses) * 100 : 0;
            const isSelected = selectedCategoryFilter === cat;

            return (
              <div
                key={cat}
                onClick={() => setSelectedCategoryFilter(isSelected ? 'all' : cat)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181B] dark:bg-[#27272A] border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/30 text-white'
                    : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] hover:border-[#D4AF37]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[var(--text-dim)]">
                  <span className="truncate">{getCategoryLabel(cat)}</span>
                  <span className="font-mono">{stat.count}x</span>
                </div>

                <div className="text-base sm:text-lg font-black font-mono text-rose-500 mt-1">
                  ₾{stat.amount.toFixed(2)}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[var(--border-subtle)] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-[#D4AF37] h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentOfTotal}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] mt-1.5 font-mono">
                  <span>{percentOfTotal.toFixed(0)}% of total</span>
                  {isSelected && <span className="text-[#D4AF37] font-bold">Active</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Toolbar & Search */}
      <div className="card-executive p-4 space-y-3 bg-[var(--bg-card)]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('expenses.filter.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 text-xs font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-dim)] hover:text-[var(--text-main)]"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Branch Filter */}
            <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs">
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] px-2">
                {t('expenses.filter.branch')}
              </span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold py-1 pl-2 pr-6 focus:ring-0 text-[var(--text-main)]"
              >
                <option value="all">{t('branch.all')}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs">
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] px-2">
                {t('expenses.filter.source')}
              </span>
              <select
                value={selectedSourceFilter}
                onChange={(e) => setSelectedSourceFilter(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold py-1 pl-2 pr-6 focus:ring-0 text-[var(--text-main)]"
              >
                <option value="all">All Sources</option>
                <option value="cash_drawer">{t('expenses.tab.cashDrawer')}</option>
                <option value="bank_transfer">{t('expenses.tab.bank')}</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(selectedBranchFilter !== 'all' || selectedCategoryFilter !== 'all' || selectedSourceFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedBranchFilter('all');
                  setSelectedCategoryFilter('all');
                  setSelectedSourceFilter('all');
                  setSearchQuery('');
                }}
                className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-dim)] hover:text-rose-500 transition-all"
                title={t('action.reset')}
              >
                <X className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>

      {/* 5. Expense Records Ledger Table */}
      <div className="card-executive p-5 overflow-hidden space-y-3 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-500" />
              <span>{t('expenses.title')} ({filteredExpenses.length})</span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Verified operational records and payment source audit trail
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-rose-500">
            Total Filtered: ₾{totalFilteredAmount.toFixed(2)} GEL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">{t('expenses.col.date')}</th>
                <th className="pb-3 font-bold">{t('expenses.col.category')}</th>
                <th className="pb-3 font-bold">{t('expenses.col.title')}</th>
                <th className="pb-3 font-bold">{t('expenses.col.branch')}</th>
                <th className="pb-3 font-bold">{t('expenses.col.allocated')}</th>
                <th className="pb-3 font-bold">{t('expenses.col.source')}</th>
                <th className="pb-3 font-bold">{t('expenses.col.receipt')}</th>
                <th className="pb-3 font-bold text-right">{t('expenses.col.amount')}</th>
                <th className="pb-3 font-bold text-center">{t('expenses.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[var(--text-dim)]">
                    {t('expenses.empty')}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isCash = exp.paymentSource === 'cash_drawer' || !exp.paymentSource;
                  const branchObj = branches.find((b) => b.id === exp.branchId);

                  return (
                    <tr key={exp.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      {/* Date */}
                      <td className="py-3 text-[var(--text-dim)] font-mono whitespace-nowrap">
                        {exp.createdAt || exp.date}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 whitespace-nowrap">
                        <span className="badge-status badge-red text-[10px]">
                          {getCategoryLabel(exp.category)}
                        </span>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 font-medium text-[var(--text-main)] max-w-xs">
                        <div className="font-bold text-[var(--text-main)]">{exp.title}</div>
                        {exp.description && (
                          <div className="text-[11px] text-[var(--text-muted)] truncate">{exp.description}</div>
                        )}
                      </td>

                      {/* Branch */}
                      <td className="py-3 uppercase text-[10px] font-bold text-[var(--text-muted)] whitespace-nowrap">
                        {branchObj?.shortName || exp.branchId}
                      </td>

                      {/* Allocated Barber / Station */}
                      <td className="py-3 text-[var(--text-dim)] whitespace-nowrap">
                        <span className="font-medium text-xs text-[var(--text-main)]">
                          {exp.allocatedBarberName || t('expenses.modal.generalShop')}
                        </span>
                      </td>

                      {/* Payment Source */}
                      <td className="py-3 whitespace-nowrap">
                        {isCash ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Banknote className="w-3 h-3" />
                            <span>Drawer Cash</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <CreditCard className="w-3 h-3" />
                            <span>Bank / Card</span>
                          </span>
                        )}
                      </td>

                      {/* Receipt / Invoice # */}
                      <td className="py-3 font-mono text-[11px] text-[var(--text-dim)] whitespace-nowrap">
                        {exp.receiptNumber || '—'}
                      </td>

                      {/* Amount */}
                      <td className="py-3 text-right font-mono font-black text-rose-500 text-sm whitespace-nowrap">
                        -₾{exp.amount.toFixed(2)} GEL
                      </td>

                      {/* Delete Action */}
                      <td className="py-3 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(t('expenses.deleteConfirm'))) {
                              deleteExpense(exp.id);
                              setToastMessage(`✓ Deleted expense: "${exp.title}"`);
                              setTimeout(() => setToastMessage(null), 3500);
                            }
                          }}
                          className="p-1.5 text-[var(--text-dim)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          title={t('action.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Comprehensive Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)]">
                    {t('expenses.modal.title')}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t('expenses.modal.subtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              
              {/* Category & Branch Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">
                    {t('expenses.modal.categoryLabel')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full font-semibold"
                  >
                    <option value="Operational">{t('expenses.category.operational')}</option>
                    <option value="Barber/worker">{t('expenses.category.barber')}</option>
                    <option value="Customer-related">{t('expenses.category.customer')}</option>
                    <option value="Business">{t('expenses.category.business')}</option>
                    <option value="Utilities">{t('expenses.category.utilities')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">
                    {t('expenses.modal.branchLabel')}
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value as BranchId)}
                    className="w-full font-semibold"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Allocated Barber / Station */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  {t('expenses.modal.barberLabel')}
                </label>
                <select
                  value={allocatedBarberId}
                  onChange={(e) => setAllocatedBarberId(e.target.value)}
                  className="w-full font-semibold"
                >
                  <option value="all">{t('expenses.modal.generalShop')}</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.specialty}) — {b.branchId.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expense Title */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  {t('expenses.modal.titleLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('expenses.modal.titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full font-medium"
                />
              </div>

              {/* Amount & Payment Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">
                    {t('expenses.modal.amountLabel')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-[var(--text-dim)]">₾</span>
                    <input
                      type="number"
                      step="0.5"
                      required
                      placeholder="45.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 font-mono font-bold text-sm text-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">
                    {t('expenses.modal.sourceLabel')}
                  </label>
                  <select
                    value={paymentSource}
                    onChange={(e) => setPaymentSource(e.target.value as ExpensePaymentSource)}
                    className="w-full font-semibold"
                  >
                    <option value="cash_drawer">1. Cash Drawer (Physical)</option>
                    <option value="bank_transfer">2. Bank / Card / Terminal</option>
                  </select>
                </div>
              </div>

              {/* Receipt / Invoice # */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  {t('expenses.modal.receiptLabel')}
                </label>
                <input
                  type="text"
                  placeholder={t('expenses.modal.receiptPlaceholder')}
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full font-mono"
                />
              </div>

              {/* Description / Notes */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  {t('expenses.modal.notesLabel')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('expenses.modal.notesPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                >
                  {t('expenses.modal.submit')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
