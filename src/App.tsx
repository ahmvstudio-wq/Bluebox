import React, { useState } from 'react';
import { useCash } from './context/CashContext';
import { Sidebar, DemoTab } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { LoginView } from './components/views/LoginView';
import { BarberDashboardView } from './components/views/BarberDashboardView';
import { DashboardView } from './components/views/DashboardView';
import { BarbersView } from './components/views/BarbersView';
import { CustomersView } from './components/views/CustomersView';
import { BookingView } from './components/views/BookingView';
import { WalkInView } from './components/views/WalkInView';
import { FinanceView } from './components/views/FinanceView';
import { BranchesView } from './components/views/BranchesView';
import { Sun, Moon } from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, theme, toggleTheme } = useCash();
  const [adminTab, setAdminTab] = useState<DemoTab>('dashboard');

  // 1. Unauthenticated -> Show Login Screen
  if (!currentUser) {
    return <LoginView />;
  }

  // 2. Barber Role -> Show Strictly Restricted Personal Chair View
  if (currentUser.role === 'barber') {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col font-sans antialiased transition-colors">
        {/* Barber Top Bar */}
        <header className="bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Bluebox Barber"
              className="w-8 h-8 rounded-full border border-[#D4AF37] object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide text-[var(--text-main)]">Bluebox</span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border border-[#D4AF37]/40">BARBER</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">Staff Portal • Personal Chair</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all flex items-center gap-1.5 text-xs font-semibold"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#71717A]" />
                  <span className="text-xs">Dark</span>
                </>
              )}
            </button>

            <div className="text-xs text-[var(--text-muted)] hidden sm:block">
              Signed in as <span className="font-bold text-[var(--text-main)]">{currentUser.name}</span>
            </div>
          </div>
        </header>

        {/* Barber Main Dashboard */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <BarberDashboardView />
        </main>

        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] py-3 px-6 text-center text-xs text-[var(--text-dim)] shrink-0">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="text-[11px]">Bluebox Barber • Personal Chair Management</span>
            <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold">Strict Data Isolation Active</span>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Admin / Owner Role -> Full 7-Feature Management Suite
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex font-sans antialiased transition-colors">
      
      {/* 1. Left Fixed Enterprise Sidebar */}
      <Sidebar activeTab={adminTab} setActiveTab={setAdminTab} />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Header */}
        <DashboardHeader onNavigateTab={setAdminTab} />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div key={adminTab} className="animate-page-enter">
            {adminTab === 'dashboard' && <DashboardView />}
            {adminTab === 'barbers' && <BarbersView />}
            {adminTab === 'customers' && <CustomersView />}
            {adminTab === 'booking' && <BookingView />}
            {adminTab === 'walkin' && <WalkInView />}
            {adminTab === 'finance' && <FinanceView />}
            {adminTab === 'branches' && <BranchesView />}
          </div>
        </main>

        {/* System Footer */}
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] py-3.5 px-6 text-center text-xs text-[var(--text-dim)] shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[var(--text-main)] font-['Cinzel',serif]">BLUEBOX BARBER</span>
              <span>• Full Management & Operations Suite</span>
            </div>
            <p className="text-[11px] text-[var(--text-dim)]">
              Multi-Branch Matrix • Owner Master Control
            </p>
          </div>
        </footer>

      </div>

    </div>
  );
};

export default App;
