import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  Footprints, 
  User, 
  Scissors, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  Clock, 
  Sparkles
} from 'lucide-react';

export const WalkInView: React.FC = () => {
  const { 
    branchBarbers, 
    services, 
    branchBookings, 
    addWalkIn, 
    todayWalkInsCount 
  } = useCash();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState(branchBarbers[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [successToast, setSuccessToast] = useState<{
    customer: string;
    barber: string;
    amount: number;
    method: string;
  } | null>(null);

  const activeBarber = branchBarbers.find((b) => b.id === selectedBarberId) || branchBarbers[0];
  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Filter only walk-ins for today
  const walkInsList = branchBookings.filter((b) => b.type === 'walk-in');
  const walkInTotalRevenue = walkInsList.reduce((sum, b) => sum + b.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    addWalkIn({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      barberId: selectedBarberId,
      serviceId: selectedServiceId,
      paymentMethod,
    });

    setSuccessToast({
      customer: customerName.trim(),
      barber: activeBarber?.name || 'Barber',
      amount: activeService?.price || 0,
      method: paymentMethod.toUpperCase(),
    });

    setCustomerName('');
    setCustomerPhone('');

    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Footprints className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            Walk-in Express Register
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Instant chair-side check-in. Add customer, assign barber, complete service, and automatically update client count and revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Walk-ins Today:</span>
            <span className="font-mono font-black text-amber-500 dark:text-amber-400 text-sm">{todayWalkInsCount}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Walk-in Sales:</span>
            <span className="font-mono font-black text-[#D4AF37] text-sm">₾{walkInTotalRevenue} GEL</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-500 flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span className="font-bold text-[var(--text-main)]">{successToast.customer}</span>'s walk-in service completed by{' '}
              <span className="font-bold text-[var(--text-main)]">{successToast.barber}</span>!
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                +₾{successToast.amount} GEL recorded ({successToast.method}). Barber client count & dashboard metrics automatically incremented.
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 font-mono font-bold text-emerald-500 border border-emerald-500/30">
            Live Synced
          </span>
        </div>
      )}

      {/* 2-Column Grid: Left = Fast Checkout, Right = Completed Walk-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Walk-In Form (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card-executive p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#D4AF37]" />
                Serve Walk-In Client Now
              </h3>
              <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                1-Click Complete
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">
                    Customer Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[var(--text-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Giorgi Beridze"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-8 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">
                    Customer Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+995 5xx xxx xxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Barber Selector */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5">
                  Select Barber Serving Customer *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {branchBarbers.map((b) => {
                    const isSelected = selectedBarberId === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBarberId(b.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-[#18181B] text-white dark:bg-[#27272A] border-[#D4AF37] shadow-sm'
                            : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-dim)]'
                        }`}
                      >
                        <img
                          src={b.avatar}
                          alt={b.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <div className={`font-bold truncate ${isSelected ? 'text-white' : 'text-[var(--text-main)]'}`}>
                            {b.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-dim)] truncate">
                            {b.specialty}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Selector */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5">
                  Select Service *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((s) => {
                    const isSelected = selectedServiceId === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedServiceId(s.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#18181B] text-white dark:bg-[#27272A] border-[#D4AF37] shadow-sm'
                            : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-dim)]'
                        }`}
                      >
                        <div>
                          <div className={`font-bold ${isSelected ? 'text-white' : 'text-[var(--text-main)]'}`}>
                            {s.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-dim)]">
                            {s.duration} mins
                          </div>
                        </div>
                        <span className="font-mono font-extrabold text-sm text-[#D4AF37]">
                          ₾{s.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-[#18181B] dark:bg-[#27272A] border-[#D4AF37] text-[#D4AF37] shadow-sm'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / POS</span>
                  </button>
                </div>
              </div>

              {/* Summary & Submit */}
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="submit"
                  className="w-full btn-primary-gold py-3 text-sm font-black flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Service & Collect ₾{activeService?.price} GEL</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right: Today's Walk-in Activity Log (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card-executive p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                Today's Walk-In Clients Served
              </h3>
              <span className="text-xs font-mono font-bold text-[#D4AF37]">
                {walkInsList.length} completed
              </span>
            </div>

            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {walkInsList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-dim)]">
                  No walk-ins served yet today. Fill the quick form on the left to check in a client.
                </div>
              ) : (
                walkInsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs hover:border-[var(--text-dim)] transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-main)] text-sm">{item.customerName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[var(--bg-card)] font-mono text-[10px] text-[var(--text-dim)] border border-[var(--border-subtle)]">
                          {item.ticketNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {item.serviceName} • Barber:{' '}
                        <span className="text-[var(--text-main)] font-semibold">{item.barberName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-[var(--text-main)] font-mono block">
                        ₾{item.price} GEL
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          item.paymentMethod === 'cash'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                        }`}
                      >
                        {item.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
