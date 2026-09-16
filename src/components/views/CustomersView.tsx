import React, { useState, useMemo } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  Users, 
  Search, 
  Phone, 
  History, 
  GraduationCap, 
  ShieldAlert, 
  TrendingUp, 
  Calendar,
  X,
  ArrowRight,
  CalendarRange,
  RotateCcw
} from 'lucide-react';
import { Customer } from '../../types';

type DateFilterShortcut = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';
type CategoryFilter = 'all' | 'students' | 'allergies' | 'vip';

export const CustomersView: React.FC = () => {
  const { customers, t } = useCash();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [dateShortcut, setDateShortcut] = useState<DateFilterShortcut>('all');
  
  // Custom Date Range State (default to current anchor date: 2026-09-15)
  const [startDate, setStartDate] = useState<string>('2026-09-15');
  const [endDate, setEndDate] = useState<string>('2026-09-15');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [activeModalCustomer, setActiveModalCustomer] = useState<Customer | null>(null);

  // Reference anchor dates for filters
  const todayStr = '2026-09-15';
  const yesterdayStr = '2026-09-14';
  const weekStartStr = '2026-09-08'; // 7 days prior
  const monthStartStr = '2026-09-01'; // start of current month

  // Helper function to check if a visit date falls within the selected date criteria
  const isDateInFilter = (dateStr: string): boolean => {
    if (dateShortcut === 'all') return true;

    // Normalize date string (support 'Today', 'Yesterday', or 'YYYY-MM-DD')
    let normalized = dateStr;
    if (dateStr === 'Today' || dateStr.toLowerCase().includes('today')) {
      normalized = todayStr;
    } else if (dateStr === 'Yesterday' || dateStr.toLowerCase().includes('yesterday')) {
      normalized = yesterdayStr;
    }

    if (dateShortcut === 'today') {
      return normalized === todayStr;
    }

    if (dateShortcut === 'yesterday') {
      return normalized === yesterdayStr;
    }

    if (dateShortcut === 'week') {
      return normalized >= weekStartStr && normalized <= todayStr;
    }

    if (dateShortcut === 'month') {
      return normalized >= monthStartStr && normalized <= todayStr;
    }

    if (dateShortcut === 'custom') {
      if (!startDate && !endDate) return true;
      if (startDate && !endDate) return normalized >= startDate;
      if (!startDate && endDate) return normalized <= endDate;
      return normalized >= startDate && normalized <= endDate;
    }

    return true;
  };

  // Helper to handle date shortcut clicks
  const handleShortcutSelect = (shortcut: DateFilterShortcut) => {
    setDateShortcut(shortcut);
    if (shortcut === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
      setIsDatePickerOpen(false);
    } else if (shortcut === 'yesterday') {
      setStartDate(yesterdayStr);
      setEndDate(yesterdayStr);
      setIsDatePickerOpen(false);
    } else if (shortcut === 'week') {
      setStartDate(weekStartStr);
      setEndDate(todayStr);
      setIsDatePickerOpen(false);
    } else if (shortcut === 'month') {
      setStartDate(monthStartStr);
      setEndDate(todayStr);
      setIsDatePickerOpen(false);
    } else if (shortcut === 'custom') {
      setIsDatePickerOpen(true);
    } else if (shortcut === 'all') {
      setIsDatePickerOpen(false);
    }
  };

  // Filtered & Searched List
  const filteredCustomersData = useMemo(() => {
    return customers
      .map((c) => {
        // Calculate visits and spend matching the selected date filter
        const matchingVisits = c.history.filter((h) => isDateInFilter(h.date));
        const visitsInPeriod = matchingVisits.length;
        const spendInPeriod = matchingVisits.reduce((sum, h) => sum + h.amount, 0);
        const hasActivityInPeriod = dateShortcut === 'all' ? true : visitsInPeriod > 0 || isDateInFilter(c.lastVisit);

        return {
          customer: c,
          matchingVisits,
          visitsInPeriod: dateShortcut === 'all' ? c.totalVisits : visitsInPeriod,
          spendInPeriod: dateShortcut === 'all' ? c.totalSpent : spendInPeriod,
          hasActivityInPeriod,
        };
      })
      .filter(({ customer: c, hasActivityInPeriod, spendInPeriod }) => {
        // 1. Date Filter requirement
        if (!hasActivityInPeriod) return false;

        // 2. Search Query requirement
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          (c.studentIdProof && c.studentIdProof.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.allergies && c.allergies.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.preferredBarber && c.preferredBarber.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        // 3. Category Filter requirement
        if (activeCategory === 'students') return c.isStudent;
        if (activeCategory === 'allergies') return c.allergies && c.allergies !== 'None';
        if (activeCategory === 'vip') return spendInPeriod >= 90 || c.totalSpent >= 90;

        return true;
      });
  }, [customers, searchQuery, activeCategory, dateShortcut, startDate, endDate]);

  // Dynamic Top Stats based on current filtered subset
  const totalClientsInView = filteredCustomersData.length;
  const totalVisitsInView = useMemo(
    () => filteredCustomersData.reduce((sum, item) => sum + item.visitsInPeriod, 0),
    [filteredCustomersData]
  );
  const totalRevenueInView = useMemo(
    () => filteredCustomersData.reduce((sum, item) => sum + item.spendInPeriod, 0),
    [filteredCustomersData]
  );
  const studentCountInView = useMemo(
    () => filteredCustomersData.filter((item) => item.customer.isStudent).length,
    [filteredCustomersData]
  );

  // Active filter label summary
  const dateFilterLabel = useMemo(() => {
    switch (dateShortcut) {
      case 'today':
        return t('cust.today', '⚡ Today') + ' (Sep 15, 2026)';
      case 'yesterday':
        return t('cust.yesterday', '⏮️ Yesterday') + ' (Sep 14, 2026)';
      case 'week':
        return t('cust.thisWeek', '📆 This Week') + ' (Sep 08 – Sep 15, 2026)';
      case 'month':
        return t('cust.thisMonth', '🗓️ This Month') + ' (Sep 2026)';
      case 'custom':
        return `${t('cust.customRange', 'Custom Range')}: ${startDate} - ${endDate}`;
      case 'all':
      default:
        return t('cust.allTime', 'All Time');
    }
  }, [dateShortcut, startDate, endDate, t]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            {t('cust.title', 'Customer Directory & Profiles')}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {t('cust.subtitle', 'Client dossiers, visit histories by date point in time, student discounts, and allergy safety logs.')}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('cust.searchPlaceholder', 'Search name, phone, student ID, barber...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 text-xs py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[#D4AF37] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Benchmark Cards (Live reactive to Date & Category Filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Active Clients in Timeframe */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('cust.activeClients', 'Active Clients')}
            </span>
            <span className="badge-status badge-neutral text-[9px] sm:text-[10px] px-2 py-0.5 font-bold">
              {dateShortcut === 'all' ? t('cust.database', 'Database') : t('cust.inPeriod', 'In Period')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-mono block">
              {totalClientsInView}
            </span>
            <span className="text-[11px] text-[var(--text-dim)] block mt-0.5">
              {dateFilterLabel}
            </span>
          </div>
        </div>

        {/* Metric 2: Visits Completed in Timeframe */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('cust.visitsLogged', 'Visits Logged')}
            </span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-2 py-0.5 font-bold">
              {t('cust.services', 'Services')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-[#D4AF37] font-mono block">
              {totalVisitsInView} {totalVisitsInView === 1 ? t('cust.cut', 'Cut') : t('cust.cuts', 'Cuts')}
            </span>
            <span className="text-[11px] text-[var(--text-dim)] block mt-0.5">
              {t('cust.inSelectedRange', 'In selected date range')}
            </span>
          </div>
        </div>

        {/* Metric 3: Revenue Generated in Timeframe */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('cust.periodVolume', 'Period Volume')}
            </span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-emerald-500 font-mono block">
              ₾{totalRevenueInView.toFixed(2)} GEL
            </span>
            <span className="text-[11px] text-emerald-500/80 font-semibold block mt-0.5">
              {t('cust.grossSpend', 'Gross client spend')}
            </span>
          </div>
        </div>

        {/* Metric 4: Verified Students */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('cust.studentClients', 'Student Clients')}
            </span>
            <div className="p-1 rounded-md bg-amber-500/10 text-[#D4AF37]">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-mono block">
              {studentCountInView} {t('cust.studentClients', 'Students')}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
              {t('cust.discountEligible', '20% discount eligible')}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Comprehensive Date Filter & Shortcut Toolbar */}
      <div className="card-executive p-3 sm:p-4 space-y-3 bg-[var(--bg-card)] border-[var(--border-subtle)]">
        
        {/* Date Shortcuts Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Shortcuts Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mr-1 shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> {t('cust.date', 'Date:')}
            </span>

            {/* 1. All Time */}
            <button
              onClick={() => handleShortcutSelect('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                dateShortcut === 'all'
                  ? 'bg-[#18181B] dark:bg-[#27272A] text-white border border-[#3F3F46] shadow-xs'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              {t('cust.allTime', 'All Time')}
            </button>

            {/* 2. Today */}
            <button
              onClick={() => handleShortcutSelect('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 flex items-center gap-1 ${
                dateShortcut === 'today'
                  ? 'bg-[#D4AF37] text-black shadow-xs font-extrabold'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>{t('cust.today', '⚡ Today')}</span>
              <span className="text-[10px] opacity-75">(Sep 15)</span>
            </button>

            {/* 3. Yesterday */}
            <button
              onClick={() => handleShortcutSelect('yesterday')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 flex items-center gap-1 ${
                dateShortcut === 'yesterday'
                  ? 'bg-[#D4AF37] text-black shadow-xs font-extrabold'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>{t('cust.yesterday', '⏮️ Yesterday')}</span>
              <span className="text-[10px] opacity-75">(Sep 14)</span>
            </button>

            {/* 4. This Week */}
            <button
              onClick={() => handleShortcutSelect('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 flex items-center gap-1 ${
                dateShortcut === 'week'
                  ? 'bg-[#D4AF37] text-black shadow-xs font-extrabold'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>{t('cust.thisWeek', '📆 This Week')}</span>
            </button>

            {/* 5. This Month */}
            <button
              onClick={() => handleShortcutSelect('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 flex items-center gap-1 ${
                dateShortcut === 'month'
                  ? 'bg-[#D4AF37] text-black shadow-xs font-extrabold'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>{t('cust.thisMonth', '🗓️ This Month')}</span>
            </button>

            {/* 6. Custom Range Toggle */}
            <button
              onClick={() => {
                setDateShortcut('custom');
                setIsDatePickerOpen(!isDatePickerOpen);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
                dateShortcut === 'custom'
                  ? 'bg-[#D4AF37] text-black shadow-xs font-extrabold'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>{t('cust.customRange', 'Custom Date Range')}</span>
            </button>
          </div>

          {/* Reset Filter Action */}
          {dateShortcut !== 'all' && (
            <button
              onClick={() => handleShortcutSelect('all')}
              className="px-2.5 py-1 text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1 self-end md:self-auto shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('cust.resetDateFilter', 'Reset Date Filter')}</span>
            </button>
          )}

        </div>

        {/* Custom Date Range Picker Container */}
        {(dateShortcut === 'custom' || isDatePickerOpen) && (
          <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] flex flex-wrap items-center gap-3 text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-muted)]">{t('cust.fromDate', 'From Date:')}</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateShortcut('custom');
                }}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] font-mono text-xs focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-muted)]">{t('cust.toDate', 'To Date:')}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateShortcut('custom');
                }}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] font-mono text-xs focus:border-[#D4AF37]"
              />
            </div>

            {/* Quick Single Date Day Jumps */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">{t('cust.jumpTo', 'Jump To:')}</span>
              <button
                onClick={() => {
                  setStartDate('2026-09-15');
                  setEndDate('2026-09-15');
                  setDateShortcut('custom');
                }}
                className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#D4AF37] text-[11px] font-mono text-[var(--text-main)]"
              >
                Today (15th)
              </button>
              <button
                onClick={() => {
                  setStartDate('2026-09-14');
                  setEndDate('2026-09-14');
                  setDateShortcut('custom');
                }}
                className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#D4AF37] text-[11px] font-mono text-[var(--text-main)]"
              >
                Yesterday (14th)
              </button>
              <button
                onClick={() => {
                  setStartDate('2026-09-12');
                  setEndDate('2026-09-12');
                  setDateShortcut('custom');
                }}
                className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#D4AF37] text-[11px] font-mono text-[var(--text-main)]"
              >
                Sep 12
              </button>
            </div>
          </div>
        )}

        {/* Active Filter Indicator Banner */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between text-xs text-[var(--text-dim)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {t('cust.showing', 'Showing')} <strong className="text-[var(--text-main)] font-bold">{totalClientsInView}</strong> {t('cust.clientsActiveDuring', 'clients active during')} <strong className="text-[#D4AF37] font-semibold">{dateFilterLabel}</strong>
            </span>
          </div>
        </div>

      </div>

      {/* 4. Category Filter Chips (Students, Allergies, VIP, All) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-[#18181B] dark:bg-[#27272A] text-white border border-[var(--border-card)] shadow-xs'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
          }`}
        >
          {t('cust.allCategories', 'All Categories')} ({totalClientsInView})
        </button>

        <button
          onClick={() => setActiveCategory('students')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeCategory === 'students'
              ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t('cust.studentDiscountChip', 'Student Discount (20% Off)')}</span>
        </button>

        <button
          onClick={() => setActiveCategory('vip')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeCategory === 'vip'
              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 shadow-xs'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t('cust.topSpendersChip', 'Top Spenders (90+ GEL)')}</span>
        </button>

        <button
          onClick={() => setActiveCategory('allergies')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeCategory === 'allergies'
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-xs'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>{t('cust.allergyFlagChip', 'Has Allergy Flag')}</span>
        </button>
      </div>

      {/* 5. Customer Directory Table */}
      <div className="card-executive overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider bg-[var(--bg-subtle)]/50">
                <th className="py-3.5 px-4 font-bold">{t('cust.th.clientName', 'Client Name')}</th>
                <th className="py-3.5 px-3 font-bold">{t('cust.th.phone', 'Phone Number')}</th>
                <th className="py-3.5 px-3 font-bold">{t('cust.th.studentStatus', 'Student Status')}</th>
                <th className="py-3.5 px-3 font-bold">{t('cust.th.preferredBarber', 'Preferred Barber')}</th>
                <th className="py-3.5 px-3 font-bold text-center">
                  {dateShortcut === 'all' ? t('cust.th.lifetimeVisits', 'Lifetime Visits') : t('cust.th.periodVisits', 'Period Visits')}
                </th>
                <th className="py-3.5 px-3 font-bold">
                  {dateShortcut === 'all' ? t('cust.th.lifetimeSpend', 'Lifetime Spend') : t('cust.th.periodSpend', 'Period Spend')}
                </th>
                <th className="py-3.5 px-3 font-bold">{t('cust.th.lastVisitDate', 'Last Visit Date')}</th>
                <th className="py-3.5 px-3 font-bold">{t('cust.th.allergies', 'Allergies')}</th>
                <th className="py-3.5 px-4 font-bold text-right">{t('cust.th.dossier', 'Dossier')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredCustomersData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[var(--text-dim)] space-y-2">
                    <p className="font-semibold text-sm text-[var(--text-muted)]">{t('cust.noCustomersFound', 'No customers found for this time period / filter.')}</p>
                    <p className="text-xs text-[var(--text-dim)]">{t('cust.tryAdjusting', 'Try selecting "All Time" or adjusting your search criteria.')}</p>
                    <button
                      onClick={() => {
                        handleShortcutSelect('all');
                        setActiveCategory('all');
                        setSearchQuery('');
                      }}
                      className="btn-secondary text-xs py-1.5 px-3 font-bold mt-2 inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('cust.resetAllFilters', 'Reset All Filters')}</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCustomersData.map(({ customer: c, visitsInPeriod, spendInPeriod }) => (
                  <tr
                    key={c.id}
                    onClick={() => setActiveModalCustomer(c)}
                    className="hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group"
                  >
                    {/* Name + Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-xs text-[var(--text-main)] shrink-0 group-hover:border-[#D4AF37] transition-colors">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[var(--text-main)] group-hover:text-[#D4AF37] transition-colors block">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-dim)] block sm:hidden font-mono">
                            {c.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-3 font-mono text-[var(--text-muted)]">
                      {c.phone}
                    </td>

                    {/* Student Status */}
                    <td className="py-3.5 px-3">
                      {c.isStudent ? (
                        <span className="badge-status badge-gold flex items-center gap-1 text-[10px] w-fit">
                          <GraduationCap className="w-3 h-3" /> 20% Off
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-dim)]">{t('cust.regular', 'Regular')}</span>
                      )}
                    </td>

                    {/* Preferred Barber */}
                    <td className="py-3.5 px-3 text-[var(--text-main)] font-medium">
                      {c.preferredBarber || t('cust.anyBarber', 'Any Barber')}
                    </td>

                    {/* Visits */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-[var(--text-main)]">
                      <span className="text-sm">{visitsInPeriod}</span>
                      {dateShortcut !== 'all' && (
                        <span className="text-[10px] text-[var(--text-dim)] block font-normal">
                          {t('cust.ofTotal', 'of')} {c.totalVisits}
                        </span>
                      )}
                    </td>

                    {/* Spend */}
                    <td className="py-3.5 px-3 font-mono font-bold text-[#D4AF37]">
                      <span className="text-sm">₾{spendInPeriod.toFixed(2)}</span>
                      {dateShortcut !== 'all' && (
                        <span className="text-[10px] text-[var(--text-dim)] block font-normal">
                          (₾{c.totalSpent.toFixed(0)} {t('cust.ltv', 'LTV')})
                        </span>
                      )}
                    </td>

                    {/* Last Visit Date */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-xs text-[var(--text-main)] font-semibold block">
                        {c.lastVisit === '2026-09-15' || c.lastVisit === 'Today' ? (
                          <span className="text-emerald-500 font-bold">{t('cust.today', 'Today')} (15th)</span>
                        ) : c.lastVisit === '2026-09-14' || c.lastVisit === 'Yesterday' ? (
                          <span className="text-amber-500 font-bold">{t('cust.yesterday', 'Yesterday')} (14th)</span>
                        ) : (
                          c.lastVisit
                        )}
                      </span>
                    </td>

                    {/* Allergies */}
                    <td className="py-3.5 px-3">
                      {c.allergies && c.allergies !== 'None' ? (
                        <span className="badge-status badge-red text-[10px] flex items-center gap-1 w-fit">
                          <ShieldAlert className="w-3 h-3" /> {c.allergies}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-dim)]">{t('cust.none', 'None')}</span>
                      )}
                    </td>

                    {/* Dossier Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalCustomer(c);
                        }}
                        className="btn-secondary text-[11px] py-1.5 px-3 font-bold group-hover:border-[#D4AF37] group-hover:text-[#D4AF37] transition-all"
                      >
                        <span>{t('cust.th.dossier', 'Dossier')}</span>
                        <ArrowRight className="w-3 h-3 inline ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Customer Profile Dossier Modal */}
      {activeModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] border-2 border-[#D4AF37] flex items-center justify-center font-black text-base text-[#D4AF37] shadow-sm">
                  {activeModalCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-[var(--text-main)]">
                      {activeModalCustomer.name}
                    </h3>
                    {activeModalCustomer.isStudent && (
                      <span className="badge-status badge-gold text-[10px] flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> {t('student.discount', 'Student 20% Discount')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-[var(--text-dim)]" />
                    <span>{activeModalCustomer.phone}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModalCustomer(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Allergy Dossier Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Student Proof */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[var(--text-dim)] flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {t('cust.studentVerification', 'Student Verification')}
                </div>
                <div className="font-extrabold text-[var(--text-main)] text-sm">
                  {activeModalCustomer.isStudent ? t('cust.activeDiscount', 'Active (20% Discount)') : t('cust.regularClient', 'Regular Client')}
                </div>
                {activeModalCustomer.studentIdProof && (
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {t('cust.proofId', 'Proof ID:')} <span className="font-mono font-semibold text-[var(--text-main)]">{activeModalCustomer.studentIdProof}</span>
                  </div>
                )}
              </div>

              {/* Allergies Box */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[var(--text-dim)] flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  {t('cust.allergiesSensitivities', 'Allergies & Sensitivities')}
                </div>
                <div className={`font-bold text-sm ${activeModalCustomer.allergies !== 'None' ? 'text-rose-500 dark:text-rose-400' : 'text-[var(--text-main)]'}`}>
                  {activeModalCustomer.allergies || t('cust.none', 'None')}
                </div>
                <div className="text-[10px] text-[var(--text-dim)]">
                  {t('cust.checkSensitivity', 'Check skin sensitivity before alcohol aftershave')}
                </div>
              </div>

            </div>

            {/* Lifetime Performance Numbers */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">{t('cust.totalSpent', 'Total Spent')}</span>
                <span className="text-base font-black text-[#D4AF37] font-mono">₾{activeModalCustomer.totalSpent.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">{t('cust.totalVisits', 'Total Visits')}</span>
                <span className="text-base font-black text-[var(--text-main)] font-mono">{activeModalCustomer.totalVisits}</span>
              </div>
              <div className="p-2.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">{t('cust.preferredBarber', 'Preferred Barber')}</span>
                <span className="text-xs font-bold text-[var(--text-main)] truncate block">{activeModalCustomer.preferredBarber || 'N/A'}</span>
              </div>
            </div>

            {/* Visit History Log with Active Period Indicators */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {t('cust.completedLedger', 'Completed Service Ledger')} ({activeModalCustomer.history.length})
                </h4>
                {dateShortcut !== 'all' && (
                  <span className="text-[10px] text-[#D4AF37] font-semibold">
                    {t('cust.filter', 'Filter:')} {dateFilterLabel}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {activeModalCustomer.history.length === 0 ? (
                  <div className="text-xs text-[var(--text-dim)] py-3 text-center">{t('cust.noVisitsLogged', 'No visits logged yet.')}</div>
                ) : (
                  activeModalCustomer.history.map((h, i) => {
                    const isMatchedInFilter = isDateInFilter(h.date);
                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          isMatchedInFilter && dateShortcut !== 'all'
                            ? 'bg-amber-500/10 border-[#D4AF37]/50'
                            : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[var(--text-main)]">{h.serviceName}</span>
                            {isMatchedInFilter && dateShortcut !== 'all' && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#D4AF37] text-black">
                                {t('cust.inFilter', 'In Filter')}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                            <span className="font-mono font-semibold">{h.date}</span> • {h.barberName} ({h.type})
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-[var(--text-main)] block">
                            ₾{h.amount.toFixed(2)} GEL
                          </span>
                          {h.paymentMethod && (
                            <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono">
                              {h.paymentMethod}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Close Action */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalCustomer(null)}
                className="btn-secondary text-xs py-2 px-5 font-bold"
              >
                {t('cust.closeDossier', 'Close Dossier')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
