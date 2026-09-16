import React, { useState, useMemo } from 'react';
import { useCash } from '../../context/CashContext';
import { DEFAULT_COMMISSION_RATE, STUDENT_DISCOUNT_PERCENT } from '../../constants';
import { 
  Scissors, 
  Clock, 
  X, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Lock,
  UserCheck,
  Award,
  Percent,
  Sliders,
  Sparkles,
  Save
} from 'lucide-react';
import { Barber } from '../../types';

export const BarbersView: React.FC = () => {
  const { 
    barbers,
    barberPerformanceList, 
    branchBookings, 
    loginAsBarber,
    updateBarberCommission,
    branches,
    currentBranch,
    t
  } = useCash();

  const [expandedBarberId, setExpandedBarberId] = useState<string | null>(null);

  // Commission Allocator Modal State
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [commissionPercent, setCommissionPercent] = useState<number>(50);
  const [workingHours, setWorkingHours] = useState<number>(8);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active branch context
  const activeBranchData = branches.find((b) => b.id === currentBranch) || branches[0];

  // Selected Barber Object for Modal
  const currentModalBarber = useMemo(() => {
    if (!selectedBarberId && barbers.length > 0) return barbers[0];
    return barbers.find((b) => b.id === selectedBarberId) || barbers[0];
  }, [selectedBarberId, barbers]);

  // Open modal preselected for a specific barber
  const openCommissionModalForBarber = (barber: Barber) => {
    setSelectedBarberId(barber.id);
    setCommissionPercent(Math.round(barber.commissionRate * 100));
    setWorkingHours(barber.workingHours);
    setIsCommissionModalOpen(true);
  };

  const handleSaveCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModalBarber) return;

    const rateFraction = commissionPercent / 100;
    updateBarberCommission(currentModalBarber.id, rateFraction, workingHours);

    setToastMessage(`✓ Commission updated for ${currentModalBarber.name}: ${commissionPercent}% Tier (${workingHours}h shift).`);
    setIsCommissionModalOpen(false);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Staff Performance Benchmark Metrics
  const topCutsBarber = useMemo(() => {
    if (!barberPerformanceList.length) return null;
    return [...barberPerformanceList].sort((a, b) => b.servicesCompleted - a.servicesCompleted)[0];
  }, [barberPerformanceList]);

  const topAvgTicketBarber = useMemo(() => {
    if (!barberPerformanceList.length) return null;
    const withCuts = barberPerformanceList.filter((b) => b.servicesCompleted > 0);
    if (!withCuts.length) return barberPerformanceList[0];
    return [...withCuts].sort(
      (a, b) => (b.revenueGenerated / b.servicesCompleted) - (a.revenueGenerated / a.servicesCompleted)
    )[0];
  }, [barberPerformanceList]);

  const totalBranchCuts = useMemo(() => {
    return barberPerformanceList.reduce((sum, b) => sum + b.servicesCompleted, 0);
  }, [barberPerformanceList]);

  const avgCutsPerBarber = useMemo(() => {
    if (!barberPerformanceList.length) return 0;
    return totalBranchCuts / barberPerformanceList.length;
  }, [totalBranchCuts, barberPerformanceList]);

  const topBarberAvgTicket = useMemo(() => {
    if (!topAvgTicketBarber || topAvgTicketBarber.servicesCompleted === 0) return 0;
    return topAvgTicketBarber.revenueGenerated / topAvgTicketBarber.servicesCompleted;
  }, [topAvgTicketBarber]);

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#D4AF37]" />
            {t('barbers.title', 'Barber Performance & Commission Allocation')}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {t('barbers.subtitle', 'Operational leaderboards, individual chair output, automated 50% commission tiers, and live station ledgers.')} ({activeBranchData.name})
          </p>
        </div>

        {/* Global Commission Allocator Action */}
        <button
          onClick={() => {
            if (barbers.length > 0) {
              openCommissionModalForBarber(barbers[0]);
            }
          }}
          className="btn-primary-gold text-xs py-2 px-4 font-bold flex items-center gap-2 shadow-md active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t('barbers.allocateBtn', 'Allocate Commission & Rates')}</span>
        </button>
      </div>

      {/* 1. Staff Performance Benchmark Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Most Cuts Served (Volume Leader) */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('barbers.mostCuts', 'Most Cuts Served')}
            </span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-2 py-0.5 font-bold flex items-center gap-1">
              <Scissors className="w-3 h-3 text-[#D4AF37]" /> {t('barbers.volume', 'Volume')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-base sm:text-lg font-black text-[var(--text-main)] block truncate">
              {topCutsBarber?.barber.name || 'Barber'}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400 block mt-0.5">
              {topCutsBarber?.servicesCompleted || 0} {t('barbers.cutsCompletedToday', 'cuts completed today')}
            </span>
          </div>
        </div>

        {/* Metric 2: Highest Ticket Average (Quality / Premium Leader) */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('barbers.highestTicket', 'Highest Ticket Avg')}
            </span>
            <span className="badge-status badge-neutral text-[9px] sm:text-[10px] px-2 py-0.5 font-bold flex items-center gap-1">
              <Award className="w-3 h-3 text-blue-400" /> {t('barbers.premium', 'Premium')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-base sm:text-lg font-black text-[var(--text-main)] block truncate">
              {topAvgTicketBarber?.barber.name || 'Barber'}
            </span>
            <span className="text-xs font-mono font-bold text-[#D4AF37] block mt-0.5">
              ₾{topBarberAvgTicket.toFixed(1)} {t('barbers.perClient', 'GEL / client')}
            </span>
          </div>
        </div>

        {/* Metric 3: Staff Productivity Benchmark */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('barbers.avgCuts', 'Avg Cuts / Barber')}
            </span>
            <span className="badge-status badge-neutral text-[9px] sm:text-[10px] px-2 py-0.5 font-bold">
              {t('barbers.benchmark', 'Benchmark')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-mono block">
              {avgCutsPerBarber.toFixed(1)} {t('barbers.cuts', 'Cuts')}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
              {t('barbers.perActiveStation', 'Per active barber station')}
            </span>
          </div>
        </div>

        {/* Metric 4: Active Stations */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('barbers.activeChairs', 'Active Stations')}
            </span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-2 py-0.5 font-bold">
              {t('barbers.staff', 'Staff')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-[#D4AF37] font-mono block">
              {barberPerformanceList.length} {t('barbers.chairs', 'Chairs')}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
              {activeBranchData.name}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Grid of Barber Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {barberPerformanceList.map((stat) => {
          const isExpanded = expandedBarberId === stat.barber.id;
          const barberBranch = branches.find((b) => b.id === stat.barber.branchId);
          const barberBookings = branchBookings.filter((b) => b.barberId === stat.barber.id);
          const commissionPercentDisplay = Math.round(stat.barber.commissionRate * 100);

          if (isExpanded) {
            return (
              <div
                key={stat.barber.id}
                className="col-span-full card-executive p-4 sm:p-6 space-y-5 border-[#D4AF37] shadow-xl ring-1 ring-[#D4AF37]/30 animate-scale-in bg-[var(--bg-card)]"
              >
                {/* 1. Expanded Header Banner */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={stat.barber.avatar}
                      alt={stat.barber.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-md shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)]">{stat.barber.name}</h3>
                        
                        {/* Clickable Commission Badge */}
                        <button
                          onClick={() => openCommissionModalForBarber(stat.barber)}
                          className="badge-status badge-gold cursor-pointer hover:scale-105 transition-transform"
                          title="Click to allocate custom commission rate"
                        >
                          {commissionPercentDisplay}% {t('barber.commission50Badge', 'Commission')} ⚙️
                        </button>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                          {stat.barber.workingHours}h {t('dash.shift', 'Shift')}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-dim)] flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-[#D4AF37]" />
                          PIN: {stat.barber.pin || '1234'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {stat.barber.specialty} • Branch: <strong className="text-[var(--text-main)]">{barberBranch?.name || stat.barber.branchId}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Allocate Commission Button */}
                    <button
                      onClick={() => openCommissionModalForBarber(stat.barber)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t('barbers.allocate', 'Allocate')}</span>
                    </button>

                    <button
                      onClick={() => loginAsBarber(stat.barber.id)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t('auth.switchToBarber', 'Switch to Barber View')}</span>
                    </button>

                    <button
                      onClick={() => setExpandedBarberId(null)}
                      className="p-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Key Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">{t('dash.todayRevenue', "Today's Revenue")}</span>
                    <span className="text-lg font-black text-[var(--text-main)] font-mono">₾{stat.revenueGenerated.toFixed(2)}</span>
                    <span className="text-[9px] text-[var(--text-dim)] block">{t('barbers.grossGenerated', 'Gross Generated')}</span>
                  </div>

                  <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">{t('dash.clientsServed', 'Clients Served')}</span>
                    <span className="text-lg font-black text-emerald-500 font-mono">{stat.clientsServedToday}</span>
                    <span className="text-[9px] text-[var(--text-dim)] block">{stat.servicesCompleted} {t('dash.cuts', 'cuts')}</span>
                  </div>

                  <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">{commissionPercentDisplay}% {t('barbers.payout', 'Barber Payout')}</span>
                    <span className="text-lg font-black text-[#D4AF37] font-mono">₾{stat.barberEarnings.toFixed(2)}</span>
                    <span className="text-[9px] text-[var(--text-dim)] block">{t('barbers.todayShare', "Today's Share")}</span>
                  </div>

                  <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">{t('barbers.monthlyEarnings', 'Monthly Accumulated Earnings')}</span>
                    <span className="text-lg font-black text-emerald-500 font-mono">₾{stat.monthEarnings.toFixed(2)}</span>
                    <span className="text-[9px] text-[var(--text-dim)] block">{t('barbers.mtdAccumulated', 'MTD Accumulated')}</span>
                  </div>
                </div>

                {/* 3. Service History Ledger */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {t('barbers.todayHistory', "Today's Service History")} ({barberBookings.length})
                  </h4>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {barberBookings.length === 0 ? (
                      <div className="text-xs text-[var(--text-dim)] py-3 text-center">{t('barbers.noBookingsCompleted', 'No bookings completed yet today.')}</div>
                    ) : (
                      barberBookings.map((apt) => (
                        <div key={apt.id} className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[var(--text-main)] block">{apt.customerName}</span>
                            <span className="text-[10px] text-[var(--text-dim)]">{apt.time} • {apt.serviceName} ({apt.source})</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-[#D4AF37]">₾{apt.price.toFixed(2)}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-md ml-1 font-mono uppercase font-bold ${
                              apt.status.toLowerCase() === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            );
          }

          // Compact Barber Card
          return (
            <div
              key={stat.barber.id}
              className="card-executive p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-[#D4AF37]"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={stat.barber.avatar}
                      alt={stat.barber.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[var(--border-subtle)] shadow-xs shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-[var(--text-main)]">
                        {stat.barber.name}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {stat.barber.specialty}
                      </p>
                      <span className="text-[9px] font-mono text-[var(--text-dim)]">
                        {barberBranch?.shortName} • {stat.barber.workingHours}h {t('dash.shift', 'Shift')}
                      </span>
                    </div>
                  </div>

                  {/* Clickable Commission Badge */}
                  <button
                    onClick={() => openCommissionModalForBarber(stat.barber)}
                    className="badge-status badge-gold text-[9px] px-2 py-0.5 hover:scale-105 transition-transform cursor-pointer"
                    title="Click to allocate commission percentage"
                  >
                    {commissionPercentDisplay}% {t('dash.cut50', '50% Cut')}
                  </button>
                </div>

                {/* 2-Column Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs">
                  <div className="p-2 bg-[var(--bg-subtle)] rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">{t('dash.todayRevenue', 'Today Revenue')}</span>
                    <span className="font-mono font-black text-sm text-[var(--text-main)]">₾{stat.revenueGenerated.toFixed(2)}</span>
                  </div>

                  <div className="p-2 bg-[var(--bg-subtle)] rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">{commissionPercentDisplay}% {t('barbers.earned', 'Earned')}</span>
                    <span className="font-mono font-black text-sm text-[#D4AF37]">₾{stat.barberEarnings.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2">
                <button
                  onClick={() => openCommissionModalForBarber(stat.barber)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-[#D4AF37]/40 text-xs font-bold text-[#D4AF37] flex items-center justify-center gap-1 transition-all active:scale-95"
                  title="Configure commission rate & percentages"
                >
                  <Percent className="w-3 h-3" />
                  <span>{t('barbers.allocate', 'Allocate')}</span>
                </button>

                <button
                  onClick={() => setExpandedBarberId(stat.barber.id)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#D4AF37] text-xs font-semibold text-[var(--text-main)] flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <span>{t('barbers.dossier', 'Dossier')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Universal Admin Barber Commission & Percentage Allocation Modal */}
      {isCommissionModalOpen && currentModalBarber && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-5 animate-scale-in max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-main)]">
                    {t('barbers.modal.title', 'Allocate Barber Commission & Tiers')}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {t('barbers.modal.desc', 'Configure revenue split percentage and station shift parameters for staff.')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCommissionModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCommission} className="space-y-4">
              
              {/* Barber Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  {t('barbers.modal.selectBarber', 'Select Barber / Stylist:')}
                </label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => {
                    const b = barbers.find((item) => item.id === e.target.value);
                    if (b) {
                      setSelectedBarberId(b.id);
                      setCommissionPercent(Math.round(b.commissionRate * 100));
                      setWorkingHours(b.workingHours);
                    }
                  }}
                  className="w-full text-xs font-bold py-2.5 px-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] focus:border-[#D4AF37] cursor-pointer"
                >
                  {barbers.map((b) => {
                    const bBranch = branches.find((br) => br.id === b.branchId);
                    return (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.specialty} ({bBranch?.shortName || b.branchId}) • Current: {Math.round(b.commissionRate * 100)}%
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Commission Percentage Selector & Slider */}
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-[#D4AF37]" />
                    {t('barbers.modal.percent', 'Commission Percentage:')}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-black font-mono text-[#D4AF37]">{commissionPercent}%</span>
                    <span className="text-xs text-[var(--text-dim)] font-bold">{t('barbers.payout', 'Payout')}</span>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="1"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--border-subtle)] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] block mb-1.5">
                    {t('barbers.modal.quickPresets', 'Quick Tier Presets:')}
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[40, 45, 50, 55, 60, 70].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setCommissionPercent(rate)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          commissionPercent === rate
                            ? 'bg-[#D4AF37] text-black shadow-xs font-extrabold'
                            : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Working Hours Shift */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  {t('barbers.modal.shift', 'Daily Station Shift:')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 7, 8, 10].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setWorkingHours(hours)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        workingHours === hours
                          ? 'bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      {hours} {t('barbers.modal.hours', 'Hours')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Revenue Split Simulator */}
              <div className="p-3.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  {t('barbers.modal.simulation', 'Live Payout Simulation (Sample ₾45.00 GEL Haircut):')}
                </span>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[9px] uppercase font-bold text-emerald-500 block">{currentModalBarber.name} ({commissionPercent}%)</span>
                    <span className="text-sm font-black font-mono text-emerald-500">
                      ₾{((45 * commissionPercent) / 100).toFixed(2)} GEL
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[9px] uppercase font-bold text-[#D4AF37] block">{t('barbers.modal.shopMargin', 'Shop Gross Margin')} ({100 - commissionPercent}%)</span>
                    <span className="text-sm font-black font-mono text-[#D4AF37]">
                      ₾{((45 * (100 - commissionPercent)) / 100).toFixed(2)} GEL
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCommissionModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4 font-bold"
                >
                  {t('action.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('barbers.modal.save', 'Save & Apply Allocation')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
