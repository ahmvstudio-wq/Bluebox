import React, { useState, useEffect } from 'react';
import { useCash } from '../context/CashContext';
import { BranchId, ExpenseCategory, ExpensePaymentSource } from '../types';
import { DemoTab } from './Sidebar';
import { 
  Clock, 
  Sun, 
  Moon, 
  Menu, 
  ChevronDown, 
  Banknote, 
  X, 
  CheckCircle2, 
  Languages 
} from 'lucide-react';

interface DashboardHeaderProps {
  onNavigateTab: (tab: DemoTab) => void;
  onOpenMobileDrawer?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onNavigateTab,
  onOpenMobileDrawer 
}) => {
  const {
    currentBranch,
    setCurrentBranch,
    branches,
    branchBarbers,
    cashInDrawer,
    netProfit,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    t,
    addExpense
  } = useCash();

  const [localTime, setLocalTime] = useState('');

  // Header Quick Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Operational');
  const [expensePaymentSource, setExpensePaymentSource] = useState<ExpensePaymentSource>('cash_drawer');
  const [expenseBarberId, setExpenseBarberId] = useState<string>('all');
  const [expenseReceiptNumber, setExpenseReceiptNumber] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
          timeZone: 'Asia/Tbilisi',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !parseFloat(expenseAmount)) return;

    const targetBarber = branchBarbers.find((b) => b.id === expenseBarberId);
    const fullDesc = targetBarber 
      ? `Allocated to ${targetBarber.name}: ${expenseNotes.trim() || 'Supplies'}` 
      : (expenseNotes.trim() || undefined);

    addExpense(
      expenseTitle.trim(),
      parseFloat(expenseAmount),
      expenseCategory,
      fullDesc,
      currentBranch,
      expensePaymentSource,
      expenseReceiptNumber.trim() || undefined
    );

    setSuccessToast(`✓ ${t('action.confirm', 'Expense recorded')}: "${expenseTitle.trim()}" (₾${parseFloat(expenseAmount).toFixed(2)} GEL)`);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');
    setExpenseReceiptNumber('');
    setExpensePaymentSource('cash_drawer');
    setExpenseBarberId('all');
    setIsExpenseModalOpen(false);

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <header className="bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] px-3 sm:px-6 py-2 sm:py-3 shrink-0 transition-colors z-30">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="mb-2 p-2.5 bg-emerald-950/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-500 flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-[var(--text-main)]">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-500 text-sm font-bold">×</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MOBILE HEADER LAYOUT (Visible on < lg screens) */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col gap-2">
        
        {/* Mobile Row 1: Menu + Brand Logo/Name + Branch Selector Pill + Language Switcher + Theme Toggle */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Brand & Drawer Trigger */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onOpenMobileDrawer}
              className="p-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] active:scale-95 transition-all shrink-0"
              aria-label="Open Operations Menu"
            >
              <Menu className="w-4 h-4 text-[#D4AF37]" />
            </button>

            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src="/logo.jpg"
                alt="Blackbox Barber"
                className="w-6 h-6 rounded-full border border-[#D4AF37] object-cover shrink-0"
              />
              <span className="font-black text-xs tracking-wider text-[var(--text-main)] font-['Cinzel',serif] truncate">
                {t('brand.name', 'BLACKBOX')}
              </span>
            </div>
          </div>

          {/* Right: Branch Pill Dropdown + Language Toggle + Theme Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Native Luxury Branch Dropdown Pill */}
            <div className="relative flex items-center">
              <select
                value={currentBranch}
                onChange={(e) => setCurrentBranch(e.target.value as BranchId)}
                className="appearance-none bg-[var(--bg-subtle)] text-[var(--text-main)] font-bold text-[11px] py-1 pl-2 pr-5 rounded-lg border border-[var(--border-subtle)] focus:border-[#D4AF37] shadow-xs cursor-pointer"
                style={{ backgroundImage: 'none' }}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.shortName} ({b.barberCount})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#D4AF37] absolute right-1 pointer-events-none" />
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all active:scale-95 text-[11px] font-bold"
              title={language === 'en' ? 'العربية' : 'English'}
            >
              <Languages className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all active:scale-95"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#71717A]" />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Row 2: Financial Pill + Action Buttons */}
        <div className="flex items-center justify-between gap-1.5">
          
          {/* Financial Status Pill */}
          <div className="flex-1 flex items-center justify-around py-1 px-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs min-w-0">
            <div className="flex items-baseline gap-1 truncate">
              <span className="text-[8px] uppercase font-bold text-[var(--text-dim)]">{t('header.drawerCash', 'Cash')}:</span>
              <span className="font-extrabold font-mono text-[11px] text-[#D4AF37]">
                ₾{cashInDrawer.toFixed(0)}
              </span>
            </div>

            <div className="h-3.5 w-px bg-[var(--border-subtle)]"></div>

            <div className="flex items-baseline gap-1 truncate">
              <span className="text-[8px] uppercase font-bold text-[var(--text-dim)]">{t('header.netProfit', 'Net')}:</span>
              <span className={`font-extrabold font-mono text-[11px] ${
                netProfit >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'
              }`}>
                {netProfit >= 0 ? '+' : ''}₾{netProfit.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onNavigateTab('booking')}
              className="btn-primary-gold text-[10px] py-1.5 px-2 font-bold transition-all active:scale-95 whitespace-nowrap"
            >
              {t('header.bookClient', '+ Book')}
            </button>

            <button
              onClick={() => onNavigateTab('booking')}
              className="btn-secondary text-[10px] py-1.5 px-2 font-bold transition-all active:scale-95 text-[var(--text-main)] hover:border-[#D4AF37] whitespace-nowrap"
            >
              {t('header.walkIn', '+ Walk-In')}
            </button>

            {/* Mobile + Expense Action (Navigates to dedicated Expense Tracking module) */}
            <button
              onClick={() => onNavigateTab('expenses')}
              className="px-2 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/30 text-[10px] font-bold transition-all active:scale-95 whitespace-nowrap"
              title={t('expenses.title', 'Expense Tracking')}
            >
              {t('nav.short.expenses', '+ Exp')}
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP HEADER LAYOUT (Visible on >= lg screens only) */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        
        {/* Left: Branch Selector Tabs & Clock */}
        <div className="flex items-center gap-3">
          
          <div className="flex items-center bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)]">
            {branches.map((b) => {
              const isActive = currentBranch === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setCurrentBranch(b.id as BranchId)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#18181B] dark:bg-[#27272A] text-white shadow-sm border border-[var(--border-card)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {b.shortName} ({b.barberCount})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-mono text-[var(--text-main)] font-semibold">{localTime}</span>
            <span className="text-[10px] text-[var(--text-dim)]">Tbilisi</span>
          </div>

        </div>

        {/* Right: Balances, Language Switcher, Theme Toggle & Navigation Shortcuts */}
        <div className="flex items-center gap-3">
          
          {/* Drawer Cash & Net Profit */}
          <div className="flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] tracking-wider">
                {t('header.drawerCash', 'Drawer Cash')}
              </span>
              <span className="font-extrabold font-mono text-sm text-[#D4AF37] leading-tight">
                ₾{cashInDrawer.toFixed(2)}
              </span>
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]"></div>

            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] tracking-wider">
                {t('header.netProfit', 'Net Profit')}
              </span>
              <span className={`font-extrabold font-mono text-sm leading-tight ${
                netProfit >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'
              }`}>
                {netProfit >= 0 ? '+' : ''}₾{netProfit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bilingual Language Switcher Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 shadow-xs"
            title={language === 'en' ? 'التبديل إلى اللغة العربية' : 'Switch to English'}
          >
            <Languages className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all flex items-center gap-1.5 text-xs font-semibold active:scale-95"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-medium">{t('theme.light', 'Light')}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#71717A]" />
                <span className="text-xs font-medium">{t('theme.dark', 'Dark')}</span>
              </>
            )}
          </button>

          {/* Quick Action Buttons (Book Client, Walk-In, Add Expense) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('booking')}
              className="btn-primary-gold text-xs py-1.5 px-3 font-bold transition-all active:scale-95"
            >
              {t('header.bookClient', '+ Book Client')}
            </button>

            <button
              onClick={() => onNavigateTab('booking')}
              className="btn-secondary text-xs py-1.5 px-3 font-bold transition-all active:scale-95 text-[var(--text-main)] hover:border-[#D4AF37]"
            >
              {t('header.walkIn', '+ Walk-In')}
            </button>

            {/* Direct Add Expense Button */}
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-xs"
            >
              <span>{t('header.addExpense', '+ Add Expense')}</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. UNIVERSAL QUICK EXPENSE MODAL (Admin Only) */}
      {/* ========================================================================= */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)]">{t('expenses.modal.title', 'Record Operating Expense')}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{t('expenses.modal.subtitle', 'Logged directly from management bar')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('expenses.modal.categoryLabel', 'Expense Category *')}</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full font-semibold"
                >
                  <option value="Operational">{t('expenses.category.operational', 'Operational & Sanitation')}</option>
                  <option value="Customer-related">{t('expenses.category.customer', 'Customer Amenities & Hospitality')}</option>
                  <option value="Barber/worker">{t('expenses.category.barber', 'Barber / Station Supplies')}</option>
                  <option value="Business">{t('expenses.category.business', 'Business & Software')}</option>
                  <option value="Utilities">{t('expenses.category.utilities', 'Utilities & Rent')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('expenses.modal.barberLabel', 'Assign to Barber (Optional)')}</label>
                <select
                  value={expenseBarberId}
                  onChange={(e) => setExpenseBarberId(e.target.value)}
                  className="w-full font-semibold"
                >
                  <option value="all">{t('expenses.modal.generalShop', 'General Shop (All Staff)')}</option>
                  {branchBarbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('expenses.modal.titleLabel', 'Expense Title *')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('expenses.modal.titlePlaceholder', 'e.g. Neck strips, Barbicide, Towels, Coffee beans')}
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('expenses.modal.amountLabel', 'Amount (GEL) *')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-[var(--text-dim)]">₾</span>
                    <input
                      type="number"
                      step="0.5"
                      required
                      placeholder="45.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full pl-8 font-mono font-bold text-sm text-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('expenses.modal.sourceLabel', 'Payment Source *')}</label>
                  <select
                    value={expensePaymentSource}
                    onChange={(e) => setExpensePaymentSource(e.target.value as ExpensePaymentSource)}
                    className="w-full font-semibold"
                  >
                    <option value="cash_drawer">{t('payment.cashDrawer', 'Cash Register Drawer')}</option>
                    <option value="bank_transfer">{t('payment.bankTransfer', 'Bank Transfer / Card')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('expenses.modal.receiptLabel', 'Receipt # (Optional)')}</label>
                <input
                  type="text"
                  placeholder={t('expenses.modal.receiptPlaceholder', 'e.g. INV-2026-8821')}
                  value={expenseReceiptNumber}
                  onChange={(e) => setExpenseReceiptNumber(e.target.value)}
                  className="w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('expenses.modal.notesLabel', 'Notes / Memo (Optional)')}</label>
                <input
                  type="text"
                  placeholder={t('expenses.modal.notesPlaceholder', 'e.g. Purchased with tax invoice')}
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="btn-secondary"
                >
                  {t('action.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                >
                  {t('expenses.modal.submit', 'Record Expense')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </header>
  );
};

