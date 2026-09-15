import React, { useState, useEffect } from 'react';
import { useCash } from '../context/CashContext';
import { BranchId } from '../types';
import { DemoTab } from './Sidebar';
import { 
  Clock, 
  Sun, 
  Moon,
  Menu,
  ChevronDown
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
    cashInDrawer,
    netProfit,
    theme,
    toggleTheme
  } = useCash();

  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString('en-US', {
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
  }, []);

  const activeBranchData = branches.find((b) => b.id === currentBranch) || branches[0];

  return (
    <header className="bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] px-3 sm:px-6 py-2 sm:py-3 shrink-0 transition-colors z-30">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE HEADER LAYOUT (Visible on < lg screens) */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col gap-2">
        
        {/* Mobile Row 1: Menu + Brand Logo/Name + Branch Selector Pill + Theme Toggle */}
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
                BLACKBOX
              </span>
            </div>
          </div>

          {/* Right: Compact Branch Pill Dropdown + Theme Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Native Luxury Branch Dropdown Pill */}
            <div className="relative flex items-center">
              <select
                value={currentBranch}
                onChange={(e) => setCurrentBranch(e.target.value as BranchId)}
                className="appearance-none bg-[var(--bg-subtle)] text-[var(--text-main)] font-bold text-[11px] py-1 pl-2.5 pr-6 rounded-lg border border-[var(--border-subtle)] focus:border-[#D4AF37] shadow-xs cursor-pointer"
                style={{ backgroundImage: 'none' }}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.shortName} ({b.barberCount})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#D4AF37] absolute right-1.5 pointer-events-none" />
            </div>

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

        {/* Mobile Row 2: Compact Financial Pill + Clean Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Financial Status Pill */}
          <div className="flex-1 flex items-center justify-around py-1 px-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs">
            <div className="flex items-baseline gap-1">
              <span className="text-[9px] uppercase font-bold text-[var(--text-dim)]">Drawer:</span>
              <span className="font-extrabold font-mono text-xs text-[#D4AF37]">
                ₾{cashInDrawer.toFixed(0)}
              </span>
            </div>

            <div className="h-4 w-px bg-[var(--border-subtle)]"></div>

            <div className="flex items-baseline gap-1">
              <span className="text-[9px] uppercase font-bold text-[var(--text-dim)]">Profit:</span>
              <span className={`font-extrabold font-mono text-xs ${
                netProfit >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'
              }`}>
                {netProfit >= 0 ? '+' : ''}₾{netProfit.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons (Fit cleanly on 375px+ screens) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onNavigateTab('booking')}
              className="btn-primary-gold text-[11px] py-1.5 px-3 font-bold transition-all active:scale-95 whitespace-nowrap"
            >
              + Book
            </button>

            <button
              onClick={() => onNavigateTab('walkin')}
              className="btn-secondary text-[11px] py-1.5 px-2.5 font-bold transition-all active:scale-95 text-[var(--text-main)] hover:border-[#D4AF37] whitespace-nowrap"
            >
              + Walk-In
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

        {/* Right: Cash Balances, Theme Toggle & Navigation Shortcuts */}
        <div className="flex items-center gap-3">
          
          {/* Drawer Cash & Net Profit */}
          <div className="flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] tracking-wider">
                Drawer Cash
              </span>
              <span className="font-extrabold font-mono text-sm text-[#D4AF37] leading-tight">
                ₾{cashInDrawer.toFixed(2)}
              </span>
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]"></div>

            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] tracking-wider">
                Net Profit
              </span>
              <span className={`font-extrabold font-mono text-sm leading-tight ${
                netProfit >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'
              }`}>
                {netProfit >= 0 ? '+' : ''}₾{netProfit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all flex items-center gap-1.5 text-xs font-semibold active:scale-95"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#71717A]" />
                <span className="text-xs font-medium">Dark</span>
              </>
            )}
          </button>

          {/* Quick Shortcut Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('booking')}
              className="btn-primary-gold text-xs py-1.5 px-3 font-bold transition-all active:scale-95"
            >
              + Book Client
            </button>

            <button
              onClick={() => onNavigateTab('walkin')}
              className="btn-secondary text-xs py-1.5 px-3 font-bold transition-all active:scale-95 text-[var(--text-main)] hover:border-[#D4AF37]"
            >
              + Walk-In
            </button>
          </div>

        </div>

      </div>

    </header>
  );
};
