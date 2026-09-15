import React, { useState, useMemo } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  Scissors, 
  ArrowDownRight, 
  Clock, 
  X, 
  ChevronDown, 
  ChevronUp, 
  CalendarCheck, 
  ShieldCheck, 
  CheckCircle2,
  Lock,
  UserCheck,
  TrendingUp,
  Award,
  DollarSign,
  Users
} from 'lucide-react';

export const BarbersView: React.FC = () => {
  const { 
    barberPerformanceList, 
    branchBookings, 
    branchWithdrawals, 
    loginAsBarber,
    branches,
    currentBranch
  } = useCash();

  const [expandedBarberId, setExpandedBarberId] = useState<string | null>(null);

  // Top Performance Benchmark Metrics
  const activeBranchData = branches.find((b) => b.id === currentBranch) || branches[0];

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

  const totalBranchRevenue = useMemo(() => {
    return barberPerformanceList.reduce((sum, b) => sum + b.revenueGenerated, 0);
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#D4AF37]" />
            Barber Performance & Staff Dossiers
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Operational leaderboards, individual chair output, and live station ledgers for {activeBranchData.name}.
          </p>
        </div>
      </div>

      {/* 1. Staff Performance Benchmark Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Most Cuts Served (Volume Leader) */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Most Cuts Served
            </span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-2 py-0.5 font-bold flex items-center gap-1">
              <Scissors className="w-3 h-3 text-[#D4AF37]" /> Volume
            </span>
          </div>
          <div className="mt-3">
            <span className="text-base sm:text-lg font-black text-[var(--text-main)] block truncate">
              {topCutsBarber?.barber.name || 'Barber'}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400 block mt-0.5">
              {topCutsBarber?.servicesCompleted || 0} cuts completed today
            </span>
          </div>
        </div>

        {/* Metric 2: Highest Ticket Average (Quality / Premium Leader) */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Highest Ticket Avg
            </span>
            <span className="badge-status badge-neutral text-[9px] sm:text-[10px] px-2 py-0.5 font-bold flex items-center gap-1">
              <Award className="w-3 h-3 text-blue-400" /> Premium
            </span>
          </div>
          <div className="mt-3">
            <span className="text-base sm:text-lg font-black text-[var(--text-main)] block truncate">
              {topAvgTicketBarber?.barber.name || 'Barber'}
            </span>
            <span className="text-xs font-mono font-bold text-[#D4AF37] block mt-0.5">
              ₾{topBarberAvgTicket.toFixed(1)} GEL / client
            </span>
          </div>
        </div>

        {/* Metric 3: Staff Productivity Benchmark */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Avg Cuts / Barber
            </span>
            <span className="badge-status badge-neutral text-[9px] sm:text-[10px] px-2 py-0.5 font-bold">
              Benchmark
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-mono block">
              {avgCutsPerBarber.toFixed(1)} Cuts
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
              Per active barber station
            </span>
          </div>
        </div>

        {/* Metric 4: Active Stations */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Active Stations
            </span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-2 py-0.5 font-bold">
              Staff
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-[#D4AF37] font-mono block">
              {barberPerformanceList.length} Chairs
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
          const barberWithdrawalsList = branchWithdrawals.filter((w) => w.barberId === stat.barber.id);

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
                        <span className="badge-status badge-gold">50% Commission</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                          {stat.barber.workingHours}h Shift
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
                    <button
                      onClick={() => loginAsBarber(stat.barber.id)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Switch to Barber View</span>
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
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Today's Revenue</span>
                    <span className="text-lg font-black text-[var(--text-main)] font-mono">₾{stat.revenueGenerated.toFixed(2)}</span>
                    <span className="text-[9px] text-[var(--text-dim)] block">Gross Generated</span>
                  </div>

                  <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Clients Served</span>
                    <span className="text-lg font-black text-emerald-500 font-mono">{stat.clientsServedToday}</span>
                    <span className="text-[9px] text-[var(--text-dim)] block">{stat.servicesCompleted} cuts</span>
                  </div>

                  <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">50% Barber Payout</span>
                    <span className="text-lg font-black text-[#D4AF37] font-mono">₾{stat.barberEarnings.toFixed(2)}</span>
                    <span className="text-[9px] text-[var(--text-dim)] block">Today's Share</span>
                  </div>

                  <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Monthly Earnings</span>
                    <span className="text-lg font-black text-emerald-500 font-mono">₾{stat.monthEarnings.toFixed(2)}</span>
                    <span className="text-[9px] text-[var(--text-dim)] block">MTD Accumulated</span>
                  </div>
                </div>

                {/* 3. Service History Ledger */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Today's Service History ({barberBookings.length})
                  </h4>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {barberBookings.length === 0 ? (
                      <div className="text-xs text-[var(--text-dim)] py-3 text-center">No bookings completed yet today.</div>
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
                              apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
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
                        {barberBranch?.shortName} • {stat.barber.workingHours}h shift
                      </span>
                    </div>
                  </div>

                  <span className="badge-status badge-gold text-[9px] px-1.5 py-0.5">
                    50% Cut
                  </span>
                </div>

                {/* 2-Column Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs">
                  <div className="p-2 bg-[var(--bg-subtle)] rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Today Revenue</span>
                    <span className="font-mono font-black text-sm text-[var(--text-main)]">₾{stat.revenueGenerated.toFixed(0)}</span>
                  </div>

                  <div className="p-2 bg-[var(--bg-subtle)] rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Clients Served</span>
                    <span className="font-mono font-black text-sm text-emerald-500">{stat.clientsServedToday}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setExpandedBarberId(stat.barber.id)}
                  className="w-full py-1.5 px-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#D4AF37] text-xs font-semibold text-[var(--text-main)] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span>View Chair Dossier</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
