import React, { useState, useMemo } from 'react';
import { useCash } from '../../context/CashContext';
import { STUDENT_DISCOUNT_RATE, STUDENT_DISCOUNT_PERCENT, DEFAULT_COMMISSION_RATE, calcStudentDiscount, calcNetPrice, formatAmount } from '../../constants';
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
  Footprints,
  Calendar,
  AlertCircle,
  X,
  User,
  Eye,
  EyeOff,
  Lock,
  Building2,
  MapPin,
  GraduationCap,
  XCircle,
  TrendingUp,
  Percent,
  Sparkles
} from 'lucide-react';

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const BarberDashboardView: React.FC = () => {
  const { 
    currentBarber, 
    services, 
    branches,
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
    updateBookingStatus,
    cancelBooking,
    addWalkIn,
    createBooking,
    t
  } = useCash();

  const [activeTab, setActiveTab] = useState<'appointments' | 'history' | 'payroll' | 'profile' | 'cancelled'>('appointments');
  const [showPin, setShowPin] = useState(false);

  // Modal States for Barber to Create New Entries (Walk-in & Booking)
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Walk-In Form State (with Student Discount)
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState(services[0]?.id || 's1');
  const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [walkInIsStudent, setWalkInIsStudent] = useState(false);
  const [walkInStudentIdProof, setWalkInStudentIdProof] = useState('');

  // Booking Form State (with Student Discount)
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingServiceId, setBookingServiceId] = useState(services[0]?.id || 's1');
  const [bookingTime, setBookingTime] = useState('15:00');
  const [bookingIsStudent, setBookingIsStudent] = useState(false);
  const [bookingStudentIdProof, setBookingStudentIdProof] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedWalkInService = services.find((s) => s.id === walkInServiceId) || services[0];
  const selectedBookingService = services.find((s) => s.id === bookingServiceId) || services[0];

  // Dynamic Walk-in calculations (Strict 50% commission)
  const walkInOriginalPrice = selectedWalkInService?.price || 0;
  const walkInDiscountAmount = calcStudentDiscount(walkInOriginalPrice, walkInIsStudent);
  const walkInFinalPrice = walkInOriginalPrice ? walkInOriginalPrice - walkInDiscountAmount : 0;
  const walkInBarberCut = walkInFinalPrice * (currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE);

  // Dynamic Booking calculations (Strict 50% commission)
  const bookingOriginalPrice = selectedBookingService?.price || 0;
  const bookingDiscountAmount = calcStudentDiscount(bookingOriginalPrice, bookingIsStudent);
  const bookingFinalPrice = bookingOriginalPrice ? bookingOriginalPrice - bookingDiscountAmount : 0;
  const bookingBarberCut = bookingFinalPrice * (currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE);

  // Calculate this barber's availability for slot picker
  const slotAvailability = useMemo(() => {
    const map: Record<string, boolean> = {};
    TIME_SLOTS.forEach((slot) => {
      const isBooked = myAppointments.some(
        (a) => a.time === slot && a.status.toLowerCase() !== 'completed' && a.status.toLowerCase() !== 'cancelled'
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

  // Filter appointments with case-insensitive normalization
  const upcomingAppointments = myAppointments.filter(
    (a) => a.status.toLowerCase() !== 'completed' && a.status.toLowerCase() !== 'cancelled'
  );
  const completedHistory = myAppointments.filter((a) => a.status.toLowerCase() === 'completed');
  const cancelledAppointments = myAppointments.filter((a) => a.status.toLowerCase() === 'cancelled');
  const assignedBranch = branches.find((b) => b.id === currentBarber.branchId);

  // Total Gross Sales generated today by this barber
  const totalGrossToday = completedHistory.reduce((sum, item) => sum + item.price, 0);

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
      isStudent: walkInIsStudent,
      studentIdProof: walkInIsStudent ? walkInStudentIdProof : undefined,
    });

    setToastMessage(`✓ ${walkInName.trim()} — +₾${walkInBarberCut.toFixed(2)} GEL (${Math.round((currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) * 100)}% ${t('barber.commission50Badge', 'Commission')})`);
    setWalkInName('');
    setWalkInPhone('');
    setWalkInIsStudent(false);
    setWalkInStudentIdProof('');
    setIsWalkInModalOpen(false);

    setTimeout(() => setToastMessage(null), 4500);
  };

  // 2. Handle Barber Booking an Appointment for Their Chair
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!bookingName.trim()) {
      setBookingError('Please enter client name');
      return;
    }

    const isAvailable = slotAvailability[bookingTime];
    if (!isAvailable) {
      setBookingError(`Slot ${bookingTime} is already occupied. Please select an open chair slot.`);
      return;
    }

    const result = createBooking({
      customerName: bookingName.trim(),
      customerPhone: bookingPhone.trim() || '+995 5xx xxx xxx',
      barberId: currentBarber.id,
      serviceId: bookingServiceId,
      time: bookingTime,
      isStudent: bookingIsStudent,
      studentIdProof: bookingIsStudent ? bookingStudentIdProof : undefined,
    });

    if (!result.success) {
      setBookingError(result.error || 'Unable to reserve this slot. Please select another time.');
    } else {
      setToastMessage(`✓ ${t('modal.book.submit', 'Reserved for')} ${bookingName.trim()} @ ${bookingTime} (${Math.round((currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) * 100)}% = +₾${bookingBarberCut.toFixed(2)} GEL)`);
      setBookingName('');
      setBookingPhone('');
      setBookingIsStudent(false);
      setBookingStudentIdProof('');
      setIsBookingModalOpen(false);
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Barber Personal Welcome Banner with Action Buttons */}
      <div className="card-executive p-4 sm:p-5 bg-[var(--bg-card)] border-[var(--border-subtle)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3.5 sm:gap-4 cursor-pointer group"
          title={t('barber.btn.profile', 'Station Profile & POS PIN')}
        >
          <div className="relative">
            <img
              src={currentBarber.avatar}
              alt={currentBarber.name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-md shrink-0 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] group-hover:text-[#D4AF37] transition-colors">
                {currentBarber.name}
              </h2>
              <span className="badge-status badge-gold text-[10px] font-bold">
                {t('barber.commission50Badge', `${Math.round((currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) * 100)}% Commission`)}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {currentBarber.specialty} • {assignedBranch?.name || currentBarber.branchId}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('barber.privateViewNotice', `Private Barber View • Fast Chair POS & ${Math.round((currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) * 100)}% Commission Automated Payroll`)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Fast Chair Entry Buttons + Admin View Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Walk-in Button (Primary Gold) */}
          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="btn-primary-gold text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>{t('barber.btn.walkin', '+ Log Walk-In')}</span>
          </button>

          {/* 2. Book Chair Button */}
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#18181B] dark:bg-[#27272A] hover:bg-[#27272A] text-white text-xs font-bold flex items-center gap-1.5 shadow-md border border-[var(--border-card)] transition-all active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('barber.btn.book', '+ Book Slot')}</span>
          </button>

          {/* 3. Station Profile Button */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all active:scale-95 ${
              activeTab === 'profile'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-subtle)]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('barber.btn.profile', 'Profile')}</span>
          </button>

          {/* Switch to Management View */}
          <button
            onClick={loginAsAdmin}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 active:scale-95"
            title={t('auth.adminView', 'Admin View')}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">{t('auth.adminView', 'Admin View')}</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-muted)] text-xs font-bold transition-all border border-[var(--border-subtle)] active:scale-95"
            title={t('auth.signOut', 'Sign Out')}
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

      {/* 6 Core Personal Metric Cards (All strictly tied to 50% automated commission) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        
        {/* 1. Clients Served Today */}
        <div className="card-executive p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block truncate">
            {t('barber.clientsToday', 'Clients Today')}
          </span>
          <div className="mt-2 text-2xl font-black text-[var(--text-main)] font-mono">
            {myClientsToday}
          </div>
          <span className="text-[10px] text-[var(--text-dim)] block mt-1 truncate">{t('barber.servedToday', 'served today')}</span>
        </div>

        {/* 2. Services Completed Today */}
        <div className="card-executive p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block truncate">
            {t('barber.servicesDone', 'Services Done')}
          </span>
          <div className="mt-2 text-2xl font-black text-[#D4AF37] font-mono">
            {myServicesCompletedToday}
          </div>
          <span className="text-[10px] text-[var(--text-dim)] block mt-1 truncate">{t('barber.cutsTrims', 'cuts / trims')}</span>
        </div>

        {/* 3. Today's Earnings (50% cut) */}
        <div className="card-executive p-3.5 sm:p-4 border-emerald-500/30 bg-emerald-500/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block truncate">
            {t('barber.todayEarnings', "Today's Earnings")}
          </span>
          <div className="mt-2 text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono">
            ₾{myTodayEarnings.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1 truncate">
            {Math.round((currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) * 100)}% {t('barber.commission50Badge', 'Commission')}
          </span>
        </div>

        {/* 4. This Month's Earnings (50% cut) */}
        <div className="card-executive p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block truncate">
            {t('barber.monthEarnings', "Month's Earnings")}
          </span>
          <div className="mt-2 text-2xl font-black text-[var(--text-main)] font-mono">
            ₾{myMonthEarnings.toFixed(2)}
          </div>
          <span className="text-[10px] text-[var(--text-dim)] block mt-1 truncate">{t('barber.accumulated', 'accumulated MTD')}</span>
        </div>

        {/* 5. Amount Received / Withdrawn Advances */}
        <div className="card-executive p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block truncate">
            {t('barber.withdrawn', 'Advances Received')}
          </span>
          <div className="mt-2 text-2xl font-black text-amber-500 dark:text-amber-400 font-mono">
            ₾{myTotalWithdrawn.toFixed(2)}
          </div>
          <span className="text-[10px] text-amber-500 font-semibold block mt-1 truncate">{myWithdrawals.length} advances</span>
        </div>

        {/* 6. Remaining Balance Owed */}
        <div className="card-executive p-3.5 sm:p-4 border-[#D4AF37]/50 bg-[var(--bg-card-hover)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block truncate">
            {t('barber.remainingBalance', 'Remaining Balance')}
          </span>
          <div className="mt-2 text-2xl font-black text-[#D4AF37] font-mono">
            ₾{myRemainingBalance.toFixed(2)}
          </div>
          <span className="text-[10px] text-[#D4AF37]/80 block mt-1 truncate">{t('barber.owedToYou', 'owed to you')}</span>
        </div>

      </div>

      {/* Navigation Tabs for Barber's Workspace (Fast Daily Tabs) */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'appointments'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>{t('barber.tab.queue', 'Chair Queue & Live Appointments')} ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'history'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <History className="w-4 h-4 text-[#D4AF37]" />
          <span>{t('barber.tab.history', 'My Completed Cuts Today')} ({completedHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'payroll'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Percent className="w-4 h-4 text-emerald-500" />
          <span>{t('barber.tab.payroll', 'Automated 50% Commission & Payroll')}</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <User className="w-4 h-4 text-[#D4AF37]" />
          <span>{t('barber.tab.profile', 'Station Profile & POS PIN')}</span>
        </button>

        {cancelledAppointments.length > 0 && (
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'cancelled'
                ? 'bg-[#18181B] text-white dark:bg-[#27272A] border border-[var(--border-card)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>{t('barber.tab.cancelled', 'Cancelled Appointments')} ({cancelledAppointments.length})</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: Chair Queue & Live Appointments (1-Tap Fast Actions) */}
      {/* ========================================================================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-3">
          {upcomingAppointments.length === 0 ? (
            <div className="card-executive p-8 text-center text-xs text-[var(--text-dim)] space-y-2">
              <p>{t('barber.noPending', 'No pending appointments right now.')}</p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsWalkInModalOpen(true)}
                  className="btn-primary-gold text-xs py-1.5 px-3"
                >
                  {t('barber.btn.walkin', '+ Log Walk-In Client Now')}
                </button>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  {t('barber.btn.book', '+ Book an Appointment')}
                </button>
              </div>
            </div>
          ) : (
            upcomingAppointments.map((apt) => {
              const isScheduled = apt.status.toLowerCase() === 'scheduled';
              const isArrived = apt.status.toLowerCase() === 'arrived' || apt.status.toLowerCase() === 'in service' || apt.status.toLowerCase() === 'in_service';

              return (
                <div
                  key={apt.id}
                  className={`card-executive p-4 sm:p-5 space-y-3.5 transition-all ${
                    isArrived ? 'border-amber-500/50 bg-[var(--bg-card-hover)] ring-1 ring-amber-500/20' : ''
                  }`}
                >
                  {/* Card Header Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] font-mono text-xs font-bold text-[var(--text-main)] border border-[var(--border-subtle)]">
                        {apt.ticketNumber}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#D4AF37] flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.time}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                        {apt.type}
                      </span>
                    </div>

                    {isScheduled && (
                      <span className="badge-status badge-neutral text-xs">
                        {t('barber.awaitingArrival', 'Awaiting Customer Arrival')}
                      </span>
                    )}
                    {isArrived && (
                      <span className="badge-status badge-amber text-xs animate-pulse">
                        {t('barber.activeInChair', '● In Chair / Active')}
                      </span>
                    )}
                    {!isScheduled && !isArrived && (
                      <span className="badge-status badge-neutral text-xs">
                        {apt.status}
                      </span>
                    )}
                  </div>

                  {/* Customer Info & Service Value */}
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                    <div className="min-w-0 pr-4">
                      <h4 className="font-bold text-base text-[var(--text-main)] truncate">{apt.customerName}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{apt.serviceName}</p>
                      {apt.isStudent && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] mt-1">
                          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                          <span>{t('student.applied', 'Student 20% Discount Applied')}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-[var(--text-main)] font-mono block">
                        ₾{apt.price.toFixed(2)} GEL
                      </span>
                      <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 block mt-0.5">
                        {t('barber.your50Cut', `Your ${Math.round((currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) * 100)}%`)}: ₾{(apt.price * (currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE)).toFixed(2)} GEL
                      </span>
                    </div>
                  </div>

                  {/* Direct 1-Tap Fulfil & Fast Action Bar */}
                  <div className="pt-3 border-t border-[var(--border-subtle)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                      
                      {/* Left: Guidance message */}
                      <div className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>
                          {isArrived
                            ? t('barber.inProgress', 'Haircut in progress — Fulfil & record payment:')
                            : t('barber.readyToServe', 'Ready to serve — Fulfil entry or mark arrived:')}
                        </span>
                      </div>

                      {/* Right: Fast Actions (Mark In Chair, Fulfil Cash, Fulfil Card, Cancel) */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isScheduled && (
                          <button
                            onClick={() => markCustomerArrived(apt.id)}
                            className="btn-secondary text-xs py-1.5 px-3 font-bold active:scale-95 transition-all text-[var(--text-main)] hover:border-[#D4AF37]"
                            title="Mark client arrived at your station"
                          >
                            {t('barber.markInChair', '● Mark In Chair')}
                          </button>
                        )}

                        {/* 1. Fulfil with Cash */}
                        <button
                          onClick={() => completeService(apt.id, 'cash')}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          title="Fulfil entry and collect Cash payment"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>{t('barber.fulfilCash', 'Fulfil Cash')} (₾{apt.price.toFixed(2)})</span>
                        </button>

                        {/* 2. Fulfil with Card */}
                        <button
                          onClick={() => completeService(apt.id, 'card')}
                          className="px-3.5 py-1.5 rounded-lg bg-[#18181B] dark:bg-[#27272A] hover:bg-[#27272A] border border-[#D4AF37] text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          title="Fulfil entry and collect Card payment"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{t('barber.fulfilCard', 'Fulfil Card')} (₾{apt.price.toFixed(2)})</span>
                        </button>

                        {/* 3. Cancel Booking */}
                        <button
                          onClick={() => {
                            cancelBooking(apt.id, `Cancelled by Barber ${currentBarber.name}`);
                            setToastMessage(`Booking ${apt.ticketNumber} for ${apt.customerName} has been cancelled.`);
                            setTimeout(() => setToastMessage(null), 4000);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                          title="Cancel this booking and free up time slot"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t('action.cancel', 'Cancel')}</span>
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Completed Service History */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="card-executive p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#D4AF37]" />
              {t('barber.completedTitle', 'My Completed Cuts & 50% Earned Commissions')}
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400">
              {t('barber.todayEarnings', "Today's Earnings")}: ₾{myTodayEarnings.toFixed(2)} GEL (50%)
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {completedHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-dim)]">
                {t('barber.noCompletedToday', 'No completed services logged today yet.')}
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
                      {item.serviceName} • {item.time} ({item.paymentMethod === 'cash' ? t('payment.cash', 'CASH') : t('payment.card', 'CARD')})
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-[var(--text-main)] text-xs block">
                      {t('barber.ticket', 'Ticket')}: ₾{item.price.toFixed(2)} GEL
                    </span>
                    <span className="font-mono font-black text-emerald-500 dark:text-emerald-400 text-sm">
                      +₾{(item.price * (currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE)).toFixed(2)} GEL ({Math.round((currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) * 100)}%)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: Automated 50% Commission & Payroll Ledger */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="card-executive p-5 sm:p-6 space-y-6">
            
            {/* Header & Subtitle */}
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-main)]">
                    {t('barber.payrollTitle', 'Automated 50% Commission Payroll & Settlement Ledger')}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {t('barber.payrollSubtitle', 'Your earnings are automatically calculated at exactly 50% on every service completed at your chair.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Clear Mathematical Payroll & Settlement Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Step 1: Gross Sales Generated Today */}
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">
                  1. {t('barber.grossSales', "Today's Gross Sales")}
                </span>
                <div className="text-2xl font-black font-mono text-[var(--text-main)]">
                  ₾{totalGrossToday.toFixed(2)}
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">{completedHistory.length} completed cuts today</p>
              </div>

              {/* Step 2: Today's Commission Earned */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-500 block">
                  2. {t('barber.todayCommission', `Today's ${Math.round((currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) * 100)}% Cut`)}
                </span>
                <div className="text-2xl font-black font-mono text-emerald-500 dark:text-emerald-400">
                  ₾{myTodayEarnings.toFixed(2)}
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold">
                  {Math.round((currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) * 100)}% of ₾{totalGrossToday.toFixed(2)} gross
                </p>
              </div>

              {/* Step 3: Month Total Accumulated */}
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                  3. {t('barber.monthAccumulated', "Month Total Earnings")}
                </span>
                <div className="text-2xl font-black font-mono text-[var(--text-main)]">
                  ₾{myMonthEarnings.toFixed(2)}
                </div>
                <p className="text-[10px] text-[var(--text-dim)]">
                  ₾{(currentBarber?.monthBaseEarnings || 0).toFixed(2)} base + ₾{myTodayEarnings.toFixed(2)} today
                </p>
              </div>

              {/* Step 4: Net Balance Owed to Barber */}
              <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 space-y-1">
                <span className="text-[10px] uppercase font-black text-[#D4AF37] block">
                  4. {t('barber.netBalanceOwed', 'Net Payable Balance')}
                </span>
                <div className="text-2xl font-black font-mono text-[#D4AF37]">
                  ₾{myRemainingBalance.toFixed(2)}
                </div>
                <p className="text-[10px] text-[#D4AF37]/80 font-bold">
                  {myTotalWithdrawn > 0 ? `After -₾${myTotalWithdrawn.toFixed(2)} advances drawn` : 'No cash advances drawn'}
                </p>
              </div>

            </div>

            {/* Guaranteed 50% Rate Menu */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {t('barber.serviceRateMenu', 'Station Service Menu & Guaranteed 50% Barber Cut')}
                </h4>
                <span className="badge-status badge-gold text-[10px] font-mono">
                  {t('barber.commission50Badge', '50% Commission')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((svc) => {
                  const barberCut = svc.price !== null ? svc.price * (currentBarber?.commissionRate || DEFAULT_COMMISSION_RATE) : null;
                  return (
                    <div
                      key={svc.id}
                      className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between hover:border-[var(--border-card)] transition-colors"
                    >
                      <div>
                        <div className="font-bold text-xs text-[var(--text-main)]">{svc.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {t('barber.duration', 'Duration')}: {svc.duration} mins • {t('barber.clientPrice', 'Customer Price')}:{' '}
                          <span className="font-semibold text-[var(--text-main)]">
                            {svc.price !== null ? `₾${svc.price} GEL` : 'Price TBD'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-500 block">{t('barber.yourPayout', 'Your 50% Payout')}</span>
                        <span className="text-base font-black font-mono text-emerald-500 dark:text-emerald-400">
                          {barberCut !== null ? `+₾${barberCut.toFixed(2)}` : '50% of TBD'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cash Advances Disbursed List */}
            <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('barber.advancesList', 'Cash Advances Disbursed by Management')}
              </h4>

              <div className="space-y-2">
                {myWithdrawals.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--text-dim)] bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                    {t('barber.noAdvances', 'No cash advances disbursed this month.')}
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

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Station Profile & POS PIN */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="card-executive p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={currentBarber.avatar}
                    alt={currentBarber.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-xl"
                  />
                  <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow">
                    Active
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-[var(--text-main)]">{currentBarber.name}</h2>
                    <span className="badge-status badge-gold">
                      {t('brand.masterStylist', 'Master Stylist')} (50%)
                    </span>
                  </div>
                  <p className="text-xs text-[#D4AF37] font-semibold mt-1">
                    {currentBarber.specialty}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mt-2">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                      {assignedBranch?.name || currentBarber.branchId}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                      {assignedBranch?.address || 'Tbilisi, Georgia'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Station Security PIN Quick Access */}
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2 min-w-[220px]">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {t('barber.stationPin', 'POS Station PIN')}
                  </span>
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className="text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors p-1"
                    title={showPin ? t('barber.hidePin', 'Hide PIN') : t('barber.revealPin', 'Reveal PIN')}
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-lg font-black font-mono tracking-widest text-[var(--text-main)]">
                  {showPin ? (currentBarber.pin || '1234') : '••••'}
                </div>
                <p className="text-[10px] text-[var(--text-dim)]">
                  {t('barber.pinDesc', 'Use this 4-digit code to log into the shop floor terminal.')}
                </p>
              </div>
            </div>

            {/* Station Schedule & Policies */}
            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase text-[var(--text-dim)]">{t('barber.assignedStation', 'Assigned Station')}</div>
                <div className="font-bold text-[var(--text-main)] mt-1">{t('barber.chairPremium', 'Chair 01 • Premium Station')}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Wahl cordless clippers & station tools</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-[var(--text-dim)]">{t('barber.shiftHours', 'Shift Hours')}</div>
                <div className="font-bold text-[var(--text-main)] mt-1">{t('barber.shiftSchedule', '10:00 AM – 8:00 PM (Monday - Saturday)')}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">6-day full station schedule</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-[var(--text-dim)]">{t('barber.managerOnDuty', 'Manager on Duty')}</div>
                <div className="font-bold text-[var(--text-main)] mt-1">{t('barber.managerContact', 'Store Owner / Admin')}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Contact manager for cash advances</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Cancelled Bookings */}
      {/* ========================================================================= */}
      {activeTab === 'cancelled' && (
        <div className="card-executive p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              {t('barber.tab.cancelled', 'Cancelled Appointments')} ({cancelledAppointments.length})
            </h3>
            <span className="text-xs text-[var(--text-dim)]">Slots freed for new walk-ins</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {cancelledAppointments.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-dim)]">
                No cancellations recorded today.
              </div>
            ) : (
              cancelledAppointments.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-main)] text-sm">{item.customerName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-dim)]">
                        {item.ticketNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {item.serviceName} • {item.time} ({item.customerPhone})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-500">{t('status.cancelled', 'Cancelled')}</span>
                    <button
                      onClick={() => {
                        updateBookingStatus(item.id, 'Scheduled');
                        setToastMessage(`✓ Re-opened slot at ${item.time} for ${item.customerName}.`);
                        setTimeout(() => setToastMessage(null), 4000);
                      }}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg text-xs font-bold transition-all"
                    >
                      {t('barber.reopenSlot', 'Re-open Slot')}
                    </button>
                  </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-executive w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <h3 className="font-bold text-base text-[var(--text-main)]">{t('modal.walkin.title', 'Log Walk-In to My Chair')}</h3>
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
                  {t('modal.walkin.clientName', 'Customer Name *')}
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
                  {t('modal.walkin.clientPhone', 'Customer Phone (Optional)')}
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
                  {t('modal.walkin.selectService', 'Select Service Provided *')}
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
                          {s.price !== null ? `₾${s.price}` : 'TBD'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5">
                  {t('modal.walkin.paymentCollected', 'Payment Method Collected *')}
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
                    <span>{t('payment.cash', 'Cash Payment')}</span>
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
                    <span>{t('payment.card', 'Card / POS')}</span>
                  </button>
                </div>
              </div>

              {/* Student Discount Toggle */}
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <span className="font-bold text-xs text-[var(--text-main)]">{t('student.discount', 'Student 20% Discount')}</span>
                      <p className="text-[10px] text-[var(--text-dim)]">{t('student.proof', 'Valid student ID card verification')}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={walkInIsStudent}
                      onChange={(e) => setWalkInIsStudent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                  </label>
                </div>

                {walkInIsStudent && (
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <input
                      type="text"
                      placeholder={t('student.idCard', 'Student ID / Card # (e.g. STU-9921)')}
                      value={walkInStudentIdProof}
                      onChange={(e) => setWalkInStudentIdProof(e.target.value)}
                      className="w-full text-xs font-mono"
                    />
                    <div className="flex items-center justify-between text-[11px] text-[#D4AF37] font-semibold bg-[#D4AF37]/10 p-2 rounded-lg border border-[#D4AF37]/20">
                      <span>Discount: -20% (-₾{walkInDiscountAmount.toFixed(2)} GEL)</span>
                      <span className="font-mono font-bold">Charged: ₾{walkInFinalPrice.toFixed(2)} GEL</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payout Breakdown Pill (50% Commission highlighted) */}
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[var(--text-dim)] block font-bold">
                    {walkInIsStudent ? 'Ticket Total (20% Off)' : 'Ticket Total'}
                  </span>
                  <span className="text-base font-black text-[var(--text-main)] font-mono">
                    {selectedWalkInService.price !== null ? `₾${walkInFinalPrice.toFixed(2)} GEL` : 'Price TBD'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-[var(--text-dim)] block font-bold">{t('barber.your50Cut', 'Your 50% Share')}</span>
                  <span className="text-base font-black text-emerald-500 dark:text-emerald-400 font-mono">
                    {selectedWalkInService.price !== null ? `+₾${walkInBarberCut.toFixed(2)} GEL` : '50% of TBD'}
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
                  {t('action.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                >
                  {t('modal.walkin.submit', 'Complete Cut & Add to My Stats')}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-executive w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-base text-[var(--text-main)]">{t('modal.book.title', 'Book Appointment for My Chair')}</h3>
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
                  {t('modal.book.clientName', 'Customer Name *')}
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
                  {t('modal.book.clientPhone', 'Customer Phone *')}
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
                  {t('modal.book.selectService', 'Select Service *')}
                </label>
                <select
                  value={bookingServiceId}
                  onChange={(e) => setBookingServiceId(e.target.value)}
                  className="w-full font-semibold"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.price !== null ? `₾${s.price} GEL` : 'Price TBD'} ({s.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Discount Toggle */}
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <span className="font-bold text-xs text-[var(--text-main)]">{t('student.discount', 'Student 20% Discount')}</span>
                      <p className="text-[10px] text-[var(--text-dim)]">{t('student.proof', 'Applies 20% discount on service price')}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingIsStudent}
                      onChange={(e) => setBookingIsStudent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                  </label>
                </div>

                {bookingIsStudent && (
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <input
                      type="text"
                      placeholder={t('student.idCard', 'Student ID / Card # (Optional)')}
                      value={bookingStudentIdProof}
                      onChange={(e) => setBookingStudentIdProof(e.target.value)}
                      className="w-full text-xs font-mono"
                    />
                    <div className="flex items-center justify-between text-[11px] text-[#D4AF37] font-semibold bg-[#D4AF37]/10 p-2 rounded-lg border border-[#D4AF37]/20">
                      <span>Discount: -20% (-₾{bookingDiscountAmount.toFixed(2)} GEL)</span>
                      <span className="font-mono font-bold">Price: ₾{bookingFinalPrice.toFixed(2)} GEL</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5 flex items-center justify-between">
                  <span>{t('modal.book.selectSlot', 'Select Time Slot *')}</span>
                  <span className="text-[10px] text-[#D4AF37]">{t('modal.book.scheduleBased', 'Based on your chair schedule')}</span>
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

              {/* Dynamic Price Preview (50% cut preview) */}
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[var(--text-dim)] block font-bold">
                    {bookingIsStudent ? 'Booking Price (20% Off)' : 'Booking Price'}
                  </span>
                  <span className="text-base font-black text-[var(--text-main)] font-mono">
                    {selectedBookingService.price !== null ? `₾${bookingFinalPrice.toFixed(2)} GEL` : 'Price TBD'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-[var(--text-dim)] block font-bold">{t('barber.your50Cut', 'Your 50% Cut')}</span>
                  <span className="text-base font-black text-emerald-500 dark:text-emerald-400 font-mono">
                    {selectedBookingService.price !== null ? `+₾${bookingBarberCut.toFixed(2)} GEL` : '50% of TBD'}
                  </span>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="btn-secondary"
                >
                  {t('action.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                >
                  {t('modal.book.submit', 'Confirm Booking for')} {bookingTime}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
