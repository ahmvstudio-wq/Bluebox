import React, { useState, useRef, useEffect } from 'react';
import { useCash } from '../context/CashContext';
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
  ChevronDown
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
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    currentBranch, 
    branches,
    barbers,
    branchBarbers, 
    customers, 
    todayBookingsCount, 
    todayWalkInsCount,
    currentUser,
    loginAsBarber,
    logout,
    resetToDefaultData
  } = useCash();

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

  const activeBranchData = branches.find((b) => b.id === currentBranch) || branches[0];

  const navItems = [
    { 
      id: 'dashboard' as DemoTab, 
      label: '1. Dashboard', 
      icon: LayoutDashboard, 
      badge: 'Live' 
    },
    { 
      id: 'barbers' as DemoTab, 
      label: '2. Barber Performance', 
      icon: Scissors, 
      badge: `${branchBarbers.length}` 
    },
    { 
      id: 'customers' as DemoTab, 
      label: '3. Customers', 
      icon: Users, 
      badge: `${customers.length}` 
    },
    { 
      id: 'booking' as DemoTab, 
      label: '4. Booking', 
      icon: CalendarCheck2, 
      badge: `${todayBookingsCount}` 
    },
    { 
      id: 'walkin' as DemoTab, 
      label: '5. Walk-in', 
      icon: Footprints, 
      badge: `${todayWalkInsCount}` 
    },
    { 
      id: 'finance' as DemoTab, 
      label: '6. Financial Overview', 
      icon: Wallet, 
      badge: '₾' 
    },
    { 
      id: 'branches' as DemoTab, 
      label: '7. Branches', 
      icon: Building2, 
      badge: '3 Shops' 
    },
  ];

  return (
    <aside className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col shrink-0 min-h-screen transition-colors">
      
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
  );
};
