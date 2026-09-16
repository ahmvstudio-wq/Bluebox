import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  ShieldCheck, 
  Scissors, 
  ArrowRight, 
  CheckCircle2,
  Info,
  Sun,
  Moon,
  Languages
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { barbers, loginAsAdmin, loginAsBarber, theme, toggleTheme, language, toggleLanguage, t } = useCash();
  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0]?.id || 'b1');

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col justify-center items-center p-4 sm:p-6 text-[var(--text-main)] font-sans antialiased relative overflow-hidden transition-colors">
      
      {/* Background Decorative Gold Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar with Language + Theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        {/* Bilingual Language Switcher Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95"
          title={language === 'en' ? 'التبديل إلى اللغة العربية' : 'Switch to English'}
        >
          <Languages className="w-4 h-4 text-[#D4AF37]" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all flex items-center gap-2 text-xs font-semibold shadow-xs active:scale-95"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">{t('theme.light', 'Light Mode')}</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#71717A]" />
              <span className="hidden sm:inline">{t('theme.dark', 'Dark Mode')}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-md">
            <img
              src="/logo.jpg"
              alt="Blackbox Barber"
              className="w-10 h-10 rounded-full border border-[#D4AF37] object-cover shadow-sm"
            />
            <div className="text-left rtl:text-right">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-wide text-[var(--text-main)]">{t('brand.name', 'BLACKBOX')}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border border-[#D4AF37]/40">{t('brand.sub', 'BARBER')}</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">{t('brand.operations', 'Operations & Management System')}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            {t('auth.selectRole', 'Select Your Role to Sign In')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto">
            {t('auth.roleDesc', 'Dual-role workspace architecture: Management accesses branch-wide financial operations; barbers access their dedicated chair workstation.')}
          </p>
        </div>

        {/* RBAC Dual-Role Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: Admin / Owner */}
          <div className="card-executive p-6 space-y-5 border-[var(--border-card)] hover:border-[#D4AF37] transition-all flex flex-col justify-between bg-[var(--bg-card)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[#D4AF37]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="badge-status badge-neutral">
                  {t('auth.adminAccess', 'Full Access')}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-black text-[var(--text-main)]">{t('auth.adminTitle', '1. Admin / Owner Portal')}</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  {t('auth.adminDesc', 'Full operational view across all branches, barbers, live revenues, dedicated expense tracking, and master booking calendar.')}
                </p>
              </div>

              {/* What Admin Sees */}
              <div className="space-y-2 text-xs border-t border-[var(--border-subtle)] pt-3 text-[var(--text-muted)]">
                <div className="font-semibold text-[var(--text-dim)] text-[11px] uppercase tracking-wider">{t('auth.adminScope', 'Access Scope:')}</div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> {t('auth.scope.branches', 'All 3 Branches')}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> {t('auth.scope.barbers', 'All 12 Barbers')}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> {t('auth.scope.revenues', 'Total Revenues')}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> {t('auth.scope.expenses', 'Expense Tracking')}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> {t('auth.scope.advances', 'Barber Advances')}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> {t('auth.scope.crm', 'Customer CRM')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={loginAsAdmin}
                className="w-full py-3 px-4 rounded-xl bg-[#18181B] dark:bg-[#27272A] hover:bg-[#27272A] text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#D4AF37]/50 shadow-sm transition-all group"
              >
                <span>{t('auth.enterAdmin', 'Enter as Admin / Owner')}</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Barber Personal Login */}
          <div className="card-executive p-6 space-y-5 border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all flex flex-col justify-between bg-[var(--bg-card)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[#D4AF37]">
                  <Scissors className="w-6 h-6" />
                </div>
                <span className="badge-status badge-gold">
                  {t('barber.commission50Badge', '50% Commission')}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-black text-[var(--text-main)]">{t('auth.barberTitle', '2. Barber Staff Portal')}</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  {t('auth.barberDesc', 'Clean personal chair view. The barber sees ONLY their own clients, appointments, daily cut counter, and automated 50% commission payroll.')}
                </p>
              </div>

              {/* Barber Persona Picker */}
              <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
                <label className="block text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">
                  {t('auth.selectBarberToTest', 'Select Barber Account to Test:')}
                </label>

                <div className="relative">
                  <select
                    value={selectedBarberId}
                    onChange={(e) => setSelectedBarberId(e.target.value)}
                    className="w-full text-xs font-semibold py-2.5 px-3 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] focus:outline-none"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.specialty}) — {b.branchId.toUpperCase()} (50%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Barber Preview Pill */}
                {selectedBarber && (
                  <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center gap-3">
                    <img
                      src={selectedBarber.avatar}
                      alt={selectedBarber.name}
                      className="w-9 h-9 rounded-lg object-cover border border-[#D4AF37]/40"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[var(--text-main)] truncate">{selectedBarber.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{selectedBarber.specialty} • {t('barber.commission50Badge', '50% Commission')}</div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="pt-4">
              <button
                onClick={() => loginAsBarber(selectedBarberId)}
                className="w-full py-3 px-4 rounded-xl btn-primary-gold text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all group"
              >
                <span>{t('auth.loginAs', 'Login as')} {selectedBarber?.name}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Critical Permission Rule Callout */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs shadow-sm">
          <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="space-y-1 text-[var(--text-muted)]">
            <span className="font-bold text-[var(--text-main)] block">{t('auth.securityNoticeTitle', 'Critical Security Rule Verified')}</span>
            <p className="leading-relaxed text-[11px]">
              {t('auth.securityNoticeDesc', 'When a barber logs in, they only see their own clients, cuts, earnings, and appointments. They cannot see other barbers\' stats, overall shop revenue, shop expenses, or other branches.')}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

