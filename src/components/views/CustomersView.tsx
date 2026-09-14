import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { Users, Search, Phone, History, Scissors } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers } = useCash();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const selected = customers.find((c) => c.id === selectedCustomerId) || customers[0];

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
            Client profiles, visit counts, preferred barbers, and lifetime spend history.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[var(--text-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </div>

      {/* 2-Column: Customer List on Left, Profile Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Customer List (5 Cols) */}
        <div className="lg:col-span-5 space-y-2">
          {filtered.map((c) => {
            const isSelected = selectedCustomerId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className={`card-executive p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-[#D4AF37] bg-[var(--bg-card-hover)] shadow-sm' 
                    : 'hover:border-[var(--text-dim)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-main)]">{c.name}</h4>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[var(--text-dim)]" />
                      <span>{c.phone}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-[#D4AF37] text-xs block">
                      ₾{c.totalSpent.toFixed(0)} GEL
                    </span>
                    <span className="text-[10px] text-[var(--text-dim)]">
                      {c.totalVisits} visits
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Customer Profile (7 Cols) */}
        <div className="lg:col-span-7">
          {selected ? (
            <div className="card-executive p-6 space-y-5">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)]">{selected.name}</h3>
                  <div className="text-xs text-[var(--text-muted)] mt-1">{selected.phone}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Total Spending</span>
                  <span className="text-2xl font-black text-[#D4AF37] font-mono">
                    ₾{selected.totalSpent.toFixed(2)} GEL
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Total Visits</span>
                  <span className="text-lg font-black text-[var(--text-main)]">{selected.totalVisits}</span>
                </div>
                <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Preferred Barber</span>
                  <span className="text-xs font-bold text-[var(--text-main)] truncate block">{selected.preferredBarber}</span>
                </div>
                <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Last Visit</span>
                  <span className="text-xs font-bold text-[var(--text-main)] block">{selected.lastVisit}</span>
                </div>
              </div>

              {/* Visit History */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Visit History
                </h4>

                <div className="space-y-1.5">
                  {selected.history.length === 0 ? (
                    <div className="text-xs text-[var(--text-dim)] py-3 text-center">No completed visits recorded yet.</div>
                  ) : (
                    selected.history.map((h, i) => (
                      <div key={i} className="p-2.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-[var(--text-main)]">{h.serviceName}</div>
                          <div className="text-[10px] text-[var(--text-dim)]">
                            {h.date} • Barber: {h.barberName} ({h.type})
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[var(--text-main)]">
                          ₾{h.amount} GEL
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="card-executive p-8 text-center text-xs text-[var(--text-dim)]">
              Select a customer to view profile.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
