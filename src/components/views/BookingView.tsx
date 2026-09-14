import React, { useState, useMemo } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  CreditCard,
  Banknote,
  CalendarCheck,
  Kanban,
  List,
  Plus,
  X
} from 'lucide-react';

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const BookingView: React.FC = () => {
  const { 
    branchBarbers, 
    services, 
    branchBookings, 
    createBooking, 
    markCustomerArrived, 
    completeService 
  } = useCash();

  // View Mode: Kanban vs Table
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Booking Modal / Drawer State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState(branchBarbers[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeBarber = branchBarbers.find((b) => b.id === selectedBarberId) || branchBarbers[0];

  // Calculate barber availability across today's slots
  const barberAvailability = useMemo(() => {
    const map: Record<string, { booked: boolean; customerName?: string }> = {};
    TIME_SLOTS.forEach((slot) => {
      const existing = branchBookings.find(
        (b) => b.barberId === selectedBarberId && b.time === slot && b.status !== 'completed'
      );
      if (existing) {
        map[slot] = { booked: true, customerName: existing.customerName };
      } else {
        map[slot] = { booked: false };
      }
    });
    return map;
  }, [branchBookings, selectedBarberId]);

  // Kanban Pipeline Categories
  const scheduledList = useMemo(() => branchBookings.filter((b) => b.status === 'scheduled'), [branchBookings]);
  const arrivedList = useMemo(() => branchBookings.filter((b) => b.status === 'arrived'), [branchBookings]);
  const completedList = useMemo(() => branchBookings.filter((b) => b.status === 'completed'), [branchBookings]);

  const scheduledValue = scheduledList.reduce((sum, b) => sum + b.price, 0);
  const arrivedValue = arrivedList.reduce((sum, b) => sum + b.price, 0);
  const completedValue = completedList.reduce((sum, b) => sum + b.price, 0);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter the customer name.');
      return;
    }

    const result = createBooking({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '+995 599 123 456',
      barberId: selectedBarberId,
      serviceId: selectedServiceId,
      time: selectedTime,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Double-booking conflict detected.');
    } else {
      setSuccessMessage(`✓ Appointment booked for ${customerName.trim()} at ${selectedTime}!`);
      setCustomerName('');
      setCustomerPhone('');
      setIsBookingOpen(false);
      setTimeout(() => setSuccessMessage(null), 4500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header with Killer Workflow Engine & View Controls */}
      <div className="card-executive p-5 bg-[var(--bg-card)] border-[var(--border-subtle)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                The Killer Workflow Pipeline
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Interactive Kanban Board: Book Client ➔ Customer Arrives ➔ Complete & Pay ➔ Stats Update.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-[#18181B] text-white dark:bg-[#27272A] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Kanban className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Kanban Board</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#18181B] text-white dark:bg-[#27272A] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>

            {/* Book Appointment CTA */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="btn-primary-gold text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-500 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-[var(--text-main)]">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-[var(--text-main)] text-base">×</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. KANBAN BOARD VIEW (SMOOTH THREE-STAGE PIPELINE) */}
      {/* ========================================================================= */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* COLUMN 1: SCHEDULED / IN QUEUE */}
          <div className="kanban-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#71717A]"></span>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-main)]">
                  1. Scheduled / Queue
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)]">
                  {scheduledList.length}
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)] font-semibold">
                  ₾{scheduledValue}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {scheduledList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                  No clients currently waiting to arrive.
                </div>
              ) : (
                scheduledList.map((item) => (
                  <div key={item.id} className="kanban-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-main)] border border-[var(--border-subtle)]">
                        {item.ticketNumber}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#D4AF37] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-[var(--text-main)]">{item.customerName}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.serviceName}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)]">
                        Barber: <strong className="text-[var(--text-main)]">{item.barberName}</strong>
                      </span>
                      <span className="font-mono font-black text-[var(--text-main)]">
                        ₾{item.price} GEL
                      </span>
                    </div>

                    {/* Step 1 Action: Mark Arrived */}
                    <button
                      onClick={() => markCustomerArrived(item.id)}
                      className="w-full btn-primary-gold text-xs py-1.5 flex items-center justify-center gap-1.5 mt-1"
                    >
                      <span>Mark Customer Arrived</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: IN CHAIR / IN SERVICE */}
          <div className="kanban-col space-y-3 bg-[var(--bg-subtle)] border-amber-500/30">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  2. In Chair / In Service
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[var(--bg-card)] border border-amber-500/40 text-amber-600 dark:text-amber-400">
                  {arrivedList.length}
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)] font-semibold">
                  ₾{arrivedValue}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {arrivedList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                  No clients currently in chair. Mark a scheduled client as arrived to begin service!
                </div>
              ) : (
                arrivedList.map((item) => (
                  <div key={item.id} className="kanban-card p-4 space-y-3 border-amber-500/40 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {item.ticketNumber}
                      </span>
                      <span className="badge-status badge-amber animate-pulse">
                        ● In Chair
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-[var(--text-main)]">{item.customerName}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.serviceName}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)]">
                        Barber: <strong className="text-[var(--text-main)]">{item.barberName}</strong>
                      </span>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                        ₾{item.price} GEL
                      </span>
                    </div>

                    {/* Step 2 Action: Complete & Pay */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => completeService(item.id, 'cash')}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Paid Cash</span>
                      </button>
                      <button
                        onClick={() => completeService(item.id, 'card')}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#18181B] dark:bg-[#27272A] border border-[#D4AF37] text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all hover:bg-[#27272A]"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Paid Card</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: FINISHED & RECORDED */}
          <div className="kanban-col space-y-3 bg-[var(--bg-subtle)] border-emerald-500/30">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  3. Completed / Paid
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[var(--bg-card)] border border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  {completedList.length}
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ₾{completedValue}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {completedList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                  No cuts completed yet.
                </div>
              ) : (
                completedList.map((item) => (
                  <div key={item.id} className="kanban-card p-4 space-y-2.5 border-emerald-500/20 opacity-95">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-main)] border border-[var(--border-subtle)]">
                        {item.ticketNumber}
                      </span>
                      <span className="badge-status badge-gold">
                        ✓ {item.paymentMethod?.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[var(--text-main)]">{item.customerName}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.serviceName}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)]">
                        Barber: <strong className="text-[var(--text-main)]">{item.barberName}</strong>
                      </span>
                      <span className="font-mono font-black text-[var(--text-main)]">
                        ₾{item.price} GEL
                      </span>
                    </div>

                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Revenue & stats live synced</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TABLE / SCHEDULE VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="card-executive p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              Schedule & Today's Appointments
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {branchBookings.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-main)]">
              <thead className="text-[10px] uppercase font-bold text-[var(--text-dim)] bg-[var(--bg-subtle)] border-y border-[var(--border-subtle)]">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Barber</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {branchBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[var(--bg-card-hover)] transition-all">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--text-main)]">{b.ticketNumber}</td>
                    <td className="py-3 px-4 font-bold text-[var(--text-main)]">{b.customerName}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">{b.serviceName}</td>
                    <td className="py-3 px-4 text-[var(--text-main)] font-semibold">{b.barberName}</td>
                    <td className="py-3 px-4 font-mono text-[#D4AF37] font-bold">{b.time}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-[var(--text-main)]">₾{b.price}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge-status ${
                        b.status === 'completed' ? 'badge-gold' : b.status === 'arrived' ? 'badge-amber' : 'badge-neutral'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.status === 'scheduled' && (
                        <button
                          onClick={() => markCustomerArrived(b.id)}
                          className="btn-primary-gold text-[11px] py-1 px-2.5"
                        >
                          Arrived
                        </button>
                      )}
                      {b.status === 'arrived' && (
                        <button
                          onClick={() => completeService(b.id, 'cash')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                        >
                          Complete
                        </button>
                      )}
                      {b.status === 'completed' && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: BOOK NEW APPOINTMENT */}
      {/* ========================================================================= */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card-executive w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-extrabold text-base text-[var(--text-main)]">Book New Customer</h3>
              </div>
              <button 
                onClick={() => setIsBookingOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/40 rounded-xl text-xs text-rose-500 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Kipiani"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full font-medium"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+995 599 123 456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Select Barber *</label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full font-semibold"
                >
                  {branchBarbers.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">Select Service *</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full font-semibold"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — ₾{s.price} GEL ({s.duration} min)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5 flex items-center justify-between">
                  <span>Select Time Slot *</span>
                  <span className="text-[10px] text-[#D4AF37]">Based on {activeBarber?.name}'s availability</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = barberAvailability[slot]?.booked;
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 text-center rounded-lg font-mono text-xs font-bold transition-all ${
                          isBooked
                            ? 'bg-rose-950/20 text-rose-500/40 border border-rose-900/30 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[#D4AF37] shadow-sm'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-[#D4AF37]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button type="button" onClick={() => setIsBookingOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-gold">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
