import React from 'react';
import { useCash } from '../context/CashContext';
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  CalendarCheck2, 
  Footprints, 
  Wallet, 
  Building2,
  Sparkles,
  ShieldCheck,
  LogOut,
  RotateCcw,
  UserCheck
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
    loginAsBarber,
    logout,
    resetToDefaultData
  } = useCash();

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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#18181B] text-white dark:bg-[#27272A] dark:text-white font-bold border border-[#3F3F46] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-[var(--text-dim)]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                    isActive
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Demo Fast Switch to Barber View */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] px-2 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-[#D4AF37]" />
            Test Barber Login:
          </div>
          <select
            onChange={(e) => {
              if (e.target.value) loginAsBarber(e.target.value);
            }}
            defaultValue=""
            className="w-full text-[11px] font-medium py-1.5 px-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] focus:outline-none"
          >
            <option value="" disabled>Switch to Barber Persona...</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.branchId})
              </option>
            ))}
          </select>
        </div>

        {/* Reset Mock Data Button */}
        <div className="px-2 pt-1">
          <button
            onClick={() => {
              if (window.confirm('Reset all bookings and balances back to default demo data?')) {
                resetToDefaultData();
              }
            }}
            className="w-full py-1.5 px-2.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center gap-1.5 transition-all"
            title="Reset localStorage data to clean default"
          >
            <RotateCcw className="w-3 h-3 text-[#D4AF37]" />
            <span>Reset Demo Data</span>
          </button>
        </div>

      </nav>

      {/* Admin User Profile & Sign Out at Bottom */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#18181B] dark:bg-[#27272A] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-xs shrink-0">
              IO
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[var(--text-main)] truncate block">Irakli (Owner)</span>
              <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold block">Super Admin</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-subtle)] rounded-lg transition-all"
            title="Sign Out to Login Screen"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
};
