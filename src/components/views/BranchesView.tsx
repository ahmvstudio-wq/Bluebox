import React from 'react';
import { useCash } from '../../context/CashContext';
import { BranchId } from '../../types';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  BarChart3
} from 'lucide-react';

export const BranchesView: React.FC = () => {
  const { 
    branches, 
    barbers, 
    bookings, 
    currentBranch, 
    setCurrentBranch 
  } = useCash();

  // Compute metrics for each branch
  const branchMetrics = branches.map((b) => {
    const bBarbers = barbers.filter((barber) => barber.branchId === b.id);
    const bBookings = bookings.filter((apt) => apt.branchId === b.id);
    const bCompleted = bBookings.filter((apt) => apt.status === 'completed');
    const customersCount = bCompleted.length;
    const revenue = bCompleted.reduce((sum, apt) => sum + apt.price, 0);
    const avgTicket = customersCount > 0 ? revenue / customersCount : 0;

    // Top barber at branch
    const barberSales: Record<string, { name: string; revenue: number; clients: number }> = {};
    bCompleted.forEach((apt) => {
      if (!barberSales[apt.barberId]) {
        barberSales[apt.barberId] = { name: apt.barberName, revenue: 0, clients: 0 };
      }
      barberSales[apt.barberId].revenue += apt.price;
      barberSales[apt.barberId].clients += 1;
    });

    const topBarber = Object.values(barberSales).sort((a, b) => b.revenue - a.revenue)[0];

    return {
      branch: b,
      barberCount: bBarbers.length,
      customersCount,
      revenue,
      avgTicket,
      topBarber: topBarber || { name: bBarbers[0]?.name || 'N/A', revenue: 0, clients: 0 },
      barbersList: bBarbers,
    };
  });

  const totalNetworkRevenue = branchMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const totalNetworkCustomers = branchMetrics.reduce((sum, m) => sum + m.customersCount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#D4AF37]" />
            Multi-Branch Comparison & Operations
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Compare traffic, revenue, and barber performance across Marjane, Dighomi, and Saburtalo branches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Network Clients:</span>
            <span className="font-mono font-black text-[var(--text-main)] text-sm">{totalNetworkCustomers}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Network Revenue:</span>
            <span className="font-mono font-black text-[#D4AF37] text-sm">₾{totalNetworkRevenue.toFixed(2)} GEL</span>
          </div>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {branchMetrics.map(({ branch, barberCount, customersCount, revenue, avgTicket, topBarber }) => {
          const isCurrent = currentBranch === branch.id;

          return (
            <div
              key={branch.id}
              className={`card-executive p-5 space-y-4 transition-all ${
                isCurrent ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40 bg-[var(--bg-card-hover)]' : 'hover:border-[var(--text-dim)]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[var(--text-main)]">{branch.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border border-[#D4AF37]/40">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-[var(--text-dim)]" />
                    <span>{branch.address}</span>
                  </div>
                </div>

                <span className="badge-status badge-neutral">
                  {barberCount} Chairs
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] text-xs">
                <div>
                  <span className="text-[10px] text-[var(--text-dim)] uppercase font-bold block">Today's Revenue</span>
                  <span className="text-lg font-black text-[#D4AF37] font-mono">
                    ₾{revenue.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-dim)] uppercase font-bold block">Clients Served</span>
                  <span className="text-lg font-black text-[var(--text-main)] font-mono">
                    {customersCount}
                  </span>
                </div>
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-dim)] uppercase font-bold block">Avg Ticket</span>
                  <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 font-mono">
                    ₾{avgTicket.toFixed(1)} GEL
                  </span>
                </div>
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-dim)] uppercase font-bold block">Top Barber</span>
                  <span className="text-xs font-bold text-[var(--text-main)] truncate block">
                    {topBarber.name.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Switch Active Branch Button */}
              <div>
                <button
                  onClick={() => setCurrentBranch(branch.id as BranchId)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border border-[#D4AF37]/50 cursor-default'
                      : 'btn-secondary text-[var(--text-main)]'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Currently Active Branch</span>
                    </>
                  ) : (
                    <>
                      <span>Switch to this Branch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="card-executive p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
            Branch Performance & Traffic Benchmark
          </h3>
          <span className="text-xs text-[var(--text-muted)]">Tbilisi Network</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)]">
            <thead className="text-[10px] uppercase font-bold text-[var(--text-dim)] bg-[var(--bg-subtle)] border-y border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-center">Barbers</th>
                <th className="py-3 px-4 text-center">Clients Today</th>
                <th className="py-3 px-4 text-right">Revenue (GEL)</th>
                <th className="py-3 px-4 text-right">Avg Ticket</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {branchMetrics.map(({ branch, barberCount, customersCount, revenue, avgTicket }) => (
                <tr key={branch.id} className="hover:bg-[var(--bg-card-hover)] transition-all">
                  <td className="py-3.5 px-4 font-bold text-[var(--text-main)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                    {branch.name}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-muted)]">{branch.address}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[var(--text-main)]">{barberCount}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#D4AF37]">{customersCount}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#D4AF37]">₾{revenue.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-500 dark:text-emerald-400">₾{avgTicket.toFixed(1)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setCurrentBranch(branch.id as BranchId)}
                      className="px-2.5 py-1 rounded bg-[var(--bg-subtle)] hover:bg-[#18181B] dark:hover:bg-[#27272A] hover:text-[#D4AF37] text-[11px] font-semibold text-[var(--text-muted)] border border-[var(--border-subtle)] transition-all"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
