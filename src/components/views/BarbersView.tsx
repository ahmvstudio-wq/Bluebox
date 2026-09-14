import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { Scissors, ArrowDownRight, Clock, DollarSign, X } from 'lucide-react';

export const BarbersView: React.FC = () => {
  const { barberPerformanceList, addWithdrawal } = useCash();

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#D4AF37]" />
            Barber Performance & Daily Earnings
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Individual client counters, completed services, shift hours, and worker earnings.
          </p>
        </div>
      </div>

      {/* Grid of Barber Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barberPerformanceList.map((stat) => (
          <div
            key={stat.barber.id}
            className="card-executive p-5 space-y-4 hover:border-[#D4AF37] transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={stat.barber.avatar}
                  alt={stat.barber.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">{stat.barber.name}</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">{stat.barber.specialty}</p>
                </div>
              </div>
              <span className="badge-status badge-gold">
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

            {/* Wallet Balance & Advance Button */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--text-dim)] uppercase font-bold block">Remaining Owed</span>
                <span className="text-sm font-black text-[#D4AF37] font-mono">
                  ₾{stat.remainingOwed.toFixed(2)} GEL
                </span>
              </div>

              <button
                onClick={() => setWithdrawModalBarberId(stat.barber.id)}
                className="btn-secondary text-xs"
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Give Advance</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Give Advance Modal */}
      {withdrawModalBarberId && activeModalBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card-executive w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                Give Advance: {activeModalBarber.barber.name}
              </h3>
              <button 
                onClick={() => setWithdrawModalBarberId(null)} 
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-lg"
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
