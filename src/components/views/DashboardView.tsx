import React from 'react';
import { useCash } from '../../context/CashContext';
import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  Scissors, 
  Footprints, 
  DollarSign, 
  ArrowUpRight 
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    todayCustomers,
    todayRevenue,
    todayBookingsCount,
    todayWalkInsCount,
    barberPerformanceList,
  } = useCash();

  return (
    <div className="space-y-6">
      
      {/* 1. Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Revenue */}
        <div className="card-executive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Today's Revenue</span>
            <span className="badge-status badge-gold">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[var(--text-main)] font-mono">₾{todayRevenue.toFixed(2)}</span>
            <span className="text-xs font-bold text-[#D4AF37]">GEL</span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2">
            Recorded from completed haircuts & services
          </div>
        </div>

        {/* Today's Customers */}
        <div className="card-executive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Today's Customers</span>
            <span className="badge-status badge-neutral">
              <Users className="w-3 h-3" /> Served
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-main)] font-mono">{todayCustomers}</span>
            <span className="text-xs text-[var(--text-dim)]">completed visits</span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2">
            Across all active branch chairs
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="card-executive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Today's Bookings</span>
            <span className="badge-status badge-neutral">
              <CalendarCheck className="w-3 h-3" /> Scheduled
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-main)] font-mono">{todayBookingsCount}</span>
            <span className="text-xs text-[var(--text-dim)]">appointments</span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2">
            Booked in advance via calendar
          </div>
        </div>

        {/* Walk-ins vs Bookings */}
        <div className="card-executive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Walk-ins vs Bookings</span>
            <span className="badge-status badge-amber">
              Ratio
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-amber-500 dark:text-amber-400 font-mono">{todayWalkInsCount}</span>
              <span className="text-[10px] text-[var(--text-dim)] block">Walk-ins</span>
            </div>
            <div className="h-8 w-px bg-[var(--border-subtle)]"></div>
            <div>
              <span className="text-2xl font-black text-[var(--text-main)] font-mono">{todayBookingsCount}</span>
              <span className="text-[10px] text-[var(--text-dim)] block">Booked</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] pt-2">
            Total traffic: {todayWalkInsCount + todayBookingsCount} clients
          </div>
        </div>

      </div>

      {/* 2. Revenue by Barber & Clients by Barber Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Clients by Barber */}
        <div className="card-executive p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              Clients Served by Barber
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {todayCustomers} Total
            </span>
          </div>

          <div className="space-y-2.5">
            {barberPerformanceList.map((stat) => (
              <div
                key={stat.barber.id}
                className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={stat.barber.avatar}
                    alt={stat.barber.name}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div>
                    <div className="font-bold text-[var(--text-main)]">{stat.barber.name}</div>
                    <div className="text-[11px] text-[var(--text-dim)]">{stat.barber.specialty}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-[#D4AF37] font-mono">
                    {stat.clientsServedToday}
                  </span>
                  <span className="text-[11px] text-[var(--text-dim)] block">clients today</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Barber */}
        <div className="card-executive p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#D4AF37]" />
              Revenue Generated by Barber
            </h3>
            <span className="text-xs font-mono font-bold text-[#D4AF37]">
              ₾{todayRevenue.toFixed(2)} GEL
            </span>
          </div>

          <div className="space-y-2.5">
            {barberPerformanceList.map((stat) => (
              <div
                key={stat.barber.id}
                className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={stat.barber.avatar}
                    alt={stat.barber.name}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div>
                    <div className="font-bold text-[var(--text-main)]">{stat.barber.name}</div>
                    <div className="text-[11px] text-[var(--text-dim)]">
                      Commission: ₾{stat.barberEarnings.toFixed(2)} GEL
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-[var(--text-main)] font-mono">
                    ₾{stat.revenueGenerated.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-[var(--text-dim)] block">service sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
