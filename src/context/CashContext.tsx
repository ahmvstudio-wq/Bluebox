import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Branch, 
  BranchId, 
  Barber, 
  ServiceItem, 
  BookingAppointment, 
  Customer, 
  Expense, 
  ExpenseCategory,
  BarberWithdrawal,
  RevenueRecord,
  BookingStatus,
  BookingSource,
  AuthUser,
  AdminUser,
  BarberUser,
  DailyCloseStatus,
  DailyBranchReconciliation
} from '../types';
import { 
  DEFAULT_ADMIN,
  INITIAL_BRANCHES, 
  INITIAL_BARBERS, 
  INITIAL_SERVICES, 
  INITIAL_BOOKINGS, 
  INITIAL_CUSTOMERS, 
  INITIAL_EXPENSES, 
  INITIAL_WITHDRAWALS 
} from '../mockData';

export interface BarberStats {
  barber: Barber;
  clientsServedToday: number;
  servicesCompleted: number;
  revenueGenerated: number;
  workingHours: number;
  barberEarnings: number;
  monthEarnings: number;
  totalWithdrawn: number;
  remainingOwed: number;
}

interface CashContextType {
  // Auth & RBAC
  currentUser: AuthUser | null;
  loginAsAdmin: () => void;
  loginAsBarber: (barberId: string) => boolean;
  logout: () => void;

  // Master Data
  currentBranch: BranchId;
  setCurrentBranch: (branch: BranchId) => void;
  branches: Branch[];
  barbers: Barber[];
  services: ServiceItem[];
  bookings: BookingAppointment[];
  customers: Customer[];
  expenses: Expense[];
  withdrawals: BarberWithdrawal[];
  revenueRecords: RevenueRecord[];

  // Filtered to active branch (Admin View)
  branchBarbers: Barber[];
  branchBookings: BookingAppointment[];
  branchExpenses: Expense[];
  branchWithdrawals: BarberWithdrawal[];
  branchRevenueRecords: RevenueRecord[];

  // 1. Dashboard Metrics (Admin View)
  todayCustomers: number;
  todayRevenue: number;
  todayBookingsCount: number;
  todayWalkInsCount: number;
  revenueByBarber: Record<string, number>;
  clientsByBarber: Record<string, number>;
  barberPerformanceList: BarberStats[];

  // 6. Financial Overview Metrics (Admin View)
  totalExpenses: number;
  totalWithdrawals: number;
  netProfit: number;
  cashInDrawer: number;
  expensesByCategory: Record<ExpenseCategory, number>;

  // 2. Personal Barber Metrics (Barber RBAC View)
  currentBarber: Barber | null;
  myAppointments: BookingAppointment[];
  myClientsToday: number;
  myServicesCompletedToday: number;
  myTodayEarnings: number;
  myMonthEarnings: number;
  myWithdrawals: BarberWithdrawal[];
  myTotalWithdrawn: number;
  myRemainingBalance: number;

  // Actions
  createBooking: (data: {
    customerName: string;
    customerPhone: string;
    barberId: string;
    serviceId: string;
    time: string;
    source?: BookingSource;
    isStudent?: boolean;
    studentIdProof?: string;
    allergies?: string;
  }) => { success: boolean; error?: string };

  markCustomerArrived: (bookingId: string) => void;
  markCustomerInService: (bookingId: string) => void;
  markNoShow: (bookingId: string) => void;
  completeService: (bookingId: string, paymentMethod: 'cash' | 'card') => void;
  updateBookingStatus: (
    bookingId: string,
    status: BookingStatus,
    paymentMethod?: 'cash' | 'card'
  ) => void;

  addWalkIn: (data: {
    customerName: string;
    customerPhone?: string;
    barberId: string;
    serviceId: string;
    paymentMethod: 'cash' | 'card';
    source?: BookingSource;
    isStudent?: boolean;
    studentIdProof?: string;
    allergies?: string;
  }) => void;

  addExpense: (
    title: string, 
    amount: number, 
    category?: ExpenseCategory, 
    description?: string, 
    branchId?: BranchId
  ) => void;
  addWithdrawal: (barberId: string, amount: number, reason: string) => void;
  updateBarberCommission: (barberId: string, newRate: number, workingHours?: number) => void;

  // Daily Close & Cash Reconciliation
  reconciliations: Record<BranchId, DailyBranchReconciliation>;
  performDailyClose: (branchId: BranchId, countedCash: number, notes?: string) => void;
  updateReconciliationStatus: (branchId: BranchId, status: DailyCloseStatus) => void;

  // Commission Pricing Base Rule ('discounted' actual paid vs 'list_price' full gross)
  commissionBaseRule: 'discounted' | 'list_price';
  setCommissionBaseRule: (rule: 'discounted' | 'list_price') => void;
  
  // Theme (Light / Dark)
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  resetToDefaultData: () => void;
}

const CashContext = createContext<CashContextType | undefined>(undefined);

// Normalize status matching helper
export const isCompletedStatus = (s: string) => s === 'Completed' || s === 'completed';
export const isArrivedStatus = (s: string) => s === 'Arrived' || s === 'arrived';
export const isInServiceStatus = (s: string) => s === 'In Service' || s === 'in_service';
export const isScheduledStatus = (s: string) => s === 'Scheduled' || s === 'scheduled';
export const isNoShowStatus = (s: string) => s === 'No-show' || s === 'no_show';
export const isCancelledStatus = (s: string) => s === 'Cancelled' || s === 'cancelled';
export const isRescheduledStatus = (s: string) => s === 'Rescheduled' || s === 'rescheduled';

export const CashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state with HTML root class management
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('bb_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('bb_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Schema version management to seamlessly reload the new mock dataset and admin name
  const DATA_VERSION = 'v6_blackbox_customers_date_filter';
  useEffect(() => {
    const storedVersion = localStorage.getItem('bb_data_version');
    if (storedVersion !== DATA_VERSION) {
      localStorage.setItem('bb_data_version', DATA_VERSION);
      localStorage.removeItem('bb_auth_user');
      localStorage.removeItem('bb_barbers');
      localStorage.removeItem('bb_services');
      localStorage.removeItem('bb_bookings');
      localStorage.removeItem('bb_customers');
      localStorage.removeItem('bb_expenses');
      localStorage.removeItem('bb_withdrawals');
      localStorage.removeItem('bb_revenue_records');
    }
  }, []);

  // 1. Auth state with persistence
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('bb_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin') {
          return DEFAULT_ADMIN;
        }
        return parsed;
      } catch {
        return DEFAULT_ADMIN;
      }
    }
    return DEFAULT_ADMIN;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bb_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bb_auth_user');
    }
  }, [currentUser]);

  // 2. Branch & Core entities with localStorage persistence
  const [currentBranch, setCurrentBranch] = useState<BranchId>('marjane');
  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  
  const [barbers, setBarbers] = useState<Barber[]>(() => {
    const saved = localStorage.getItem('bb_barbers');
    return saved ? JSON.parse(saved) : INITIAL_BARBERS;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('bb_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [bookings, setBookings] = useState<BookingAppointment[]>(() => {
    const saved = localStorage.getItem('bb_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('bb_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('bb_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [withdrawals, setWithdrawals] = useState<BarberWithdrawal[]>(() => {
    const saved = localStorage.getItem('bb_withdrawals');
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
  });

  // Revenue records generated from completed services
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>(() => {
    const saved = localStorage.getItem('bb_revenue_records');
    if (saved) return JSON.parse(saved);

    // Populate initial completed appointments into revenue records
    return INITIAL_BOOKINGS
      .filter((b) => isCompletedStatus(b.status))
      .map((b) => ({
        id: 'rev-' + b.id,
        ticketNumber: b.ticketNumber,
        serviceName: b.serviceName,
        customerName: b.customerName,
        barberId: b.barberId,
        barberName: b.barberName,
        branchId: b.branchId,
        amount: b.price,
        paymentMethod: b.paymentMethod || 'cash',
        dateTime: b.createdAt || 'Today',
      }));
  });

  useEffect(() => {
    localStorage.setItem('bb_barbers', JSON.stringify(barbers));
  }, [barbers]);

  useEffect(() => {
    localStorage.setItem('bb_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('bb_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('bb_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('bb_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('bb_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('bb_revenue_records', JSON.stringify(revenueRecords));
  }, [revenueRecords]);

  // Reset to default data helper
  const resetToDefaultData = () => {
    setBarbers(INITIAL_BARBERS);
    setServices(INITIAL_SERVICES);
    setBookings(INITIAL_BOOKINGS);
    setCustomers(INITIAL_CUSTOMERS);
    setExpenses(INITIAL_EXPENSES);
    setWithdrawals(INITIAL_WITHDRAWALS);
    setRevenueRecords(
      INITIAL_BOOKINGS
        .filter((b) => isCompletedStatus(b.status))
        .map((b) => ({
          id: 'rev-' + b.id,
          ticketNumber: b.ticketNumber,
          serviceName: b.serviceName,
          customerName: b.customerName,
          barberId: b.barberId,
          barberName: b.barberName,
          branchId: b.branchId,
          amount: b.price,
          paymentMethod: b.paymentMethod || 'cash',
          dateTime: b.createdAt || 'Today',
        }))
    );
    localStorage.removeItem('bb_barbers');
    localStorage.removeItem('bb_services');
    localStorage.removeItem('bb_bookings');
    localStorage.removeItem('bb_customers');
    localStorage.removeItem('bb_expenses');
    localStorage.removeItem('bb_withdrawals');
    localStorage.removeItem('bb_revenue_records');
  };

  // 3. RBAC Handlers
  const loginAsAdmin = () => {
    setCurrentUser(DEFAULT_ADMIN);
  };

  const loginAsBarber = (barberId: string): boolean => {
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber) return false;

    const barberUser: BarberUser = {
      role: 'barber',
      barberId: barber.id,
      name: barber.name,
      avatar: barber.avatar,
      branchId: barber.branchId,
      specialty: barber.specialty,
    };
    setCurrentUser(barberUser);
    setCurrentBranch(barber.branchId);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // 4. Branch Filtered Collections (Admin Mode)
  const branchBarbers = useMemo(() => {
    return barbers.filter((b) => b.branchId === currentBranch);
  }, [barbers, currentBranch]);

  const branchBookings = useMemo(() => {
    return bookings.filter((b) => b.branchId === currentBranch);
  }, [bookings, currentBranch]);

  const branchExpenses = useMemo(() => {
    return expenses.filter((e) => e.branchId === currentBranch);
  }, [expenses, currentBranch]);

  const branchWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => w.branchId === currentBranch);
  }, [withdrawals, currentBranch]);

  const branchRevenueRecords = useMemo(() => {
    return revenueRecords.filter((r) => r.branchId === currentBranch);
  }, [revenueRecords, currentBranch]);

  // Admin Dashboard Calculations
  const completedBookings = useMemo(() => {
    return branchBookings.filter((b) => isCompletedStatus(b.status));
  }, [branchBookings]);

  const todayCustomers = completedBookings.length;

  const todayRevenue = useMemo(() => {
    return completedBookings.reduce((sum, b) => sum + b.price, 0);
  }, [completedBookings]);

  const todayBookingsCount = useMemo(() => {
    return branchBookings.filter((b) => b.type === 'booking').length;
  }, [branchBookings]);

  const todayWalkInsCount = useMemo(() => {
    return branchBookings.filter((b) => b.type === 'walk-in').length;
  }, [branchBookings]);

  const revenueByBarber = useMemo(() => {
    const map: Record<string, number> = {};
    completedBookings.forEach((b) => {
      map[b.barberId] = (map[b.barberId] || 0) + b.price;
    });
    return map;
  }, [completedBookings]);

  const clientsByBarber = useMemo(() => {
    const map: Record<string, number> = {};
    completedBookings.forEach((b) => {
      map[b.barberId] = (map[b.barberId] || 0) + 1;
    });
    return map;
  }, [completedBookings]);

  const barberPerformanceList: BarberStats[] = useMemo(() => {
    return branchBarbers.map((barber) => {
      const bCompleted = completedBookings.filter((b) => b.barberId === barber.id);
      const clientsServedToday = bCompleted.length;
      const servicesCompleted = clientsServedToday;
      const revenueGenerated = bCompleted.reduce((sum, b) => sum + b.price, 0);
      const barberEarnings = revenueGenerated * barber.commissionRate;
      const monthEarnings = barber.monthBaseEarnings + barberEarnings;

      const bWithdrawals = branchWithdrawals.filter((w) => w.barberId === barber.id);
      const totalWithdrawn = bWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      const remainingOwed = Math.max(0, monthEarnings - totalWithdrawn);

      return {
        barber,
        clientsServedToday,
        servicesCompleted,
        revenueGenerated,
        workingHours: barber.workingHours,
        barberEarnings,
        monthEarnings,
        totalWithdrawn,
        remainingOwed,
      };
    });
  }, [branchBarbers, completedBookings, branchWithdrawals]);

  const totalExpenses = useMemo(() => {
    return branchExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [branchExpenses]);

  const expensesByCategory = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      'Business': 0,
      'Barber/worker': 0,
      'Customer-related': 0,
      'Operational': 0,
    };
    branchExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [branchExpenses]);

  const totalWithdrawals = useMemo(() => {
    return branchWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  }, [branchWithdrawals]);

  const netProfit = useMemo(() => {
    return todayRevenue - totalExpenses;
  }, [todayRevenue, totalExpenses]);

  const activeBranchObj = branches.find((b) => b.id === currentBranch) || branches[0];
  const cashInDrawer = useMemo(() => {
    const cashIncome = completedBookings
      .filter((b) => b.paymentMethod === 'cash')
      .reduce((sum, b) => sum + b.price, 0);
    return activeBranchObj.initialCashDrawer + cashIncome - totalExpenses - totalWithdrawals;
  }, [activeBranchObj, completedBookings, totalExpenses, totalWithdrawals]);

  // 5. Personal Barber Context (Barber RBAC Mode)
  const currentBarber = useMemo(() => {
    if (!currentUser || currentUser.role !== 'barber') return null;
    return barbers.find((b) => b.id === currentUser.barberId) || null;
  }, [currentUser, barbers]);

  const myAppointments = useMemo(() => {
    if (!currentBarber) return [];
    return bookings.filter((b) => b.barberId === currentBarber.id);
  }, [bookings, currentBarber]);

  const myCompletedAppointments = useMemo(() => {
    return myAppointments.filter((b) => isCompletedStatus(b.status));
  }, [myAppointments]);

  const myClientsToday = myCompletedAppointments.length;
  const myServicesCompletedToday = myCompletedAppointments.length;

  const myTodayEarnings = useMemo(() => {
    if (!currentBarber) return 0;
    const gross = myCompletedAppointments.reduce((sum, b) => sum + b.price, 0);
    return gross * currentBarber.commissionRate;
  }, [myCompletedAppointments, currentBarber]);

  const myMonthEarnings = useMemo(() => {
    if (!currentBarber) return 0;
    return currentBarber.monthBaseEarnings + myTodayEarnings;
  }, [currentBarber, myTodayEarnings]);

  const myWithdrawals = useMemo(() => {
    if (!currentBarber) return [];
    return withdrawals.filter((w) => w.barberId === currentBarber.id);
  }, [withdrawals, currentBarber]);

  const myTotalWithdrawn = useMemo(() => {
    return myWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  }, [myWithdrawals]);

  const myRemainingBalance = useMemo(() => {
    return Math.max(0, myMonthEarnings - myTotalWithdrawn);
  }, [myMonthEarnings, myTotalWithdrawn]);

  // ==========================================
  // CORE OPERATIONS (APPOINTMENTS & REVENUE)
  // ==========================================
  const createBooking = (data: {
    customerName: string;
    customerPhone: string;
    barberId: string;
    serviceId: string;
    time: string;
    source?: BookingSource;
    isStudent?: boolean;
    studentIdProof?: string;
    allergies?: string;
  }) => {
    // Check double booking for that barber
    const conflict = bookings.find(
      (b) => b.barberId === data.barberId && b.time === data.time && !isCompletedStatus(b.status) && !isCancelledStatus(b.status)
    );

    if (conflict) {
      return {
        success: false,
        error: `Slot ${data.time} is already booked for this barber with ${conflict.customerName}. Please select another time.`,
      };
    }

    const barber = barbers.find((b) => b.id === data.barberId);
    const service = services.find((s) => s.id === data.serviceId);
    if (!barber || !service) return { success: false, error: 'Invalid selection' };

    // Student 20% discount calculation
    const originalPrice = service.price;
    const isStudent = !!data.isStudent;
    const discountPercent = isStudent ? 20 : 0;
    const discountAmount = isStudent && originalPrice ? originalPrice * 0.2 : 0;
    const netPrice = originalPrice ? originalPrice - discountAmount : 0;

    const newBooking: BookingAppointment = {
      id: 'apt-' + Date.now(),
      ticketNumber: '#BB-' + Math.floor(100 + Math.random() * 900),
      branchId: barber.branchId,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim() || '+995 5xx xxx xxx',
      isStudent,
      studentIdProof: data.studentIdProof?.trim() || (isStudent ? 'Verified Student ID' : undefined),
      allergies: data.allergies?.trim() || 'None',
      barberId: barber.id,
      barberName: barber.name,
      serviceId: service.id,
      serviceName: service.name,
      originalPrice,
      discountPercent,
      discountAmount,
      price: netPrice,
      time: data.time,
      source: data.source || 'Phone',
      type: 'booking',
      status: 'Scheduled',
      createdAt: 'Today, ' + new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }),
      isNoShowGraceExpired: false,
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Upsert customer in directory
    setCustomers((prev) => {
      const found = prev.find((c) => c.name.toLowerCase() === data.customerName.trim().toLowerCase());
      if (found) {
        return prev.map((c) => 
          c.id === found.id 
            ? { ...c, isStudent: isStudent || c.isStudent, allergies: data.allergies || c.allergies } 
            : c
        );
      }
      return [
        {
          id: 'c-' + Date.now(),
          name: data.customerName.trim(),
          phone: data.customerPhone.trim() || '+995 5xx xxx xxx',
          isStudent,
          studentIdProof: data.studentIdProof?.trim(),
          allergies: data.allergies?.trim() || 'None',
          totalVisits: 0,
          totalSpent: 0,
          lastVisit: 'Pending Appointment',
          preferredBarber: barber.name,
          history: [],
        },
        ...prev,
      ];
    });

    return { success: true };
  };

  const markCustomerArrived = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Arrived' } : b))
    );
  };

  const markCustomerInService = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'In Service' } : b))
    );
  };

  const markNoShow = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'No-show', isNoShowGraceExpired: true } : b))
    );
  };

  const completeService = (bookingId: string, paymentMethod: 'cash' | 'card') => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // 1. Update booking status
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'Completed', paymentMethod }
          : b
      )
    );

    // 2. Record Revenue Entry
    const newRevRecord: RevenueRecord = {
      id: 'rev-' + Date.now(),
      ticketNumber: booking.ticketNumber,
      serviceName: booking.serviceName,
      customerName: booking.customerName,
      barberId: booking.barberId,
      barberName: booking.barberName,
      branchId: booking.branchId,
      amount: booking.price,
      paymentMethod,
      dateTime: 'Today, ' + new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    setRevenueRecords((prev) => [newRevRecord, ...prev]);

    // 3. Update customer directory visit record
    setCustomers((prev) => {
      return prev.map((c) => {
        if (c.name.toLowerCase() === booking.customerName.toLowerCase()) {
          return {
            ...c,
            totalVisits: c.totalVisits + 1,
            totalSpent: c.totalSpent + booking.price,
            lastVisit: 'Today',
            preferredBarber: booking.barberName,
            history: [
              {
                date: 'Today',
                serviceName: booking.serviceName + (booking.isStudent ? ' (Student 20% Off)' : ''),
                barberName: booking.barberName,
                amount: booking.price,
                paymentMethod,
                type: booking.type,
              },
              ...c.history,
            ],
          };
        }
        return c;
      });
    });
  };

  const updateBookingStatus = (
    bookingId: string,
    status: BookingStatus,
    paymentMethod: 'cash' | 'card' = 'cash'
  ) => {
    if (isCompletedStatus(status)) {
      completeService(bookingId, paymentMethod);
      return;
    }

    if (isArrivedStatus(status)) {
      markCustomerArrived(bookingId);
      return;
    }

    if (isInServiceStatus(status)) {
      markCustomerInService(bookingId);
      return;
    }

    if (isNoShowStatus(status)) {
      markNoShow(bookingId);
      return;
    }

    // Scheduled, Cancelled, Rescheduled
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status, paymentMethod: undefined } : b))
    );
  };

  const addWalkIn = (data: {
    customerName: string;
    customerPhone?: string;
    barberId: string;
    serviceId: string;
    paymentMethod: 'cash' | 'card';
    source?: BookingSource;
    isStudent?: boolean;
    studentIdProof?: string;
    allergies?: string;
  }) => {
    const barber = barbers.find((b) => b.id === data.barberId);
    const service = services.find((s) => s.id === data.serviceId);
    if (!barber || !service) return;

    const timeNow = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Tbilisi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const isStudent = !!data.isStudent;
    const originalPrice = service.price;
    const discountPercent = isStudent ? 20 : 0;
    const discountAmount = isStudent && originalPrice ? originalPrice * 0.2 : 0;
    const netPrice = originalPrice ? originalPrice - discountAmount : 0;

    const newTicket: BookingAppointment = {
      id: 'apt-' + Date.now(),
      ticketNumber: '#BB-' + Math.floor(100 + Math.random() * 900),
      branchId: barber.branchId,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone?.trim() || '+995 5xx xxx xxx',
      isStudent,
      studentIdProof: data.studentIdProof?.trim() || (isStudent ? 'Verified Student ID' : undefined),
      allergies: data.allergies?.trim() || 'None',
      barberId: barber.id,
      barberName: barber.name,
      serviceId: service.id,
      serviceName: service.name,
      originalPrice,
      discountPercent,
      discountAmount,
      price: netPrice,
      time: timeNow,
      source: data.source || 'Walk-in',
      type: 'walk-in',
      status: 'Completed',
      paymentMethod: data.paymentMethod,
      createdAt: 'Today, ' + timeNow,
    };

    setBookings((prev) => [newTicket, ...prev]);

    // Record Revenue
    const newRevRecord: RevenueRecord = {
      id: 'rev-' + Date.now(),
      ticketNumber: newTicket.ticketNumber,
      serviceName: newTicket.serviceName,
      customerName: newTicket.customerName,
      barberId: newTicket.barberId,
      barberName: newTicket.barberName,
      branchId: newTicket.branchId,
      amount: newTicket.price,
      paymentMethod: data.paymentMethod,
      dateTime: 'Today, ' + timeNow,
    };
    setRevenueRecords((prev) => [newRevRecord, ...prev]);

    // Upsert customer
    setCustomers((prev) => {
      const found = prev.find((c) => c.name.toLowerCase() === data.customerName.trim().toLowerCase());
      if (found) {
        return prev.map((c) =>
          c.id === found.id
            ? {
                ...c,
                totalVisits: c.totalVisits + 1,
                totalSpent: c.totalSpent + netPrice,
                lastVisit: 'Today',
                history: [
                  {
                    date: 'Today',
                    serviceName: service.name + (isStudent ? ' (Student 20% Off)' : ''),
                    barberName: barber.name,
                    amount: netPrice,
                    paymentMethod: data.paymentMethod,
                    type: 'walk-in' as const,
                  },
                  ...c.history,
                ],
              }
            : c
        );
      }
      return [
        {
          id: 'c-' + Date.now(),
          name: data.customerName.trim(),
          phone: data.customerPhone?.trim() || '+995 5xx xxx xxx',
          isStudent,
          studentIdProof: data.studentIdProof?.trim(),
          allergies: data.allergies?.trim() || 'None',
          totalVisits: 1,
          totalSpent: netPrice,
          lastVisit: 'Today',
          preferredBarber: barber.name,
          history: [
            {
              date: 'Today',
              serviceName: service.name + (isStudent ? ' (Student 20% Off)' : ''),
              barberName: barber.name,
              amount: netPrice,
              paymentMethod: data.paymentMethod,
              type: 'walk-in' as const,
            },
          ],
        },
        ...prev,
      ];
    });
  };

  const addExpense = (
    title: string, 
    amount: number, 
    category: ExpenseCategory = 'Operational', 
    description?: string,
    branchId?: BranchId
  ) => {
    const newExpense: Expense = {
      id: 'e-' + Date.now(),
      branchId: branchId || currentBranch,
      category,
      title: title.trim(),
      amount: Math.abs(amount),
      date: 'Today',
      description: description?.trim() || undefined,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const addWithdrawal = (barberId: string, amount: number, reason: string) => {
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber) return;

    const newWithdrawal: BarberWithdrawal = {
      id: 'w-' + Date.now(),
      branchId: barber.branchId,
      barberId: barber.id,
      barberName: barber.name,
      amount: Math.abs(amount),
      date: 'Today',
      reason: reason.trim() || 'Mid-month cash advance',
    };
    setWithdrawals((prev) => [newWithdrawal, ...prev]);
  };

  const updateBarberCommission = (barberId: string, newRate: number, workingHours?: number) => {
    setBarbers((prev) => {
      const updated = prev.map((b) => {
        if (b.id === barberId) {
          return {
            ...b,
            commissionRate: Math.max(0, Math.min(1, newRate)),
            workingHours: workingHours !== undefined ? workingHours : b.workingHours,
          };
        }
        return b;
      });
      localStorage.setItem('bb_barbers', JSON.stringify(updated));
      return updated;
    });
  };

  // Commission Base Rule ('discounted' actual paid vs 'list_price' full gross)
  const [commissionBaseRule, setCommissionBaseRule] = useState<'discounted' | 'list_price'>(() => {
    const saved = localStorage.getItem('bb_commission_base_rule');
    return saved === 'list_price' ? 'list_price' : 'discounted';
  });

  const handleSetCommissionBaseRule = (rule: 'discounted' | 'list_price') => {
    setCommissionBaseRule(rule);
    localStorage.setItem('bb_commission_base_rule', rule);
  };

  // Daily Cash Reconciliation & Close per branch
  const [reconciliationOverrides, setReconciliationOverrides] = useState<Record<string, Partial<DailyBranchReconciliation>>>(() => {
    const saved = localStorage.getItem('bb_reconciliations');
    return saved ? JSON.parse(saved) : {};
  });

  const reconciliations: Record<BranchId, DailyBranchReconciliation> = useMemo(() => {
    const map: Record<BranchId, DailyBranchReconciliation> = {} as any;
    branches.forEach((branch) => {
      const bBookings = bookings.filter((b) => b.branchId === branch.id && isCompletedStatus(b.status));
      const bCashSales = bBookings.filter((b) => b.paymentMethod === 'cash').reduce((sum, b) => sum + b.price, 0);
      const bCardSales = bBookings.filter((b) => b.paymentMethod === 'card').reduce((sum, b) => sum + b.price, 0);
      const bExpenses = expenses.filter((e) => e.branchId === branch.id).reduce((sum, e) => sum + e.amount, 0);
      const bAdvances = withdrawals.filter((w) => w.branchId === branch.id).reduce((sum, w) => sum + w.amount, 0);
      
      const expectedCash = branch.initialCashDrawer + bCashSales - bExpenses - bAdvances;
      const override = reconciliationOverrides[branch.id] || {};
      const status: DailyCloseStatus = override.status || 'open';
      const countedCash = override.countedCash;
      const variance = countedCash !== undefined ? countedCash - expectedCash : undefined;

      map[branch.id] = {
        id: `rec-${branch.id}-2026-09-15`,
        branchId: branch.id,
        date: '2026-09-15',
        status,
        openingFloat: branch.initialCashDrawer,
        cashSales: bCashSales,
        cardSales: bCardSales,
        cashExpenses: bExpenses,
        barberAdvances: bAdvances,
        expectedCash,
        countedCash,
        variance,
        closedBy: override.closedBy,
        closedAt: override.closedAt,
        notes: override.notes,
      };
    });
    return map;
  }, [branches, bookings, expenses, withdrawals, reconciliationOverrides]);

  const performDailyClose = (branchId: BranchId, countedCash: number, notes?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const rec = reconciliations[branchId];
    const variance = countedCash - (rec?.expectedCash || 0);

    setReconciliationOverrides((prev) => {
      const updated = {
        ...prev,
        [branchId]: {
          status: 'closed' as DailyCloseStatus,
          countedCash,
          variance,
          closedBy: currentUser?.name || 'Admin',
          closedAt: `Today, ${timeStr}`,
          notes: notes?.trim() || (variance === 0 ? 'Exact balance verified' : `Variance: ₾${variance.toFixed(2)}`),
        },
      };
      localStorage.setItem('bb_reconciliations', JSON.stringify(updated));
      return updated;
    });
  };

  const updateReconciliationStatus = (branchId: BranchId, status: DailyCloseStatus) => {
    setReconciliationOverrides((prev) => {
      const updated = {
        ...prev,
        [branchId]: {
          ...(prev[branchId] || {}),
          status,
        },
      };
      localStorage.setItem('bb_reconciliations', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <CashContext.Provider
      value={{
        currentUser,
        loginAsAdmin,
        loginAsBarber,
        logout,
        currentBranch,
        setCurrentBranch,
        branches,
        barbers,
        services,
        bookings,
        customers,
        expenses,
        withdrawals,
        revenueRecords,
        branchBarbers,
        branchBookings,
        branchExpenses,
        branchWithdrawals,
        branchRevenueRecords,
        todayCustomers,
        todayRevenue,
        todayBookingsCount,
        todayWalkInsCount,
        revenueByBarber,
        clientsByBarber,
        barberPerformanceList,
        totalExpenses,
        totalWithdrawals,
        netProfit,
        cashInDrawer,
        expensesByCategory,
        currentBarber,
        myAppointments,
        myClientsToday,
        myServicesCompletedToday,
        myTodayEarnings,
        myMonthEarnings,
        myWithdrawals,
        myTotalWithdrawn,
        myRemainingBalance,
        createBooking,
        markCustomerArrived,
        markCustomerInService,
        markNoShow,
        completeService,
        updateBookingStatus,
        addWalkIn,
        addExpense,
        addWithdrawal,
        updateBarberCommission,
        theme,
        toggleTheme,
        resetToDefaultData,
        reconciliations,
        performDailyClose,
        updateReconciliationStatus,
        commissionBaseRule,
        setCommissionBaseRule: handleSetCommissionBaseRule,
      }}
    >
      {children}
    </CashContext.Provider>
  );
};

export const useCash = () => {
  const context = useContext(CashContext);
  if (!context) {
    throw new Error('useCash must be used within a CashProvider');
  }
  return context;
};
