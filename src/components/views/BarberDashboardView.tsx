import React, { useState, useMemo } from 'react';
import { useCash } from '../../context/CashContext';
import { 
  Users, 
  Scissors, 
  Wallet, 
  CalendarCheck, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Banknote, 
  CreditCard, 
  History, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  Footprints,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const BarberDashboardView: React.FC = () => {
  const { 
    currentBarber, 
    services, 
    logout,
    loginAsAdmin,
    myAppointments, 
    myClientsToday, 
    myServicesCompletedToday, 
    myTodayEarnings, 
    myMonthEarnings, 
    myWithdrawals, 
    myTotalWithdrawn, 
    myRemainingBalance,
    markCustomerArrived,
    completeService,
    addWalkIn,
    createBooking
  } = useCash();

  const [activeTab, setActiveTab] = useState<'appointments' | 'history' | 'withdrawals'>('appointments');

  // Modal States for Barber to Create New Entries
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Walk-In Form State
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState(services[0]?.id || 's1');
  const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<'cash' | 'card'>('cash');

  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingServiceId, setBookingServiceId] = useState(services[0]?.id || 's1');
  const [bookingTime, setBookingTime] = useState('15:00');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedWalkInService = services.find((s) => s.id === walkInServiceId) || services[0];
  const selectedBookingService = services.find((s) => s.id === bookingServiceId) || services[0];

  // Calculate this barber's availability for slot picker
  const slotAvailability = useMemo(() => {
    const map: Record<string, boolean> = {};
    TIME_SLOTS.forEach((slot) => {
      const isBooked = myAppointments.some(
        (a) => a.time === slot && a.status !== 'completed'
      );
      map[slot] = !isBooked;
    });
    return map;
  }, [myAppointments]);

  if (!currentBarber) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        No barber profile detected. Please log in again.
      </div>
    );
  }

  // Filter appointments
  const upcomingAppointments = myAppointments.filter((a) => a.status !== 'completed');
  const completedHistory = myAppointments.filter((a) => a.status === 'completed');

  // 1. Handle Barber Adding a Walk-In Customer
  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    addWalkIn({
      customerName: walkInName.trim(),
      customerPhone: walkInPhone.trim() || undefined,
      barberId: currentBarber.id,
      serviceId: walkInServiceId,
      paymentMethod: walkInPaymentMethod,
    });

    const earned = selectedWalkInService.price * currentBarber.commissionRate;
    setToastMessage(`✓ Walk-in completed for ${walkInName.trim()}! +₾${earned.toFixed(2)} GEL added to your earnings.`);
    setWalkInName('');
    setWalkInPhone('');
    setIsWalkInModalOpen(false);

    setTimeout(() => setToastMessage(null), 4500);
  };

  // 2. Handle Barber Booking an Appointment for Their Chair
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!bookingName.trim()) {
      setBookingError('Please enter the customer name.');
      return;
    }

    const result = createBooking({
      customerName: bookingName.trim(),
      customerPhone: bookingPhone.trim() || '+995 5xx xxx xxx',
      barberId: currentBarber.id,
      serviceId: bookingServiceId,
      time: bookingTime,
    });

    if (!result.success) {
      setBookingError(result.error || 'This slot is already booked.');
    } else {
      setToastMessage(`✓ Appointment booked for ${bookingName.trim()} at ${bookingTime}!`);
      setBookingName('');
      setBookingPhone('');
      setIsBookingModalOpen(false);
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Barber Personal Welcome Banner with Action Buttons */}
      <div className="card-executive p-5 bg-[var(--bg-card)] border-[var(--border-subtle)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentBarber.avatar}
            alt={currentBarber.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[var(--text-main)]">{currentBarber.name}</h2>
              <span className="badge-status badge-gold">
                50% Commission
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {currentBarber.specialty} • Branch: <span className="text-[var(--text-main)] font-semibold uppercase">{currentBarber.branchId}</span>
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Private Chair View • Restricted to Your Own Records</span>
            </div>
          </div>
        </div>

        {/* Action Controls: New Entry Buttons + Demo Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Walk-in Button */}
          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="btn-primary-gold text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-md"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>+ Log Walk-In Client</span>
          </button>

          {/* 2. Book Chair Button */}
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#18181B] dark:bg-[#27272A] hover:bg-[#27272A] text-white text-xs font-bold flex items-center gap-1.5 shadow-md border border-[var(--border-card)] transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>+ Book My Chair</span>
          </button>

          {/* Switch to Admin for Demo */}
          <button
            onClick={loginAsAdmin}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Switch to Admin view for demo"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Admin View</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-muted)] text-xs font-bold transition-all border border-[var(--border-subtle)]"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-500 flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-[var(--text-main)]">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 hover:text-[var(--text-main)] text-base">×</button>
        </div>
      )}

      {/* 6 Core Personal Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* 1. Clients Served Today */}
        <div className="card-executive p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Clients Today
          </span>
          <div className="mt-2 text-2xl font-black text-[var(--text-main)] font-mono">
            {myClientsToday}
          </div>
          <span className="text-[10px] text-[var(--text-dim)] block mt-1">served today</span>
        </div>

        {/* 2. Services Completed Today */}
        <div className="card-executive p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Services Done
          </span>
          <div className="mt-2 text-2xl font-black text-[#D4AF37] font-mono">
            {myServicesCompletedToday}
          </div>
          <span className="text-[10px] text-[var(--text-dim)] block mt-1">cuts / trims</span>
        </div>

        {/* 3. Today's Earnings */}
        <div className="card-executive p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Today's Earnings
          </span>
          <div className="mt-2 text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono">
            ₾{myTodayEarnings.toFixed(0)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold block mt-1">GEL (50% cut)</span>
        </div>

        {/* 4. This Month's Earnings */}
        <div className="card-executive p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Month's Earnings
          </span>
          <div className="mt-2 text-2xl font-black text-[var(--text-main)] font-mono">
            ₾{myMonthEarnings.toFixed(0)}
          </div>
          <span className="text-[10px] text-[var(--text-dim)] block mt-1">accumulated</span>
        </div>

        {/* 5. Amount Received / Withdrawn */}
        <div className="card-executive p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Withdrawn / Adv.
          </span>
          <div className="mt-2 text-2xl font-black text-amber-500 dark:text-amber-400 font-mono">
            ₾{myTotalWithdrawn.toFixed(0)}
          </div>
          <span className="text-[10px] text-amber-500 font-semibold block mt-1">received cash</span>
        </div>

        {/* 6. Remaining Balance Owed */}
        <div className="card-executive p-4 border-[#D4AF37]/50 bg-[var(--bg-card-hover)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block">
            Remaining Balance
          </span>
          <div className="mt-2 text-2xl font-black text-[#D4AF37] font-mono">
            ₾{myRemainingBalance.toFixed(0)}
          </div>
          <span className="text-[10px] text-[#D4AF37]/80 block mt-1">owed to you</span>
        </div>

      </div>

      {/* Navigation Tabs for Barber's Workspace */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>My Upcoming Bookings ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <History className="w-4 h-4 text-[#D4AF37]" />
          <span>My Completed History ({completedHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'withdrawals'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-amber-500" />
          <span>My Cash Advances ({myWithdrawals.length})</span>
        </button>
      </div>

      {/* TAB 1: My Upcoming Appointments & Chair Execution */}
      {activeTab === 'appointments' && (
        <div className="space-y-3">
          {upcomingAppointments.length === 0 ? (
            <div className="card-executive p-8 text-center text-xs text-[var(--text-dim)] space-y-2">
              <p>No pending appointments right now.</p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsWalkInModalOpen(true)}
                  className="btn-primary-gold text-xs py-1.5 px-3"
                >
                  + Log Walk-In Client Now
                </button>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  + Book an Appointment
                </button>
              </div>
            </div>
          ) : (
            upcomingAppointments.map((apt) => {
              const isScheduled = apt.status === 'scheduled';
              const isArrived = apt.status === 'arrived';

              return (
                <div
                  key={apt.id}
                  className={`card-executive p-4.5 space-y-3 transition-all ${
                    isArrived ? 'border-amber-500/50 bg-[var(--bg-card-hover)]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] font-mono text-xs font-bold text-[var(--text-main)] border border-[var(--border-subtle)]">
                        {apt.ticketNumber}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#D4AF37] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.time}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                        {apt.type}
                      </span>
                    </div>

                    {isScheduled && (
                      <span className="badge-status badge-neutral">
                        Awaiting Customer Arrival
                      </span>
                    )}
                    {isArrived && (
                      <span className="badge-status badge-amber animate-pulse">
                        ● In Chair / Arrived
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between border-t border-[var(--border-subtle)] pt-2.5">
                    <div>
                      <h4 className="font-bold text-base text-[var(--text-main)]">{apt.customerName}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{apt.serviceName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-[var(--text-main)] font-mono block">
                        ₾{apt.price} GEL
                      </span>
                      <span className="text-[11px] font-bold text-emerald-500 dark:text-emerald-400">
                        Your 50%: ₾{(apt.price * 0.5).toFixed(1)} GEL
                      </span>
                    </div>
                  </div>

                  {/* Direct Chair Action Stepper */}
                  <div className="pt-2 border-t border-[var(--border-subtle)]">
                    {isScheduled && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-muted)]">Customer arrived at your chair?</span>
                        <button
                          onClick={() => markCustomerArrived(apt.id)}
                          className="btn-primary-gold text-xs py-1.5 px-3"
                        >
                          Mark Arrived
                        </button>
                      </div>
                    )}

                    {isArrived && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                        <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">
                          Haircut finished? Record payment:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => completeService(apt.id, 'cash')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Cash (₾{apt.price})</span>
                          </button>
                          <button
                            onClick={() => completeService(apt.id, 'card')}
                            className="px-3 py-1.5 rounded-lg bg-[#18181B] dark:bg-[#27272A] border border-[#D4AF37] text-[#D4AF37] font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Card (₾{apt.price})</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Completed Service History */}
      {activeTab === 'history' && (
        <div className="card-executive p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#D4AF37]" />
              My Completed Cuts & Earned Commissions
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400">
              Total Today: ₾{myTodayEarnings.toFixed(2)} GEL
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {completedHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-dim)]">
                No completed services logged today yet.
              </div>
            ) : (
              completedHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--text-main)] text-sm">{item.customerName}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {item.serviceName} • {item.time} ({item.paymentMethod?.toUpperCase()})
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-[var(--text-main)] text-xs block">
                      Ticket: ₾{item.price} GEL
                    </span>
                    <span className="font-mono font-black text-emerald-500 dark:text-emerald-400 text-sm">
                      +₾{(item.price * 0.5).toFixed(2)} GEL
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: My Cash Advances */}
      {activeTab === 'withdrawals' && (
        <div className="card-executive p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-amber-500" />
              Cash Advances Disbursed by Management
            </h3>
            <span className="text-xs font-mono font-bold text-amber-500">
              Total: -₾{myTotalWithdrawn.toFixed(2)} GEL
            </span>
          </div>

          <div className="space-y-2">
            {myWithdrawals.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-dim)]">
                No cash advances disbursed this month.
              </div>
            ) : (
              myWithdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--text-main)]">{w.reason}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{w.date}</div>
                  </div>

                  <span className="font-mono font-black text-rose-500 dark:text-rose-400 text-sm">
                    -₾{w.amount.toFixed(2)} GEL
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL: BARBER LOGGING A WALK-IN CLIENT (FAST CHAIR-SIDE CHECKOUT) */}
      {/* ========================================================================= */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card-executive w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <h3 className="font-bold text-base text-[var(--text-main)]">Log Walk-In to My Chair</h3>
              </div>
              <button 
                onClick={() => setIsWalkInModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
              {/* Customer Name */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Giorgi Lomidze"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full font-medium"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  Customer Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+995 5xx xxx xxx"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5">
                  Select Service Provided *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((s) => {
                    const isSelected = walkInServiceId === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setWalkInServiceId(s.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#18181B] text-white dark:bg-[#27272A] border-[#D4AF37]'
                            : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-dim)]'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className={`font-bold truncate ${isSelected ? 'text-white' : 'text-[var(--text-main)]'}`}>
                            {s.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-dim)]">{s.duration} mins</div>
                        </div>
                        <span className="font-mono font-bold text-sm text-[#D4AF37] shrink-0">
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
                  Payment Method Collected *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkInPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      walkInPaymentMethod === 'cash'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWalkInPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      walkInPaymentMethod === 'card'
                        ? 'bg-[#18181B] dark:bg-[#27272A] border-[#D4AF37] text-[#D4AF37] shadow-sm'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / POS</span>
                  </button>
                </div>
              </div>

              {/* Payout Breakdown Pill */}
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[var(--text-dim)] block font-bold">Ticket Total</span>
                  <span className="text-base font-black text-[var(--text-main)] font-mono">₾{selectedWalkInService.price} GEL</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-[var(--text-dim)] block font-bold">Your 50% Share</span>
                  <span className="text-base font-black text-emerald-500 dark:text-emerald-400 font-mono">
                    +₾{(selectedWalkInService.price * 0.5).toFixed(2)} GEL
                  </span>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                >
                  Complete Cut & Add to My Stats
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL: BARBER BOOKING AN APPOINTMENT FOR THEIR OWN CHAIR */}
      {/* ========================================================================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card-executive w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-base text-[var(--text-main)]">Book Appointment for My Chair</h3>
              </div>
              <button 
                onClick={() => setIsBookingModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/40 rounded-xl text-xs text-rose-500 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              {/* Customer Name */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nika Chkheidze"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  className="w-full font-medium"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">
                  Customer Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+995 599 xxx xxx"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5">
                  Select Service *
                </label>
                <select
                  value={bookingServiceId}
                  onChange={(e) => setBookingServiceId(e.target.value)}
                  className="w-full font-semibold"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ₾{s.price} GEL ({s.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5 flex items-center justify-between">
                  <span>Select Time Slot *</span>
                  <span className="text-[10px] text-[#D4AF37]">Based on your schedule</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map((slot) => {
                    const isAvailable = slotAvailability[slot];
                    const isSelected = bookingTime === slot;

                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={!isAvailable}
                        onClick={() => setBookingTime(slot)}
                        className={`py-2 text-center rounded-lg font-mono text-xs font-bold transition-all ${
                          !isAvailable
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

              {/* Submit / Cancel */}
              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                >
                  Confirm Booking for {bookingTime}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
