import React, { useState, useRef, useEffect } from 'react';
import { useCash } from '../context/CashContext';
import { BranchId } from '../types';
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  CalendarCheck2, 
  Footprints, 
  Wallet, 
  Building2,
  LogOut, 
  RotateCcw, 
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export type DemoTab = 
  | 'dashboard' 
  | 'barbers' 
  | 'customers' 
  | 'booking' 
  | 'walkin' 
  | 'finance' 
  | 'branches';

interface SidebarProps {
  activeTab: DemoTab;
  setActiveTab: (tab: DemoTab) => void;
  isMobileDrawerOpen?: boolean;
  setIsMobileDrawerOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isMobileDrawerOpen: controlledDrawerOpen,
  setIsMobileDrawerOpen: setControlledDrawerOpen
}) => {
  const { 
    currentBranch, 
    setCurrentBranch,
    branches, 
    barbers, 
    branchBarbers, 
    customers, 
    todayBookingsCount, 
    todayWalkInsCount, 
    currentUser, 
    loginAsBarber, 
    logout, 
    resetToDefaultData,
    theme,
    toggleTheme
  } = useCash();

  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const isDrawerOpen = controlledDrawerOpen !== undefined ? controlledDrawerOpen : internalDrawerOpen;
  const setDrawerOpen = setControlledDrawerOpen || setInternalDrawerOpen;

  const [isBarberMenuOpen, setIsBarberMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBarberMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { 
      id: 'dashboard' as DemoTab, 
      label: '1. Dashboard', 
      shortLabel: 'Overview',
      icon: LayoutDashboard, 
      badge: 'Live' 
    },
    { 
      id: 'barbers' as DemoTab, 
      label: '2. Barber Performance', 
      shortLabel: 'Barbers',
      icon: Scissors, 
      badge: `${branchBarbers.length}` 
    },
    { 
      id: 'customers' as DemoTab, 
      label: '3. Customers', 
      shortLabel: 'Clients',
      icon: Users, 
      badge: `${customers.length}` 
    },
    { 
      id: 'booking' as DemoTab, 
      label: '4. Booking Pipeline', 
      shortLabel: 'Pipeline',
      icon: CalendarCheck2, 
      badge: `${todayBookingsCount}` 
    },
    { 
      id: 'walkin' as DemoTab, 
      label: '5. Walk-In POS', 
      shortLabel: 'Walk-In',
      icon: Footprints, 
      badge: `${todayWalkInsCount}` 
    },
    { 
      id: 'finance' as DemoTab, 
      label: '6. Financial Overview', 
      shortLabel: 'Finance',
      icon: Wallet, 
      badge: '₾' 
    },
    { 
      id: 'branches' as DemoTab, 
      label: '7. Branches', 
      shortLabel: 'Branches',
      icon: Building2, 
      badge: '3 Shops' 
    },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP ENTERPRISE SIDEBAR (Visible on >= lg screens only) */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex-col shrink-0 min-h-screen transition-colors z-20">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Bluebox Barber"
              className="w-10 h-10 rounded-full border border-[#D4AF37] object-cover shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-base tracking-wide text-[var(--text-main)] font-['Inter',sans-serif]">
                  Bluebox
                </h1>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border border-[#D4AF37]/40 tracking-wider">
                  BARBER
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Operations System
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation (7 Essential Features) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
            Operations
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] relative overflow-hidden group ${
                  isActive
                    ? 'bg-[#18181B] text-white dark:bg-[#27272A] dark:text-white font-bold border border-[#3F3F46] shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#D4AF37] before:rounded-r'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isActive ? 'text-[#D4AF37]' : 'text-[var(--text-dim)] group-hover:text-[var(--text-main)]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 transition-all duration-200 ${
                      isActive
                        ? 'bg-[#D4AF37] text-black shadow-xs'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] group-hover:border-[var(--border-card)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Custom Luxury Barber Switcher Dropdown */}
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] px-2 space-y-1.5" ref={dropdownRef}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
              Switch Staff View
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBarberMenuOpen(!isBarberMenuOpen)}
                className="w-full flex items-center justify-between py-2 px-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#D4AF37] rounded-xl text-xs text-[var(--text-main)] font-medium transition-all shadow-xs active:scale-[0.98]"
              >
                <span className="text-[var(--text-muted)] truncate">Switch to Barber Persona...</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-dim)] transition-transform duration-200 shrink-0 ${isBarberMenuOpen ? 'rotate-180 text-[#D4AF37]' : ''}`} />
              </button>

              {isBarberMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl shadow-2xl py-1.5 z-50 max-h-64 overflow-y-auto animate-scale-in">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[var(--text-dim)] border-b border-[var(--border-subtle)]">
                    Select Barber Persona
                  </div>
                  {barbers.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setIsBarberMenuOpen(false);
                        loginAsBarber(b.id);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--bg-subtle)] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={b.avatar}
                          alt={b.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-[var(--border-subtle)]"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[#D4AF37] truncate block">
                            {b.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-dim)] truncate block">
                            {b.specialty}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-dim)] border border-[var(--border-subtle)] shrink-0 ml-1">
                        {b.branchId}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reset Mock Data Button */}
          <div className="px-2 pt-1">
            <button
              onClick={() => {
                if (window.confirm('Reset all bookings, balances, and records back to default state?')) {
                  resetToDefaultData();
                }
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-dim)] hover:text-[var(--text-main)] flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="Reset storage to default state"
            >
              <RotateCcw className="w-3 h-3 text-[#D4AF37]" />
              <span>Restore Default Records</span>
            </button>
          </div>

        </nav>

        {/* Admin User Profile & Sign Out at Bottom */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-[var(--border-subtle)] object-cover shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-main)] font-bold text-xs shrink-0">
                  {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-bold text-[var(--text-main)] truncate block">
                  {currentUser?.name || 'Irakli (Owner)'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium block">
                  Store Owner
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-subtle)] rounded-lg transition-all text-xs font-medium flex items-center gap-1 shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION BAR (Visible on < lg screens only) */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Mobile Navigation" 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-sidebar)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-colors"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
          
          {/* Tab 1: Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center h-full gap-1 transition-all active:scale-90 ${
              activeTab === 'dashboard'
                ? 'text-[#D4AF37] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-[#D4AF37]' : 'text-[var(--text-dim)]'}`} />
            <span className="text-[10px] tracking-tight">Overview</span>
          </button>

          {/* Tab 2: Booking Pipeline */}
          <button
            type="button"
            onClick={() => setActiveTab('booking')}
            className={`flex flex-col items-center justify-center h-full gap-1 transition-all relative active:scale-90 ${
              activeTab === 'booking'
                ? 'text-[#D4AF37] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <div className="relative">
              <CalendarCheck2 className={`w-5 h-5 ${activeTab === 'booking' ? 'text-[#D4AF37]' : 'text-[var(--text-dim)]'}`} />
              {todayBookingsCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#D4AF37] text-black font-mono font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {todayBookingsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Pipeline</span>
          </button>

          {/* Tab 3: Walk-In POS (Prominent Hero Action Pill) */}
          <button
            type="button"
            onClick={() => setActiveTab('walkin')}
            className="flex flex-col items-center justify-center -mt-3 group transition-transform active:scale-90"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border transition-all ${
              activeTab === 'walkin'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[#D4AF37]/30 scale-105'
                : 'bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border-[#D4AF37]/50 group-hover:border-[#D4AF37]'
            }`}>
              <Footprints className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold mt-1 ${activeTab === 'walkin' ? 'text-[#D4AF37]' : 'text-[var(--text-muted)]'}`}>
              Walk-in
            </span>
          </button>

          {/* Tab 4: Finance */}
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`flex flex-col items-center justify-center h-full gap-1 transition-all active:scale-90 ${
              activeTab === 'finance'
                ? 'text-[#D4AF37] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Wallet className={`w-5 h-5 ${activeTab === 'finance' ? 'text-[#D4AF37]' : 'text-[var(--text-dim)]'}`} />
            <span className="text-[10px] tracking-tight">Finance</span>
          </button>

          {/* Tab 5: More / Menu (Opens Mobile Drawer) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center h-full gap-1 transition-all active:scale-90 ${
              isDrawerOpen || ['barbers', 'customers', 'branches'].includes(activeTab)
                ? 'text-[#D4AF37] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <div className="relative">
              <Menu className={`w-5 h-5 ${['barbers', 'customers', 'branches'].includes(activeTab) ? 'text-[#D4AF37]' : 'text-[var(--text-dim)]'}`} />
              {['barbers', 'customers', 'branches'].includes(activeTab) && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#D4AF37]"></span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Menu</span>
          </button>

        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. MOBILE SLIDE-OVER SHEET / DRAWER (Triggered by More tab or Hamburger) */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Slide-in Menu Panel */}
          <div className="relative w-80 max-w-[85vw] bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col h-full z-10 shadow-2xl animate-slide-in overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="Bluebox Barber"
                  className="w-9 h-9 rounded-full border border-[#D4AF37] object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm tracking-wide text-[var(--text-main)]">Bluebox</span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border border-[#D4AF37]/40">
                      BARBER
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">Operations Menu</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Branch Selector Inside Drawer */}
            <div className="p-3 bg-[var(--bg-subtle)]/50 border-b border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] block mb-1.5">
                Active Branch
              </span>
              <div className="grid grid-cols-3 gap-1">
                {branches.map((b) => {
                  const isActive = currentBranch === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setCurrentBranch(b.id as BranchId)}
                      className={`py-1.5 px-1 text-center text-xs font-bold rounded-lg transition-all ${
                        isActive
                          ? 'bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      <span className="block truncate">{b.shortName}</span>
                      <span className="text-[9px] font-normal text-[var(--text-dim)]">{b.barberCount} staff</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation List */}
            <div className="flex-1 p-3 space-y-1 overflow-y-auto">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                All Operations
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-98 ${
                      isActive
                        ? 'bg-[#18181B] text-white dark:bg-[#27272A] dark:text-white font-bold border border-[#3F3F46]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[var(--text-dim)]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isActive ? 'bg-[#D4AF37] text-black' : 'bg-[var(--bg-subtle)] text-[var(--text-dim)]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Staff Switcher Section */}
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] block">
                  Switch to Barber Persona
                </span>
                <div className="space-y-1 mt-1 max-h-40 overflow-y-auto">
                  {barbers.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setDrawerOpen(false);
                        loginAsBarber(b.id);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-left group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={b.avatar} alt={b.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                        <span className="text-xs text-[var(--text-main)] group-hover:text-[#D4AF37] truncate">{b.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">{b.branchId}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle & Reset Data */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)]"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-zinc-500" />}
                    <span>Appearance</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-dim)] capitalize">{theme} Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all bookings, balances, and records back to default state?')) {
                      resetToDefaultData();
                      setDrawerOpen(false);
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-dim)] hover:text-[var(--text-main)] flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Restore Default Records</span>
                </button>
              </div>

            </div>

            {/* Drawer User Card Footer */}
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#18181B] dark:bg-[#27272A] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-xs shrink-0">
                  {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[var(--text-main)] truncate block">{currentUser?.name || 'Irakli'}</span>
                  <span className="text-[10px] text-[var(--text-muted)] block">Store Owner</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
