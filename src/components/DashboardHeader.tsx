import React, { useState, useEffect } from 'react';
import { useCash } from '../context/CashContext';
import { BranchId } from '../types';
import { DemoTab } from './Sidebar';
import { 
  Building2, 
  Wallet, 
  Clock, 
  Footprints,
  CalendarCheck,
  Sun,
  Moon
} from 'lucide-react';

interface DashboardHeaderProps {
  onNavigateTab: (tab: DemoTab) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onNavigateTab }) => {
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
      setLocalTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 transition-colors">
      
      {/* Left: Branch Switcher & Clock */}
      <div className="flex items-center gap-3">
        
        {/* Branch Selector Tabs (Monochrome / Gold, Zero Blue) */}
        <div className="flex items-center bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)]">
          {branches.map((b) => {
            const isActive = currentBranch === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setCurrentBranch(b.id as BranchId)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
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

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="font-mono text-[var(--text-main)] font-semibold">{localTime}</span>
          <span className="text-[10px] text-[var(--text-dim)]">Tbilisi</span>
        </div>

      </div>

      {/* Right: Cash Balances, Theme Toggle & Navigation Shortcuts */}
      <div className="flex items-center gap-2.5 sm:gap-3 justify-between md:justify-end">
        
        {/* Cash Drawer Balance */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] flex items-center gap-1">
              <Wallet className="w-3 h-3 text-[#D4AF37]" />
              Drawer Cash
            </span>
            <span className="font-extrabold font-mono text-sm text-[#D4AF37]">
              ₾{cashInDrawer.toFixed(2)}
            </span>
          </div>
          <div className="h-6 w-px bg-[var(--border-subtle)]"></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Net Profit</span>
            <span className="font-extrabold font-mono text-sm text-emerald-500 dark:text-emerald-400">
              ₾{netProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all flex items-center gap-1.5 text-xs font-semibold"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline text-xs">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#71717A]" />
              <span className="hidden sm:inline text-xs">Dark</span>
            </>
          )}
        </button>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('booking')}
            className="btn-primary-gold text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Book Client</span>
          </button>

          <button
            onClick={() => onNavigateTab('walkin')}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-500 dark:text-amber-400"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Walk-In</span>
          </button>
        </div>

      </div>

    </header>
  );
};
