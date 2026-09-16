import React, { useState, useMemo } from 'react';
import { useCash, isCompletedStatus, isArrivedStatus, isInServiceStatus, isScheduledStatus, isNoShowStatus, isCancelledStatus, isRescheduledStatus } from '../../context/CashContext';
import { STUDENT_DISCOUNT_PERCENT, DEFAULT_COMMISSION_RATE, calcStudentDiscount, calcNetPrice, formatAmount } from '../../constants';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  CreditCard,
  Banknote, 
  Kanban,
  List,
  Plus,
  X,
  GripVertical,
  GraduationCap,
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  Footprints,
  XCircle
} from 'lucide-react';
import { BookingAppointment, BookingSource } from '../../types';

const InstagramIcon = () => (
  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const SOURCES: BookingSource[] = [
  'Phone',
  'Instagram',
  'WhatsApp',
  'Walk-in',
  'Direct Barber Booking'
];

export const BookingView: React.FC = () => {
  const { 
    branchBarbers, 
    barbers,
    services, 
    branchBookings, 
    createBooking, 
    addWalkIn,
    markCustomerArrived, 
    markCustomerInService,
    markNoShow,
    completeService,
    updateBookingStatus,
    cancelBooking,
    t
  } = useCash();

  // View Mode: Kanban vs Table
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [mobileKanbanStage, setMobileKanbanStage] = useState<'all' | 'Scheduled' | 'Arrived' | 'Completed'>('all');

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [studentIdProof, setStudentIdProof] = useState('');
  const [allergies, setAllergies] = useState('');
  const [bookingSource, setBookingSource] = useState<BookingSource>('Phone');
  const [selectedBarberId, setSelectedBarberId] = useState(branchBarbers[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedTime, setSelectedTime] = useState('14:00');

  // Feedback Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Show exception drawer
  const [showExceptions, setShowExceptions] = useState(false);

  // Quick Walk-In Modal State
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInBarberId, setWalkInBarberId] = useState(branchBarbers[0]?.id || '');
  const [walkInServiceId, setWalkInServiceId] = useState(services[0]?.id || '');
  const [walkInIsStudent, setWalkInIsStudent] = useState(false);

  const handleWalkInSubmit = (paymentMethod: 'cash' | 'card') => {
    if (!walkInName.trim()) {
      setErrorMessage('Please enter the customer name.');
      return;
    }
    const service = services.find((s) => s.id === walkInServiceId);
    const barber = branchBarbers.find((b) => b.id === walkInBarberId);
    addWalkIn({
      customerName: walkInName.trim(),
      barberId: walkInBarberId,
      serviceId: walkInServiceId,
      paymentMethod,
      source: 'Walk-in',
      isStudent: walkInIsStudent,
    });
    const price = service?.price ?? 0;
    const finalPrice = walkInIsStudent ? calcNetPrice(price, true) : price;
    setSuccessMessage(`✓ Walk-in completed for ${walkInName.trim()} — ₾${(finalPrice).toFixed(2)} GEL (${paymentMethod}) with ${barber?.name || 'Barber'}`);
    setIsWalkInOpen(false);
    setWalkInName('');
    setWalkInIsStudent(false);
    setTimeout(() => setSuccessMessage(null), 4500);
  };

  const activeBarber = branchBarbers.find((b) => b.id === selectedBarberId) || branchBarbers[0];

  // Calculate barber availability across today's slots
  const barberAvailability = useMemo(() => {
    const map: Record<string, { booked: boolean; customerName?: string }> = {};
    TIME_SLOTS.forEach((slot) => {
      const existing = branchBookings.find(
        (b) => b.barberId === selectedBarberId && b.time === slot && !isCompletedStatus(b.status) && !isCancelledStatus(b.status)
      );
      if (existing) {
        map[slot] = { booked: true, customerName: existing.customerName };
      } else {
        map[slot] = { booked: false };
      }
    });
    return map;
  }, [branchBookings, selectedBarberId]);

  // 3 Core Pipeline Categories (Scheduled -> Arrived -> Completed)
  const scheduledList = useMemo(() => branchBookings.filter((b) => isScheduledStatus(b.status)), [branchBookings]);
  const arrivedList = useMemo(() => branchBookings.filter((b) => isArrivedStatus(b.status) || isInServiceStatus(b.status)), [branchBookings]);
  const completedList = useMemo(() => branchBookings.filter((b) => isCompletedStatus(b.status)), [branchBookings]);

  // Exception lists
  const noShowList = useMemo(() => branchBookings.filter((b) => isNoShowStatus(b.status)), [branchBookings]);
  const cancelledList = useMemo(() => branchBookings.filter((b) => isCancelledStatus(b.status)), [branchBookings]);
  const rescheduledList = useMemo(() => branchBookings.filter((b) => isRescheduledStatus(b.status)), [branchBookings]);

  const scheduledValue = scheduledList.reduce((sum, b) => sum + b.price, 0);
  const arrivedValue = arrivedList.reduce((sum, b) => sum + b.price, 0);
  const completedValue = completedList.reduce((sum, b) => sum + b.price, 0);

  // Drag and Drop States
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<'Scheduled' | 'Arrived' | 'Completed' | null>(null);
  const [paymentModalBooking, setPaymentModalBooking] = useState<BookingAppointment | null>(null);

  const handleCardDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleCardDragEnd = () => {
    setDraggedId(null);
    setDragOverCol(null);
  };

  const handleColDragOver = (e: React.DragEvent, col: 'Scheduled' | 'Arrived' | 'Completed') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== col) {
      setDragOverCol(col);
    }
  };

  const handleColDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverCol(null);
    }
  };

  const handleColDrop = (e: React.DragEvent, targetCol: 'Scheduled' | 'Arrived' | 'Completed') => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (!id) return;

    const booking = branchBookings.find((b) => b.id === id);
    if (!booking) return;

    if (booking.status === targetCol) return;

    if (targetCol === 'Completed') {
      setPaymentModalBooking(booking);
      return;
    }

    if (targetCol === 'Arrived') {
      updateBookingStatus(id, 'Arrived');
      setSuccessMessage(`✓ ${booking.customerName} marked Arrived.`);
      setTimeout(() => setSuccessMessage(null), 3500);
      return;
    }

    if (targetCol === 'Scheduled') {
      updateBookingStatus(id, 'Scheduled');
      setSuccessMessage(`✓ ${booking.customerName} returned to Scheduled Queue.`);
      setTimeout(() => setSuccessMessage(null), 3500);
      return;
    }
  };

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
      source: bookingSource,
      isStudent,
      studentIdProof: isStudent ? studentIdProof : undefined,
      allergies: allergies.trim() || 'None',
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Slot conflict detected.');
    } else {
      const service = services.find((s) => s.id === selectedServiceId);
      const basePrice = service?.price ?? 0;
      const actualPrice = isStudent ? calcNetPrice(basePrice, true) : basePrice;
      const priceText = isStudent ? `${(actualPrice || 0).toFixed(2)} GEL (${STUDENT_DISCOUNT_PERCENT}% Student Discount applied)` : `${(basePrice || 0).toFixed(2)} GEL`;
      setSuccessMessage(`✓ Appointment reserved for ${customerName.trim()} at ${selectedTime}! (${priceText})`);
      setIsBookingOpen(false);
      setCustomerName('');
      setCustomerPhone('');
      setIsStudent(false);
      setStudentIdProof('');
      setAllergies('');
      setTimeout(() => setSuccessMessage(null), 4500);
    }
  };

  const renderSourceBadge = (source: BookingSource) => {
    switch (source) {
      case 'Instagram':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20"><InstagramIcon /> Instagram</span>;
      case 'WhatsApp':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"><MessageSquare className="w-2.5 h-2.5" /> WhatsApp</span>;
      case 'Phone':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20"><PhoneCall className="w-2.5 h-2.5" /> Phone</span>;
      case 'Walk-in':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"><Footprints className="w-2.5 h-2.5" /> Walk-in</span>;
      case 'Direct Barber Booking':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20"><Scissors className="w-2.5 h-2.5" /> Direct Chair</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header with Pipeline Controls */}
      <div className="card-executive p-5 bg-[var(--bg-card)] border-[var(--border-subtle)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[#D4AF37]">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                {t('book.pipelineTitle', 'Client Appointment Pipeline')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('book.pipelineSubtitle', 'Live Appointment Board: Scheduled Bookings ➔ Client Check-In ➔ In Service ➔ Service Completion & Payment')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
                <span>{t('book.kanbanBoard', 'Kanban Board')}</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#18181B] text-white dark:bg-[#27272A] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <List className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('book.tableView', 'Table View')}</span>
              </button>
            </div>

            {/* Exceptions Drawer Toggle */}
            <button
              onClick={() => setShowExceptions(!showExceptions)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                showExceptions
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/40'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-subtle)]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('book.exceptions', 'Exceptions')} ({noShowList.length + cancelledList.length + rescheduledList.length})</span>
            </button>

            {/* Quick Walk-In Action Button */}
            <button
              onClick={() => setIsWalkInOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-xs active:scale-95 transition-all"
            >
              <Footprints className="w-4 h-4 text-amber-500" />
              <span>{t('walkin.quickWalkIn', 'Quick Walk-In')}</span>
            </button>

            {/* Book Client Action Button */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="btn-primary-gold text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('book.bookAppointment', 'Book Appointment')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-500 flex items-center justify-between shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-[var(--text-main)]">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-[var(--text-main)] text-base font-bold">×</button>
        </div>
      )}

      {/* Exceptions Panel (No-show, Cancelled, Rescheduled) */}
      {showExceptions && (
        <div className="card-executive p-4 bg-amber-950/10 border-amber-500/30 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t('book.exceptionsTitle', 'Appointment Exceptions & Status Ledger')}
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              {t('book.noShowGraceRule', 'No-show grace rule: 10 minutes past slot ➔ Flagged for No-Show')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* No-Shows */}
            <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-rose-500 uppercase">
                <span>{t('book.noShowRecords', 'No-Show Records')} ({noShowList.length})</span>
                <span className="badge-status badge-red">{t('book.graceExpired', '10m Grace Expired')}</span>
              </div>
              {noShowList.length === 0 ? (
                <div className="text-[11px] text-[var(--text-dim)] py-2 text-center">{t('book.noNoShows', 'No no-shows today.')}</div>
              ) : (
                noShowList.map((item) => (
                  <div key={item.id} className="p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[var(--text-main)]">{item.customerName}</div>
                      <div className="text-[10px] text-[var(--text-dim)]">{item.time} • {item.barberName}</div>
                    </div>
                    <button
                      onClick={() => updateBookingStatus(item.id, 'Scheduled')}
                      className="text-[10px] text-amber-500 hover:underline"
                    >
                      {t('book.btn.reopen', 'Re-open')}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cancelled */}
            <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] uppercase">
                <span>{t('book.cancelledRecords', 'Cancelled Records')} ({cancelledList.length})</span>
              </div>
              {cancelledList.length === 0 ? (
                <div className="text-[11px] text-[var(--text-dim)] py-2 text-center">{t('book.noCancelled', 'No cancellations today.')}</div>
              ) : (
                cancelledList.map((item) => (
                  <div key={item.id} className="p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[var(--text-main)]">{item.customerName}</div>
                      <div className="text-[10px] text-[var(--text-dim)]">{item.time} • {item.barberName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-rose-500 font-semibold">{t('status.cancelled', 'Cancelled')}</span>
                      <button
                        onClick={() => updateBookingStatus(item.id, 'Scheduled')}
                        className="text-[10px] text-amber-500 hover:underline font-bold"
                      >
                        {t('book.btn.reopen', 'Re-open')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rescheduled */}
            <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] uppercase">
                <span>{t('book.rescheduledRecords', 'Rescheduled Records')} ({rescheduledList.length})</span>
              </div>
              {rescheduledList.length === 0 ? (
                <div className="text-[11px] text-[var(--text-dim)] py-2 text-center">{t('book.noRescheduled', 'No rescheduled appointments today.')}</div>
              ) : (
                rescheduledList.map((item) => (
                  <div key={item.id} className="p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[var(--text-main)]">{item.customerName}</div>
                      <div className="text-[10px] text-[var(--text-dim)]">{item.time} • {item.barberName}</div>
                    </div>
                    <span className="text-[10px] text-blue-500">{t('status.rescheduled', 'Rescheduled')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. KANBAN INTERACTIVE WORKFLOW BOARD */}
      {viewMode === 'kanban' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <GripVertical className="w-4 h-4 text-[#D4AF37]" />
              <span>
                <strong className="text-[var(--text-main)]">Pipeline Active:</strong> {t('book.pipelineSubtitle', 'Scheduled ➔ Arrived ➔ In Service ➔ Completed')}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('status.live', 'Live')}
            </span>
          </div>

          {/* Mobile Stage Selector Pill Tabs */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setMobileKanbanStage('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                mobileKanbanStage === 'all'
                  ? 'bg-[#18181B] dark:bg-[#27272A] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              {t('branch.all', 'All')}
            </button>
            <button
              onClick={() => setMobileKanbanStage('Scheduled')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                mobileKanbanStage === 'Scheduled'
                  ? 'bg-[#18181B] dark:bg-[#27272A] text-white border border-[var(--border-card)] shadow-xs'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>{t('book.tab.scheduled', 'Scheduled')}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-[var(--bg-card)] text-[var(--text-dim)]">{scheduledList.length}</span>
            </button>
            <button
              onClick={() => setMobileKanbanStage('Arrived')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                mobileKanbanStage === 'Arrived'
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-xs'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>{t('status.arrived', 'Arrived')}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-[var(--bg-card)] text-amber-500">{arrivedList.length}</span>
            </button>
            <button
              onClick={() => setMobileKanbanStage('Completed')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                mobileKanbanStage === 'Completed'
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 shadow-xs'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              <span>{t('status.completed', 'Completed')}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-[var(--bg-card)] text-emerald-500">{completedList.length}</span>
            </button>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            
            {/* COLUMN 1: SCHEDULED */}
            <div 
              onDragOver={(e) => handleColDragOver(e, 'Scheduled')}
              onDragLeave={handleColDragLeave}
              onDrop={(e) => handleColDrop(e, 'Scheduled')}
              className={`kanban-col space-y-3 transition-all duration-200 ${
                mobileKanbanStage === 'all'
                  ? 'w-[84vw] sm:w-[320px] md:w-auto shrink-0 snap-center'
                  : mobileKanbanStage === 'Scheduled'
                    ? 'w-full'
                    : 'hidden md:block md:w-auto'
              } ${
                dragOverCol === 'Scheduled' ? 'is-drag-over' : ''
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#71717A]"></span>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-main)]">
                    {t('book.col.scheduled', '1. Scheduled Queue')}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)]">
                    {scheduledList.length}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)] font-semibold">
                    ₾{scheduledValue.toFixed(2)}
                  </span>
                </div>
              </div>

              {dragOverCol === 'Scheduled' && (
                <div className="p-3 text-center border-2 border-dashed border-[#D4AF37] rounded-xl bg-[#D4AF37]/10 text-xs text-[#D4AF37] font-bold animate-pulse">
                  + {t('book.dropToSchedule', 'Drop here to return to Scheduled')}
                </div>
              )}

              <div className="space-y-3 min-h-[400px]">
                {scheduledList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                    {t('book.noScheduled', 'No scheduled appointments in queue.')}
                  </div>
                ) : (
                  scheduledList.map((item) => (
                    <div 
                      key={item.id} 
                      draggable={true}
                      onDragStart={(e) => handleCardDragStart(e, item.id)}
                      onDragEnd={handleCardDragEnd}
                      className={`kanban-card p-4 space-y-3 relative group transition-all duration-200 ${
                        draggedId === item.id ? 'is-dragging' : ''
                      } ${item.isNoShowGraceExpired ? 'border-amber-500/50 bg-amber-500/5' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-main)] border border-[var(--border-subtle)]">
                          {item.ticketNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#D4AF37] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                          <span title="Drag card to move">
                            <GripVertical className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors cursor-grab active:cursor-grabbing" />
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-[var(--text-main)]">{item.customerName}</h4>
                          {renderSourceBadge(item.source)}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.serviceName}</p>
                      </div>

                      {/* Student Discount Tag */}
                      {item.isStudent && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                          <span>{t('student.discount', 'Student 20% Discount')} (-₾{item.discountAmount.toFixed(2)} GEL)</span>
                        </div>
                      )}

                      {/* Allergies Notice */}
                      {item.allergies && item.allergies !== 'None' && (
                        <div className="text-[10px] text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {t('cust.th.allergies', 'Allergies')}: {item.allergies}
                        </div>
                      )}

                      {/* 10-Minute Grace Expired Warning */}
                      {item.isNoShowGraceExpired && (
                        <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-500 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{t('book.graceExpired', '10m Grace Expired')}</span>
                          </div>
                          <button
                            onClick={() => markNoShow(item.id)}
                            className="w-full py-1 text-center font-black bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] transition-colors"
                          >
                            {t('book.btn.noShow', 'Mark No-Show')}
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)]">
                          Chair: <strong className="text-[var(--text-main)]">{item.barberName}</strong>
                        </span>
                        <span className="font-mono font-bold text-[var(--text-main)]">
                          ₾{item.price.toFixed(2)} GEL
                        </span>
                      </div>

                      {/* Fast Actions: Mark Arrived / No-Show / Cancel */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => markCustomerArrived(item.id)}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('book.btn.markArrived', 'Check-In Client')}</span>
                        </button>
                        <button
                          onClick={() => markNoShow(item.id)}
                          className="px-2.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                          title="Mark client as No-show"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{t('book.btn.noShow', 'No-Show')}</span>
                        </button>
                        <button
                          onClick={() => cancelBooking(item.id, 'Cancelled before check-in')}
                          className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all flex items-center justify-center active:scale-95"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: ARRIVED IN SHOP (READY FOR CHECKOUT) */}
            <div 
              onDragOver={(e) => handleColDragOver(e, 'Arrived')}
              onDragLeave={handleColDragLeave}
              onDrop={(e) => handleColDrop(e, 'Arrived')}
              className={`kanban-col space-y-3 bg-[var(--bg-subtle)] border-amber-500/30 transition-all duration-200 ${
                mobileKanbanStage === 'all'
                  ? 'w-[84vw] sm:w-[320px] md:w-auto shrink-0 snap-center'
                  : mobileKanbanStage === 'Arrived'
                    ? 'w-full'
                    : 'hidden md:block md:w-auto'
              } ${
                dragOverCol === 'Arrived' ? 'is-drag-over' : ''
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {t('book.col.arrived', '2. Arrived & In Shop')}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[var(--bg-card)] border border-amber-500/40 text-amber-600 dark:text-amber-400">
                    {arrivedList.length}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)] font-semibold">
                    ₾{arrivedValue.toFixed(2)}
                  </span>
                </div>
              </div>

              {dragOverCol === 'Arrived' && (
                <div className="p-3 text-center border-2 border-dashed border-amber-500 rounded-xl bg-amber-500/10 text-xs text-amber-500 font-bold animate-pulse">
                  + {t('book.dropToArrived', 'Drop here to mark Client Arrived')}
                </div>
              )}

              <div className="space-y-3 min-h-[400px]">
                {arrivedList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                    {t('book.noArrived', 'No clients currently in shop.')}
                  </div>
                ) : (
                  arrivedList.map((item) => (
                    <div 
                      key={item.id} 
                      draggable={true}
                      onDragStart={(e) => handleCardDragStart(e, item.id)}
                      onDragEnd={handleCardDragEnd}
                      className={`kanban-card p-4 space-y-3 border-amber-500/40 shadow-md relative group transition-all duration-200 ${
                        draggedId === item.id ? 'is-dragging' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          {item.ticketNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="badge-status badge-amber">
                            ● {t('status.arrived', 'In Shop')}
                          </span>
                          <span title="Drag card to move">
                            <GripVertical className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-amber-500 transition-colors cursor-grab active:cursor-grabbing" />
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-[var(--text-main)]">{item.customerName}</h4>
                          {renderSourceBadge(item.source)}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.serviceName}</p>
                      </div>

                      {item.isStudent && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                          <span>{t('student.discount', 'Student 20% Discount')} (-₾{item.discountAmount.toFixed(2)} GEL)</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)]">
                          Barber: <strong className="text-[var(--text-main)]">{item.barberName}</strong>
                        </span>
                        <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                          ₾{item.price.toFixed(2)} GEL
                        </span>
                      </div>

                      {/* Direct Complete & Settle Action Buttons */}
                      <div className="pt-1 flex items-center gap-1.5">
                        <button
                          onClick={() => completeService(item.id, 'cash')}
                          className="flex-1 px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all active:scale-[0.98]"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>{t('payment.cash', 'Paid Cash')}</span>
                        </button>
                        <button
                          onClick={() => completeService(item.id, 'card')}
                          className="flex-1 px-2.5 py-2 rounded-xl bg-[#18181B] dark:bg-[#27272A] border border-[#D4AF37] text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all hover:bg-[#27272A] active:scale-[0.98]"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{t('payment.card', 'Paid Card')}</span>
                        </button>
                        <button
                          onClick={() => cancelBooking(item.id, 'Cancelled in Shop')}
                          className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                          title="Cancel booking"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: COMPLETED & PAID */}
            <div 
              onDragOver={(e) => handleColDragOver(e, 'Completed')}
              onDragLeave={handleColDragLeave}
              onDrop={(e) => handleColDrop(e, 'Completed')}
              className={`kanban-col space-y-3 bg-[var(--bg-subtle)] border-emerald-500/30 transition-all duration-200 ${
                mobileKanbanStage === 'all'
                  ? 'w-[84vw] sm:w-[320px] md:w-auto shrink-0 snap-center'
                  : mobileKanbanStage === 'Completed'
                    ? 'w-full'
                    : 'hidden md:block md:w-auto'
              } ${
                dragOverCol === 'Completed' ? 'is-drag-over' : ''
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {t('book.col.completed', '3. Completed & Paid')}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[var(--bg-card)] border border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                    {completedList.length}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-500 font-bold">
                    +₾{completedValue.toFixed(2)}
                  </span>
                </div>
              </div>

              {dragOverCol === 'Completed' && (
                <div className="p-3 text-center border-2 border-dashed border-emerald-500 rounded-xl bg-emerald-500/10 text-xs text-emerald-500 font-bold animate-pulse">
                  + {t('book.dropToComplete', 'Drop here to Complete & Settle')}
                </div>
              )}

              <div className="space-y-3 min-h-[400px]">
                {completedList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-dim)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                    {t('book.noCompleted', 'No completed appointments yet.')}
                  </div>
                ) : (
                  completedList.map((item) => (
                    <div 
                      key={item.id} 
                      className="kanban-card p-4 space-y-2.5 bg-[var(--bg-card)] border-emerald-500/30 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {item.ticketNumber}
                        </span>
                        <span className="badge-status badge-gold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid {item.paymentMethod?.toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-[var(--text-main)]">{item.customerName}</h4>
                          {renderSourceBadge(item.source)}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.serviceName}</p>
                      </div>

                      {item.isStudent && (
                        <div className="text-[10px] font-bold text-[#D4AF37]">
                          ✓ {t('student.discount', 'Student 20% Discount')} (Charged ₾{item.price})
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)]">
                          Barber: <strong className="text-[var(--text-main)]">{item.barberName}</strong>
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-black text-emerald-500 dark:text-emerald-400 text-sm block">
                            +₾{item.price.toFixed(2)} GEL
                          </span>
                          <span className="text-[10px] text-[var(--text-dim)]">
                            {(() => {
                              const b = branchBarbers.find((bb) => bb.id === item.barberId);
                              const rate = b ? b.commissionRate : DEFAULT_COMMISSION_RATE;
                              return `${rate * 100}%: ₾${(item.price * rate).toFixed(2)}`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* 3. TABLE VIEW */
        <div className="card-executive p-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">{t('finance.th.ticket', 'Ticket')}</th>
                  <th className="pb-3 font-bold">{t('cust.th.clientName', 'Customer')}</th>
                  <th className="pb-3 font-bold">{t('cust.th.studentStatus', 'Student')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.channel', 'Source')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.service', 'Service')}</th>
                  <th className="pb-3 font-bold">{t('finance.th.barber', 'Barber')}</th>
                  <th className="pb-3 font-bold">{t('book.timeSlot', 'Slot Time')}</th>
                  <th className="pb-3 font-bold">{t('book.price', 'Price')}</th>
                  <th className="pb-3 font-bold">{t('book.status', 'Status')}</th>
                  <th className="pb-3 font-bold text-right">{t('book.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {branchBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                    <td className="py-3 font-mono font-bold text-[var(--text-main)]">{b.ticketNumber}</td>
                    <td className="py-3 font-bold text-[var(--text-main)]">
                      <div>{b.customerName}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">{b.customerPhone}</div>
                    </td>
                    <td className="py-3">
                      {b.isStudent ? (
                        <span className="badge-status badge-gold">Yes (-20%)</span>
                      ) : (
                        <span className="text-[var(--text-dim)]">{t('cust.regular', 'Regular')}</span>
                      )}
                    </td>
                    <td className="py-3">{renderSourceBadge(b.source)}</td>
                    <td className="py-3 text-[var(--text-muted)]">{b.serviceName}</td>
                    <td className="py-3 font-semibold text-[var(--text-main)]">{b.barberName}</td>
                    <td className="py-3 font-mono text-[var(--text-main)]">{b.time}</td>
                    <td className="py-3 font-mono font-bold text-[var(--text-main)]">
                      {b.originalPrice ? `₾${b.price.toFixed(2)}` : 'TBD'}
                    </td>
                    <td className="py-3">
                      <span className={`badge-status ${
                        isCompletedStatus(b.status) ? 'badge-gold' : isArrivedStatus(b.status) || isInServiceStatus(b.status) ? 'badge-amber' : isNoShowStatus(b.status) ? 'badge-red' : 'badge-neutral'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {isScheduledStatus(b.status) && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => markCustomerArrived(b.id)}
                            className="btn-primary-gold text-[10px] py-1 px-2"
                          >
                            {t('book.btn.markArrived', 'Arrived')}
                          </button>
                          <button
                            onClick={() => markNoShow(b.id)}
                            className="text-[10px] text-amber-500 hover:underline px-1"
                          >
                            {t('book.btn.noShow', 'No-Show')}
                          </button>
                          <button
                            onClick={() => cancelBooking(b.id, 'Cancelled in Table View')}
                            className="text-[10px] text-rose-500 hover:underline px-1 font-bold"
                          >
                            {t('book.btn.cancel', 'Cancel')}
                          </button>
                        </div>
                      )}
                      {(isArrivedStatus(b.status) || isInServiceStatus(b.status)) && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => completeService(b.id, 'cash')}
                            className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-500"
                          >
                            {t('payment.cash', 'Paid Cash')}
                          </button>
                          <button
                            onClick={() => completeService(b.id, 'card')}
                            className="px-2 py-1 bg-[#18181B] dark:bg-[#27272A] border border-[#D4AF37] text-[#D4AF37] rounded-lg text-[10px] font-bold"
                          >
                            {t('payment.card', 'Paid Card')}
                          </button>
                          <button
                            onClick={() => cancelBooking(b.id, 'Cancelled in Shop')}
                            className="text-[10px] text-rose-500 hover:underline px-1"
                          >
                            {t('book.btn.cancel', 'Cancel')}
                          </button>
                        </div>
                      )}
                      {isCancelledStatus(b.status) && (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[10px] text-rose-500 font-bold">{t('status.cancelled', 'Cancelled')}</span>
                          <button
                            onClick={() => updateBookingStatus(b.id, 'Scheduled')}
                            className="text-[10px] text-amber-500 hover:underline font-bold"
                          >
                            {t('book.btn.reopen', 'Re-open')}
                          </button>
                        </div>
                      )}
                      {isCompletedStatus(b.status) && (
                        <span className="text-[11px] text-emerald-500 font-semibold font-mono">Paid {b.paymentMethod?.toUpperCase()}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BOOK CLIENT MODAL */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)]">{t('book.modal.bookTitle', 'Create New Appointment Booking')}</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {(() => {
                      const service = services.find((s) => s.id === selectedServiceId);
                      const name = service ? service.name : 'Unknown Service';
                      const basePrice = service?.price ?? 0;
                      return `Core Service: ${name} (${(basePrice).toFixed(2)} GEL) with Student Discount`;
                    })()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors"
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
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('book.modal.customerName', 'Customer Name *')}</label>
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
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('book.modal.customerPhone', 'Customer Phone *')}</label>
                <input
                  type="tel"
                  required
                  placeholder="+995 599 123 456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full"
                />
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
                    {(() => {
                      const service = services.find((s) => s.id === selectedServiceId);
                      const name = service ? service.name : 'Service';
                      const basePrice = service?.price ?? 0;
                      const discounted = calcNetPrice(basePrice, true);
                      return t('walkin.studentDiscount', `Student Discount (${STUDENT_DISCOUNT_PERCENT}% Off: ${name} = ${(discounted).toFixed(2)} GEL)`);
                    })()}
                  </span>
                </label>

                {isStudent && (
                  <div className="pt-1.5 border-t border-[var(--border-subtle)] space-y-1 animate-in fade-in">
                    <label className="block text-[11px] text-[var(--text-muted)] font-medium">{t('walkin.studentProof', 'Student ID Proof / Card #')}</label>
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
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('walkin.allergies', 'Allergies / Special Notes')}</label>
                <input
                  type="text"
                  placeholder="e.g. None, or Sensitive to alcohol aftershaves"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Booking Source */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('book.modal.bookingSource', 'Booking Channel / Source *')}</label>
                <select
                  value={bookingSource}
                  onChange={(e) => setBookingSource(e.target.value as BookingSource)}
                  className="w-full font-semibold"
                >
                  {SOURCES.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              {/* Select Barber */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('book.modal.selectBarber', 'Select Barber Station *')}</label>
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

              {/* Select Service */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1">{t('book.modal.selectService', 'Select Service *')}</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full font-semibold"
                >
                  {services.map((s) => {
                    if (s.isTbd || s.price === null) {
                      return <option key={s.id} value={s.id}>{s.name} — Price TBD ({s.duration} min)</option>;
                    }
                    const discounted = calcNetPrice(s.price, true);
                    const priceDisplay = isStudent ? `₾${discounted.toFixed(2)} GEL (Student -${STUDENT_DISCOUNT_PERCENT}%)` : `₾${s.price.toFixed(2)} GEL`;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} — {priceDisplay} ({s.duration} min)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="block text-[var(--text-muted)] font-semibold mb-1.5 flex items-center justify-between">
                  <span>{t('book.modal.selectTimeSlot', 'Select Time Slot *')}</span>
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
                  {t('action.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn-primary-gold">
                  {t('book.modal.confirmBooking', 'Confirm Appointment Booking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DRAG & DROP / DIRECT CHECKOUT MODAL */}
      {paymentModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[#D4AF37] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)]">{t('book.modal.completeTitle', 'Complete Service & Record Payment')}</h3>
                  <p className="text-xs text-[var(--text-muted)]">Record revenue & calculate barber earnings</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalBooking(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[var(--bg-subtle)] p-4 rounded-xl space-y-2 border border-[var(--border-subtle)] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">{t('finance.th.ticket', 'Ticket')}:</span>
                <span className="font-mono font-bold text-[var(--text-main)]">{paymentModalBooking.ticketNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">{t('cust.th.clientName', 'Customer')}:</span>
                <span className="font-bold text-[var(--text-main)]">{paymentModalBooking.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">{t('finance.th.barber', 'Barber')}:</span>
                <span className="font-bold text-[var(--text-main)]">{paymentModalBooking.barberName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">{t('finance.th.service', 'Service')}:</span>
                <span className="font-bold text-[var(--text-main)]">{paymentModalBooking.serviceName}</span>
              </div>
              {paymentModalBooking.isStudent && (
                <div className="flex items-center justify-between text-[#D4AF37]">
                  <span>{t('student.discount', 'Student 20% Discount')}:</span>
                  <span>-₾{paymentModalBooking.discountAmount} GEL</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 mt-2">
                <span className="text-sm font-bold text-[var(--text-main)]">{t('walkin.ticketTotal', 'Ticket Total:')}</span>
                <span className="font-mono text-xl font-black text-[#D4AF37]">₾{paymentModalBooking.price.toFixed(2)} GEL</span>
              </div>
              <div className="text-[10px] text-[var(--text-dim)]">
                {(() => {
                  const b = branchBarbers.find(bb => bb.id === paymentModalBooking.barberId);
                  const rate = b ? b.commissionRate : DEFAULT_COMMISSION_RATE;
                  return (
                    <>{rate * 100}% Barber Cut: <strong>₾{(paymentModalBooking.price * rate).toFixed(2)} GEL</strong> will be credited to {paymentModalBooking.barberName}'s balance.</>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  completeService(paymentModalBooking.id, 'cash');
                  setSuccessMessage(`✓ Collected ₾${paymentModalBooking.price} Cash for ${paymentModalBooking.customerName}!`);
                  setPaymentModalBooking(null);
                  setTimeout(() => setSuccessMessage(null), 3500);
                }}
                className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Banknote className="w-5 h-5" />
                <span>{t('book.modal.confirmCash', 'Confirm Cash Payment')}</span>
              </button>

              <button
                onClick={() => {
                  completeService(paymentModalBooking.id, 'card');
                  setSuccessMessage(`✓ Collected ₾${paymentModalBooking.price} Card for ${paymentModalBooking.customerName}!`);
                  setPaymentModalBooking(null);
                  setTimeout(() => setSuccessMessage(null), 3500);
                }}
                className="p-3.5 rounded-xl bg-[#18181B] dark:bg-[#27272A] hover:bg-[#27272A] border border-[#D4AF37] text-[#D4AF37] font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <CreditCard className="w-5 h-5" />
                <span>{t('book.modal.confirmCard', 'Confirm Card Payment')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK WALK-IN MODAL */}
      {/* ========================================================================= */}
      {isWalkInOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-main)]">{t('walkin.quickWalkInTitle', 'Quick Walk-In Register')}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{t('walkin.instantCheckout', 'Immediate Chair Seating & Express Checkout')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsWalkInOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  {t('cust.th.clientName', 'Customer Name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Melikidze"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[#D4AF37] transition-all text-xs"
                />
              </div>

              {/* Barber Selector */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  {t('finance.th.barber', 'Assign Barber')} *
                </label>
                <select
                  value={walkInBarberId}
                  onChange={(e) => setWalkInBarberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] focus:outline-hidden focus:border-[#D4AF37] transition-all text-xs"
                >
                  {branchBarbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.specialty}) • {Math.round(b.commissionRate * 100)}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Selector */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  {t('finance.th.service', 'Select Service')} *
                </label>
                <select
                  value={walkInServiceId}
                  onChange={(e) => setWalkInServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] focus:outline-hidden focus:border-[#D4AF37] transition-all text-xs"
                >
                  {services.map((s) => {
                    const price = s.price !== null ? `₾${s.price.toFixed(2)} GEL` : 'Price TBD';
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} — {price} ({s.duration} min)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Student Discount Checkbox */}
              <div className="bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border-subtle)]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkInIsStudent}
                    onChange={(e) => setWalkInIsStudent(e.target.checked)}
                    className="w-4 h-4 rounded-md text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--text-main)]">
                    <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('walkin.studentDiscount', 'Student Discount')} ({STUDENT_DISCOUNT_PERCENT}% Off)</span>
                  </div>
                </label>
              </div>

              {/* Summary calculation card */}
              {(() => {
                const service = services.find((s) => s.id === walkInServiceId);
                const barber = branchBarbers.find((b) => b.id === walkInBarberId);
                const price = service?.price ?? 0;
                const discount = walkInIsStudent ? calcStudentDiscount(price, true) : 0;
                const finalPrice = walkInIsStudent ? calcNetPrice(price, true) : price;
                const barberRate = barber ? barber.commissionRate : DEFAULT_COMMISSION_RATE;
                const barberCut = finalPrice * barberRate;

                return (
                  <div className="bg-[var(--bg-subtle)] p-3.5 rounded-xl border border-[var(--border-subtle)] space-y-1.5">
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>{t('walkin.basePrice', 'Service List Price')}:</span>
                      <span>₾{price.toFixed(2)} GEL</span>
                    </div>
                    {walkInIsStudent && (
                      <div className="flex justify-between text-[#D4AF37]">
                        <span>{t('student.discount', 'Student Discount')} (-{STUDENT_DISCOUNT_PERCENT}%):</span>
                        <span>-₾{discount.toFixed(2)} GEL</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-[var(--text-main)] pt-1.5 border-t border-[var(--border-subtle)]">
                      <span>{t('walkin.ticketTotal', 'Ticket Total:')}</span>
                      <span className="text-[#D4AF37] font-mono text-base">₾{finalPrice.toFixed(2)} GEL</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-dim)] pt-0.5">
                      {Math.round(barberRate * 100)}% Barber Cut: <strong>₾{barberCut.toFixed(2)} GEL</strong> credited to {barber?.name || 'Barber'}.
                    </div>
                  </div>
                );
              })()}

              {/* Immediate Payment Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleWalkInSubmit('cash')}
                  className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Banknote className="w-5 h-5" />
                  <span>{t('walkin.instantCash', 'Collect Cash & Complete')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWalkInSubmit('card')}
                  className="p-3 rounded-xl bg-[#18181B] dark:bg-[#27272A] hover:bg-[#27272A] border border-[#D4AF37] text-[#D4AF37] font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{t('walkin.instantCard', 'Charge Card & Complete')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
