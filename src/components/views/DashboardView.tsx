import React, { useState } from 'react';
import { useCash, BarberStats } from '../../context/CashContext';
import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  Scissors, 
  Footprints, 
  DollarSign, 
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Clock,
  UserCheck,
  X,
  Lock,
  Sparkles,
  Banknote,
  CreditCard,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    todayCustomers,
    todayRevenue,
    todayBookingsCount,
    todayWalkInsCount,
    barberPerformanceList,
    branchBookings,
    branches,
    currentBranch,
    loginAsBarber
  } = useCash();

  // State for expanded barber inline or sheet modal
  const [expandedBarberId, setExpandedBarberId] = useState<string | null>(null);
  const [activeSheetBarber, setActiveSheetBarber] = useState<BarberStats | null>(null);

  const activeBranchData = branches.find((b) => b.id === currentBranch) || branches[0];

  const handleBarberClick = (stat: BarberStats) => {
    setActiveSheetBarber(stat);
  };

  const toggleInlineExpand = (e: React.MouseEvent, barberId: string) => {
    e.stopPropagation();
    setExpandedBarberId((prev) => (prev === barberId ? null : barberId));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Primary Executive Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Today's Revenue */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Today's Revenue
            </span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-1.5 py-0.5">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-mono">
              ₾{todayRevenue.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-[#D4AF37]">GEL</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2 truncate">
            Gross booking volume today
          </div>
        </div>

        {/* Today's Customers */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Today's Clients
            </span>
            <span className="badge-status badge-neutral text-[9px] sm:text-[10px] px-1.5 py-0.5">
              <Users className="w-3 h-3" /> Served
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-mono">
              {todayCustomers}
            </span>
            <span className="text-xs text-[var(--text-dim)]">completed visits</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2 truncate">
            Across {activeBranchData.name} chairs
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Scheduled Queue
            </span>
            <span className="badge-status badge-neutral text-[9px] sm:text-[10px] px-1.5 py-0.5">
              <CalendarCheck className="w-3 h-3" /> Pipeline
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-mono">
              {todayBookingsCount}
            </span>
            <span className="text-xs text-[var(--text-dim)]">appointments</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2 truncate">
            Reserved chair slots
          </div>
        </div>

        {/* Walk-ins vs Bookings */}
        <div className="card-executive p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Traffic Mix
            </span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-1.5 py-0.5">
              Ratio
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 font-mono">
                {todayWalkInsCount}
              </span>
              <span className="text-[10px] text-[var(--text-dim)] block">Walk-ins</span>
            </div>
            <div className="h-6 w-px bg-[var(--border-subtle)]"></div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-mono">
                {todayBookingsCount}
              </span>
              <span className="text-[10px] text-[var(--text-dim)] block">Booked</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2 truncate">
            Total flow: {todayWalkInsCount + todayBookingsCount} clients
          </div>
        </div>

      </div>

      {/* 2. Interactive Staff Breakdown Grid (Clients & Revenue by Barber with Click-to-Open Sheets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Card A: Clients Served by Barber */}
        <div className="card-executive p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                Clients Served by Barber
              </h3>
              <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                Click any barber to open their station sheet & visit history
              </p>
            </div>
            <span className="badge-status badge-neutral text-xs font-mono font-bold">
              {todayCustomers} Total
            </span>
          </div>

          <div className="space-y-2">
            {barberPerformanceList.map((stat) => {
              const isExpanded = expandedBarberId === stat.barber.id;
              const barberBookings = branchBookings.filter((b) => b.barberId === stat.barber.id);

              return (
                <div
                  key={stat.barber.id}
                  className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[#D4AF37] transition-all overflow-hidden"
                >
                  {/* Barber Header Row (Clickable) */}
                  <div
                    onClick={() => handleBarberClick(stat)}
                    className="p-3 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={stat.barber.avatar}
                        alt={stat.barber.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[var(--border-subtle)] group-hover:border-[#D4AF37] transition-colors shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[var(--text-main)] group-hover:text-[#D4AF37] transition-colors truncate flex items-center gap-1.5">
                          <span>{stat.barber.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-dim)] hidden sm:inline">
                            50% Cut
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate">
                          {stat.barber.specialty}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black text-[#D4AF37] font-mono block">
                          {stat.clientsServedToday}
                        </span>
                        <span className="text-[10px] text-[var(--text-dim)] block">
                          {stat.clientsServedToday === 1 ? 'client today' : 'clients today'}
                        </span>
                      </div>

                      {/* Expandable Accordion Toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleInlineExpand(e, stat.barber.id)}
                        className="p-1 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand quick summary'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Inline Expanded Quick Summary */}
                  {isExpanded && (
                    <div className="p-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] space-y-2 text-xs animate-fade-in">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-[var(--bg-subtle)]">
                          <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Revenue</span>
                          <span className="font-mono font-black text-sm text-[var(--text-main)]">
                            ₾{stat.revenueGenerated.toFixed(0)}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[var(--bg-subtle)]">
                          <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">50% Cut</span>
                          <span className="font-mono font-black text-sm text-[#D4AF37]">
                            ₾{stat.barberEarnings.toFixed(0)}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[var(--bg-subtle)]">
                          <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Cuts Done</span>
                          <span className="font-mono font-black text-sm text-emerald-500">
                            {stat.servicesCompleted}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[var(--text-dim)]">
                          {barberBookings.length} total visits logged today
                        </span>
                        <button
                          onClick={() => handleBarberClick(stat)}
                          className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                        >
                          <span>Open Full Station Sheet</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Card B: Revenue Generated by Barber */}
        <div className="card-executive p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#D4AF37]" />
                Revenue Generated by Barber
              </h3>
              <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                Live chair sales with 50% commission allocation
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#D4AF37]">
              ₾{todayRevenue.toFixed(2)} GEL
            </span>
          </div>

          <div className="space-y-2">
            {barberPerformanceList.map((stat) => {
              const isExpanded = expandedBarberId === stat.barber.id;
              const barberBookings = branchBookings.filter((b) => b.barberId === stat.barber.id);

              return (
                <div
                  key={stat.barber.id}
                  className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[#D4AF37] transition-all overflow-hidden"
                >
                  {/* Barber Header Row (Clickable) */}
                  <div
                    onClick={() => handleBarberClick(stat)}
                    className="p-3 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={stat.barber.avatar}
                        alt={stat.barber.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[var(--border-subtle)] group-hover:border-[#D4AF37] transition-colors shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[var(--text-main)] group-hover:text-[#D4AF37] transition-colors truncate">
                          {stat.barber.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)]">
                          Commission: <span className="font-mono font-bold text-[#D4AF37]">₾{stat.barberEarnings.toFixed(2)} GEL</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black text-[var(--text-main)] font-mono block">
                          ₾{stat.revenueGenerated.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[var(--text-dim)] block">
                          service sales
                        </span>
                      </div>

                      {/* Expandable Accordion Toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleInlineExpand(e, stat.barber.id)}
                        className="p-1 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand quick summary'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Inline Expanded Quick Summary */}
                  {isExpanded && (
                    <div className="p-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] space-y-2 text-xs animate-fade-in">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span>Month Base: <strong className="text-[var(--text-main)]">₾{stat.monthEarnings.toFixed(2)} GEL</strong></span>
                        <span>Working Shift: <strong className="text-[var(--text-main)]">{stat.barber.workingHours}h</strong></span>
                      </div>
                      
                      <button
                        onClick={() => handleBarberClick(stat)}
                        className="w-full py-1.5 px-3 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Open Station Dossier Sheet</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Comprehensive Barber Dossier & Station Sheet Modal (Opens on Click) */}
      {activeSheetBarber && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-5 animate-scale-in max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={activeSheetBarber.barber.avatar}
                  alt={activeSheetBarber.barber.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-md shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-[var(--text-main)]">
                      {activeSheetBarber.barber.name}
                    </h3>
                    <span className="badge-status badge-gold text-[10px]">
                      50% Commission
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {activeSheetBarber.barber.specialty}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-dim)] font-mono mt-1">
                    <span>{activeBranchData.name}</span>
                    <span>•</span>
                    <span>{activeSheetBarber.barber.workingHours}h Shift</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-[#D4AF37]">
                      <Lock className="w-2.5 h-2.5" /> PIN: {activeSheetBarber.barber.pin || '1234'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveSheetBarber(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Today Sales</span>
                <span className="text-base font-black text-[var(--text-main)] font-mono">
                  ₾{activeSheetBarber.revenueGenerated.toFixed(0)}
                </span>
                <span className="text-[9px] text-[var(--text-dim)] block">GEL Gross</span>
              </div>

              <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">50% Payout</span>
                <span className="text-base font-black text-[#D4AF37] font-mono">
                  ₾{activeSheetBarber.barberEarnings.toFixed(0)}
                </span>
                <span className="text-[9px] text-[var(--text-dim)] block">Earned Today</span>
              </div>

              <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Clients Served</span>
                <span className="text-base font-black text-emerald-500 font-mono">
                  {activeSheetBarber.clientsServedToday}
                </span>
                <span className="text-[9px] text-[var(--text-dim)] block">{activeSheetBarber.servicesCompleted} cuts</span>
              </div>

              <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Month Total</span>
                <span className="text-base font-black text-emerald-500 font-mono">
                  ₾{activeSheetBarber.monthEarnings.toFixed(0)}
                </span>
                <span className="text-[9px] text-[var(--text-dim)] block">MTD Accrued</span>
              </div>
            </div>

            {/* Today's Service Execution Ledger */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Today's Chair Activity (
                  {branchBookings.filter((b) => b.barberId === activeSheetBarber.barber.id).length}
                  )
                </h4>
                <span className="text-[10px] text-emerald-500 font-bold">Live Status</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {branchBookings.filter((b) => b.barberId === activeSheetBarber.barber.id).length === 0 ? (
                  <div className="text-xs text-[var(--text-dim)] py-4 text-center">
                    No bookings logged for this station today yet.
                  </div>
                ) : (
                  branchBookings
                    .filter((b) => b.barberId === activeSheetBarber.barber.id)
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                            <span>{apt.customerName}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-dim)] font-mono">
                              {apt.time}
                            </span>
                          </div>
                          <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                            {apt.serviceName} • {apt.source} ({apt.type})
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-[var(--text-main)] block">
                            ₾{apt.price.toFixed(2)} GEL
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-mono uppercase font-bold inline-block mt-0.5 ${
                              apt.status.toLowerCase() === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : apt.status.toLowerCase() === 'arrived' || apt.status.toLowerCase() === 'in service'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  loginAsBarber(activeSheetBarber.barber.id);
                  setActiveSheetBarber(null);
                }}
                className="btn-primary-gold text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>Switch to Barber View</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSheetBarber(null)}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Close Sheet
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
