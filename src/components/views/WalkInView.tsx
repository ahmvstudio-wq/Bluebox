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
  GraduationCap
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
  const [isStudent, setIsStudent] = useState(false);
  const [studentIdProof, setStudentIdProof] = useState('');
  const [allergies, setAllergies] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState(branchBarbers[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [successToast, setSuccessToast] = useState<{
    customer: string;
    barber: string;
    amount: number;
    method: string;
    isStudent: boolean;
  } | null>(null);

  const activeBarber = branchBarbers.find((b) => b.id === selectedBarberId) || branchBarbers[0];
  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Price calculations
  const originalPrice = activeService?.price || 0;
  const discountAmount = isStudent && originalPrice ? originalPrice * 0.2 : 0;
  const finalPrice = originalPrice ? originalPrice - discountAmount : 0;

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
      source: 'Walk-in',
      isStudent,
      studentIdProof: isStudent ? studentIdProof : undefined,
      allergies: allergies.trim() || 'None',
    });

    setSuccessToast({
      customer: customerName.trim(),
      barber: activeBarber?.name || 'Barber',
      amount: finalPrice,
      method: paymentMethod.toUpperCase(),
      isStudent,
    });

    setCustomerName('');
    setCustomerPhone('');
    setIsStudent(false);
    setStudentIdProof('');
    setAllergies('');

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
            Instant chair-side check-in. Add customer, assign barber, record student discount, complete service, and automatically update revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Walk-ins Today:</span>
            <span className="font-mono font-black text-amber-500 dark:text-amber-400 text-sm">{todayWalkInsCount}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Walk-in Sales:</span>
            <span className="font-mono font-black text-[#D4AF37] text-sm">₾{walkInTotalRevenue.toFixed(2)} GEL</span>
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
                +₾{successToast.amount.toFixed(2)} GEL recorded ({successToast.method}).
                {successToast.isStudent && ' 20% Student Discount applied.'} 50% Barber cut: ₾{(successToast.amount * 0.5).toFixed(2)} GEL credited.
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

              {/* Student Discount Toggle */}
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[var(--text-main)]">
                  <input
                    type="checkbox"
                    checked={isStudent}
                    onChange={(e) => setIsStudent(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                    Student Discount (20% Off: Hair + Beard = 36 GEL)
                  </span>
                </label>

                {isStudent && (
                  <div className="pt-1.5 border-t border-[var(--border-subtle)] space-y-1 animate-in fade-in">
                    <label className="block text-[11px] text-[var(--text-muted)] font-medium">Student ID Proof / Card #</label>
                    <input
                      type="text"
                      placeholder="e.g. TSU-2024-8192 or Iliauni Card"
                      value={studentIdProof}
                      onChange={(e) => setStudentIdProof(e.target.value)}
                      className="w-full py-1 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  Allergies / Special Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. None, or Alcohol sensitivity"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Barber Selector */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5">
                  Select Barber Serving Customer *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map((s) => {
                    const isSelected = selectedServiceId === s.id;
                    const priceDisplay = s.price !== null ? (isStudent ? `₾${s.price - s.price * 0.2}` : `₾${s.price}`) : 'TBD';

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
                          {priceDisplay}
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
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 font-bold transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash</span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 font-bold transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border-[#D4AF37] shadow-sm'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / POS</span>
                  </div>
                </div>
              </div>

              {/* Order Summary & Submit */}
              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-[var(--text-muted)] font-medium">Ticket Total:</span>
                  <span className="font-mono text-xl font-black text-[#D4AF37]">
                    {finalPrice ? `₾${finalPrice.toFixed(2)} GEL` : 'Price TBD'}
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary-gold py-2.5 font-black flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Service & Record Revenue</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right: Completed Walk-in Ledger (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card-executive p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                Completed Walk-Ins Today ({walkInsList.length})
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-500">
                Total: ₾{walkInTotalRevenue.toFixed(2)} GEL
              </span>
            </div>

            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {walkInsList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                  No walk-in clients recorded yet today.
                </div>
              ) : (
                walkInsList.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between hover:border-[var(--border-card)] transition-colors text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[var(--text-main)]">{w.ticketNumber}</span>
                        <span className="font-extrabold text-[var(--text-main)]">{w.customerName}</span>
                        {w.isStudent && (
                          <span className="badge-status badge-gold">Student -20%</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-1">
                        {w.serviceName} • Barber: <strong className="text-[var(--text-main)]">{w.barberName}</strong>
                      </div>
                      {w.allergies && w.allergies !== 'None' && (
                        <div className="text-[10px] text-rose-500 mt-0.5">
                          Allergies: {w.allergies}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-emerald-500 block">
                        +₾{w.price.toFixed(2)} GEL
                      </span>
                      <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono">
                        {w.paymentMethod}
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
