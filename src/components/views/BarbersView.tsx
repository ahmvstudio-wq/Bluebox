import React, { useState } from 'react';
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
  UserCheck
} from 'lucide-react';

export const BarbersView: React.FC = () => {
  const { 
    barberPerformanceList, 
    addWithdrawal, 
    branchBookings, 
    branchWithdrawals, 
    loginAsBarber,
    branches
  } = useCash();

  const [expandedBarberId, setExpandedBarberId] = useState<string | null>(null);
  const [withdrawModalBarberId, setWithdrawModalBarberId] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50');
  const [withdrawReason, setWithdrawReason] = useState<string>('Mid-month cash advance');

  const activeModalBarber = barberPerformanceList.find((b) => b.barber.id === withdrawModalBarberId);

  const handleDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawModalBarberId || !parseFloat(withdrawAmount)) return;
    addWithdrawal(withdrawModalBarberId, parseFloat(withdrawAmount), withdrawReason);
    setWithdrawModalBarberId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#D4AF37]" />
            Barber Performance & Worker Dossiers
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Click any barber card to expand their dedicated profile, live service ledger, and cash advance history.
          </p>
        </div>
      </div>

      {/* Grid of Barber Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {barberPerformanceList.map((stat) => {
          const isExpanded = expandedBarberId === stat.barber.id;
          const barberBranch = branches.find((b) => b.id === stat.barber.branchId);
          const barberBookings = branchBookings.filter((b) => b.barberId === stat.barber.id);
          const barberWithdrawalsList = branchWithdrawals.filter((w) => w.barberId === stat.barber.id);

          if (isExpanded) {
            return (
              <div
                key={stat.barber.id}
                className="col-span-full card-executive p-6 space-y-6 border-[#D4AF37] shadow-xl ring-1 ring-[#D4AF37]/30 animate-scale-in bg-[var(--bg-card)]"
              >
                {/* 1. Expanded Header Banner */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-4">
                    <img
                      src={stat.barber.avatar}
                      alt={stat.barber.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-md shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-[var(--text-main)]">{stat.barber.name}</h3>
                        <span className="badge-status badge-gold">50% Commission Cut</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                          {stat.barber.workingHours}h Shift
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-dim)] flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-[#D4AF37]" />
                          PIN: {stat.barber.pin || '1234'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {stat.barber.specialty} • Branch: <strong className="text-[var(--text-main)]">{barberBranch?.name || stat.barber.branchId}</strong> ({barberBranch?.address})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => loginAsBarber(stat.barber.id)}
                      className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                      title="Switch to this barber's restricted view"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Switch to Barber View</span>
                    </button>

                    <button
                      onClick={() => setWithdrawModalBarberId(stat.barber.id)}
                      className="btn-primary-gold text-xs py-2 px-3 flex items-center gap-1.5"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Give Cash Advance</span>
                    </button>

                    <button
                      onClick={() => setExpandedBarberId(null)}
                      className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] text-xs font-bold transition-all flex items-center gap-1"
                      title="Collapse details"
                    >
                      <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
                      <span>Collapse</span>
                    </button>
                  </div>
                </div>

                {/* 2. Expanded 4-Card Financial Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Today's Revenue</span>
                    <div className="text-xl font-black font-mono text-[var(--text-main)]">
                      ₾{stat.revenueGenerated.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-emerald-500 font-semibold block">
                      Barber 50%: ₾{stat.barberEarnings.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Month Accumulated</span>
                    <div className="text-xl font-black font-mono text-[var(--text-main)]">
                      ₾{(stat.barber.monthBaseEarnings + stat.barberEarnings).toFixed(2)}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      Base: ₾{stat.barber.monthBaseEarnings} GEL
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Cash Advances Paid</span>
                    <div className="text-xl font-black font-mono text-rose-500">
                      -₾{stat.totalWithdrawn.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      {barberWithdrawalsList.length} withdrawals
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Net Remaining Owed</span>
                    <div className="text-xl font-black font-mono text-[#D4AF37]">
                      ₾{stat.remainingOwed.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-[#D4AF37]/80 block font-semibold">
                      Current balance due
                    </span>
                  </div>
                </div>

                {/* 3. Two-Column Deep-Dive: Ledger & Advances */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                  
                  {/* Left: Today's Assigned Appointments & Services */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4 text-[#D4AF37]" />
                        <span>Today's Client Queue & Service Ledger</span>
                      </h4>
                      <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                        {barberBookings.length} clients
                      </span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {barberBookings.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                          No clients assigned to {stat.barber.name} today yet.
                        </div>
                      ) : (
                        barberBookings.map((b) => (
                          <div
                            key={b.id}
                            className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs hover:border-[var(--border-card)] transition-colors"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[var(--text-main)]">{b.customerName}</span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                  b.status.toLowerCase() === 'completed'
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : b.status.toLowerCase() === 'arrived' || b.status.toLowerCase() === 'in service'
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                    : 'bg-[var(--bg-card)] text-[var(--text-dim)] border border-[var(--border-subtle)]'
                                }`}>
                                  {b.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-[var(--text-muted)]">{b.serviceName} • {b.time}</p>
                            </div>

                            <div className="text-right">
                              <span className="font-mono font-bold text-[var(--text-main)] block">
                                ₾{b.price} GEL
                              </span>
                              <span className="text-[10px] text-emerald-500 font-semibold font-mono">
                                Cut: ₾{(b.price * 0.5).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right: Cash Advances & Payouts Record */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                        <ArrowDownRight className="w-4 h-4 text-rose-500" />
                        <span>Advances & Disbursed Draws</span>
                      </h4>
                      <span className="text-xs font-mono font-bold text-rose-500">
                        -₾{stat.totalWithdrawn.toFixed(2)} GEL
                      </span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {barberWithdrawalsList.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                          No cash advances taken by this barber this month.
                        </div>
                      ) : (
                        barberWithdrawalsList.map((w) => (
                          <div
                            key={w.id}
                            className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-[var(--text-main)]">{w.reason}</div>
                              <div className="text-[10px] text-[var(--text-muted)] font-mono">{w.date}</div>
                            </div>
                            <span className="font-mono font-bold text-rose-500 text-sm">
                              -₾{w.amount.toFixed(2)} GEL
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          }

          // Compact Default Card (Collapsible Summary)
          return (
            <div
              key={stat.barber.id}
              className="card-executive p-5 space-y-4 hover:border-[#D4AF37] transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div 
                  className="flex items-start justify-between cursor-pointer group"
                  onClick={() => setExpandedBarberId(stat.barber.id)}
                  title="Click to view full dossier & ledger"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={stat.barber.avatar}
                      alt={stat.barber.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[var(--border-subtle)] group-hover:border-[#D4AF37] transition-colors"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-[#D4AF37] transition-colors">
                        {stat.barber.name}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)]">{stat.barber.specialty}</p>
                    </div>
                  </div>
                  <span className="badge-status badge-gold shrink-0">
                    50% Cut
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] grid grid-cols-3 text-center">
                  <div>
                    <span className="text-[10px] text-[var(--text-dim)] uppercase font-bold block">Clients</span>
                    <span className="text-xl font-black text-[var(--text-main)] font-mono">{stat.clientsServedToday}</span>
                    <span className="text-[9px] text-[var(--text-muted)] block">today</span>
                  </div>
                  <div className="border-x border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-dim)] uppercase font-bold block">Services</span>
                    <span className="text-xl font-black text-[var(--text-main)] font-mono">{stat.servicesCompleted}</span>
                    <span className="text-[9px] text-[var(--text-muted)] block">cuts/trims</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-dim)] uppercase font-bold block">Hours</span>
                    <span className="text-xl font-black text-[var(--text-main)] font-mono">{stat.workingHours}h</span>
                    <span className="text-[9px] text-[var(--text-muted)] block">shift</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                  <div className="flex justify-between">
                    <span>Revenue Generated:</span>
                    <span className="text-[var(--text-main)] font-bold font-mono">₾{stat.revenueGenerated.toFixed(2)} GEL</span>
                  </div>
                  <div className="flex justify-between text-emerald-500 dark:text-emerald-400 font-semibold">
                    <span>Barber 50% Share:</span>
                    <span className="font-mono">₾{stat.barberEarnings.toFixed(2)} GEL</span>
                  </div>
                  <div className="flex justify-between text-rose-500 dark:text-rose-400">
                    <span>Mid-Month Advances:</span>
                    <span className="font-mono">-₾{stat.totalWithdrawn.toFixed(2)} GEL</span>
                  </div>
                </div>
              </div>

              {/* Wallet Balance & Expand Action */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--text-dim)] uppercase font-bold block">Remaining Owed</span>
                    <span className="text-sm font-black text-[#D4AF37] font-mono">
                      ₾{stat.remainingOwed.toFixed(2)} GEL
                    </span>
                  </div>

                  <button
                    onClick={() => setWithdrawModalBarberId(stat.barber.id)}
                    className="btn-secondary text-xs py-1.5 px-2.5"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Advance</span>
                  </button>
                </div>

                <button
                  onClick={() => setExpandedBarberId(stat.barber.id)}
                  className="w-full py-1.5 px-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#D4AF37] text-xs font-semibold text-[var(--text-main)] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span>View Full Dossier & Ledger</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Give Advance Modal */}
      {withdrawModalBarberId && activeModalBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card-executive w-full max-w-sm p-5 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                Give Advance: {activeModalBarber.barber.name}
              </h3>
              <button 
                onClick={() => setWithdrawModalBarberId(null)} 
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDisburse} className="space-y-3 text-xs">
              <div className="p-2.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-muted)]">Remaining Owed:</span>
                <span className="font-bold font-mono text-[#D4AF37]">₾{activeModalBarber.remainingOwed.toFixed(2)} GEL</span>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Advance Amount (GEL) *</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full text-emerald-500 dark:text-emerald-400 font-mono font-bold text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Reason / Memo</label>
                <input
                  type="text"
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setWithdrawModalBarberId(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                >
                  Disburse Cash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
