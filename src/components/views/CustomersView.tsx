import React, { useState, useMemo } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  Users, 
  Search, 
  Phone, 
  History, 
  GraduationCap, 
  ShieldAlert, 
  TrendingUp, 
  Calendar,
  X,
  UserCheck,
  CheckCircle2,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Customer } from '../../types';

export const CustomersView: React.FC = () => {
  const { customers } = useCash();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'students' | 'allergies' | 'vip'>('all');
  const [activeModalCustomer, setActiveModalCustomer] = useState<Customer | null>(null);

  // Computed Top Stats
  const totalCustomers = customers.length;
  const studentCount = useMemo(() => customers.filter((c) => c.isStudent).length, [customers]);
  const allergyCount = useMemo(() => customers.filter((c) => c.allergies && c.allergies !== 'None').length, [customers]);
  const totalLTV = useMemo(() => customers.reduce((sum, c) => sum + c.totalSpent, 0), [customers]);
  const avgSpend = totalCustomers > 0 ? totalLTV / totalCustomers : 0;

  // Filtered & Searched List
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.studentIdProof && c.studentIdProof.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.allergies && c.allergies.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === 'students') return c.isStudent;
      if (activeFilter === 'allergies') return c.allergies && c.allergies !== 'None';
      if (activeFilter === 'vip') return c.totalSpent >= 90;
      return true;
    });
  }, [customers, searchQuery, activeFilter]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            Customer Directory & Profiles
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Comprehensive client records with Student ID proof (20% discount), allergy tracking, and lifetime visit ledgers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px] sm:w-72">
          <Search className="w-3.5 h-3.5 text-[var(--text-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 text-xs py-2"
          />
        </div>
      </div>

      {/* 1. Top Customer Directory Stats (As Requested in Meeting) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Total Customers */}
        <div className="card-executive p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Registered Clients
            </span>
            <span className="badge-status badge-neutral text-[9px] sm:text-[10px] px-1.5 py-0.5">Total</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-mono">{totalCustomers}</span>
            <span className="text-[10px] sm:text-xs text-[var(--text-dim)]">in database</span>
          </div>
        </div>

        {/* Active Students */}
        <div className="card-executive p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Students (20% Off)
            </span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-1.5 py-0.5">Verified</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#D4AF37] font-mono">{studentCount}</span>
            <span className="text-[10px] sm:text-xs text-[var(--text-dim)]">students</span>
          </div>
        </div>

        {/* Average Spend */}
        <div className="card-executive p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Avg Client Value
            </span>
            <span className="badge-status badge-gold text-[9px] sm:text-[10px] px-1.5 py-0.5">LTV</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">₾{avgSpend.toFixed(1)}</span>
            <span className="text-[10px] sm:text-xs text-emerald-500 font-bold">GEL</span>
          </div>
        </div>

        {/* Allergy & Sensitivity Alerts */}
        <div className="card-executive p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Allergy Warnings
            </span>
            <span className="badge-status badge-red text-[9px] sm:text-[10px] px-1.5 py-0.5">Alerts</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-rose-500 font-mono">{allergyCount}</span>
            <span className="text-[10px] sm:text-xs text-rose-500 font-medium">flagged</span>
          </div>
        </div>

      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-[#18181B] dark:bg-[#27272A] text-white border border-[var(--border-card)] shadow-xs'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
          }`}
        >
          All Clients ({totalCustomers})
        </button>

        <button
          onClick={() => setActiveFilter('students')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'students'
              ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Student Discount ({studentCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('vip')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'vip'
              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 shadow-xs'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>Top Spenders (90+ GEL)</span>
        </button>

        <button
          onClick={() => setActiveFilter('allergies')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'allergies'
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-xs'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>Has Allergy Flag ({allergyCount})</span>
        </button>
      </div>

      {/* 3. Customer List / Table View */}
      <div className="card-executive overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider bg-[var(--bg-subtle)]/50">
                <th className="py-3 px-4 font-bold">Client Name</th>
                <th className="py-3 px-3 font-bold">Phone Number</th>
                <th className="py-3 px-3 font-bold">Student Status</th>
                <th className="py-3 px-3 font-bold">Preferred Barber</th>
                <th className="py-3 px-3 font-bold text-center">Visits</th>
                <th className="py-3 px-3 font-bold">Lifetime Spend</th>
                <th className="py-3 px-3 font-bold">Allergies</th>
                <th className="py-3 px-4 font-bold text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[var(--text-dim)]">
                    No customers match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setActiveModalCustomer(c)}
                    className="hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-xs text-[var(--text-main)] shrink-0 group-hover:border-[#D4AF37]">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-[var(--text-main)] group-hover:text-[#D4AF37] transition-colors block">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-dim)] block sm:hidden font-mono">
                            {c.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[var(--text-muted)]">
                      {c.phone}
                    </td>

                    <td className="py-3 px-3">
                      {c.isStudent ? (
                        <span className="badge-status badge-gold flex items-center gap-1 text-[10px] w-fit">
                          <GraduationCap className="w-3 h-3" /> 20% Off
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-dim)]">Regular</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[var(--text-main)] font-medium">
                      {c.preferredBarber || 'Any Barber'}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-[var(--text-main)]">
                      {c.totalVisits}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-[#D4AF37]">
                      ₾{c.totalSpent.toFixed(2)}
                    </td>

                    <td className="py-3 px-3">
                      {c.allergies && c.allergies !== 'None' ? (
                        <span className="badge-status badge-red text-[10px] flex items-center gap-1 w-fit">
                          <ShieldAlert className="w-3 h-3" /> {c.allergies}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-dim)]">None</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalCustomer(c);
                        }}
                        className="btn-secondary text-[11px] py-1 px-2.5 font-bold group-hover:border-[#D4AF37] group-hover:text-[#D4AF37]"
                      >
                        <span>Dossier</span>
                        <ArrowRight className="w-3 h-3 inline ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Customer Profile Dossier Modal (Opens when row/button clicked) */}
      {activeModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] border border-[#D4AF37] flex items-center justify-center font-extrabold text-sm text-[#D4AF37]">
                  {activeModalCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[var(--text-main)]">
                      {activeModalCustomer.name}
                    </h3>
                    {activeModalCustomer.isStudent && (
                      <span className="badge-status badge-gold text-[10px] flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> Student (20% Off)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-[var(--text-dim)]" />
                    <span>{activeModalCustomer.phone}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModalCustomer(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Allergy Dossier Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Student Proof */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[var(--text-dim)] flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-[#D4AF37]" />
                  Student Verification
                </div>
                <div className="font-extrabold text-[var(--text-main)] text-sm">
                  {activeModalCustomer.isStudent ? 'Active (20% Discount)' : 'Regular Client'}
                </div>
                {activeModalCustomer.studentIdProof && (
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Proof ID: <span className="font-mono font-semibold text-[var(--text-main)]">{activeModalCustomer.studentIdProof}</span>
                  </div>
                )}
              </div>

              {/* Allergies Box */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[var(--text-dim)] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-500" />
                  Allergies & Sensitivities
                </div>
                <div className={`font-bold text-sm ${activeModalCustomer.allergies !== 'None' ? 'text-rose-500 dark:text-rose-400' : 'text-[var(--text-main)]'}`}>
                  {activeModalCustomer.allergies || 'None'}
                </div>
                <div className="text-[10px] text-[var(--text-dim)]">
                  Check skin sensitivity before alcohol aftershave
                </div>
              </div>

            </div>

            {/* Lifetime Performance Numbers */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Total Spend</span>
                <span className="text-base font-black text-[#D4AF37] font-mono">₾{activeModalCustomer.totalSpent.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Completed Visits</span>
                <span className="text-base font-black text-[var(--text-main)] font-mono">{activeModalCustomer.totalVisits}</span>
              </div>
              <div className="p-2.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block">Preferred Barber</span>
                <span className="text-xs font-bold text-[var(--text-main)] truncate block">{activeModalCustomer.preferredBarber || 'N/A'}</span>
              </div>
            </div>

            {/* Visit History Log */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#D4AF37]" />
                Completed Service Ledger ({activeModalCustomer.history.length})
              </h4>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {activeModalCustomer.history.length === 0 ? (
                  <div className="text-xs text-[var(--text-dim)] py-3 text-center">No visits logged yet.</div>
                ) : (
                  activeModalCustomer.history.map((h, i) => (
                    <div key={i} className="p-2.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[var(--text-main)]">{h.serviceName}</div>
                        <div className="text-[10px] text-[var(--text-dim)]">
                          {h.date} • {h.barberName} ({h.type})
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-[var(--text-main)] block">
                          ₾{h.amount.toFixed(2)} GEL
                        </span>
                        {h.paymentMethod && (
                          <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono">
                            {h.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Close Action */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalCustomer(null)}
                className="btn-secondary text-xs py-1.5 px-4 font-bold"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
