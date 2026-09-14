import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Branch, 
  BranchId, 
  Barber, 
  ServiceItem, 
  BookingAppointment, 
  Customer, 
  Expense, 
  BarberWithdrawal,
  AuthUser,
  AdminUser,
  BarberUser
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

  // Filtered to active branch (Admin View)
  branchBarbers: Barber[];
  branchBookings: BookingAppointment[];
  branchExpenses: Expense[];
  branchWithdrawals: BarberWithdrawal[];

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

  // 2. Personal Barber Metrics (Barber RBAC View - Strictly limited to own data)
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
  }) => { success: boolean; error?: string };

  markCustomerArrived: (bookingId: string) => void;
  completeService: (bookingId: string, paymentMethod: 'cash' | 'card') => void;

  addWalkIn: (data: {
    customerName: string;
    customerPhone?: string;
    barberId: string;
    serviceId: string;
    paymentMethod: 'cash' | 'card';
  }) => void;

  addExpense: (title: string, amount: number) => void;
  addWithdrawal: (barberId: string, amount: number, reason: string) => void;
  // Theme (Light / Dark)
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  resetToDefaultData: () => void;
}

const CashContext = createContext<CashContextType | undefined>(undefined);

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

  // 1. Auth state with persistence
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('bb_auth_user');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN; // Default to admin for fast demo access
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

  // Reset to default demo data helper
  const resetToDefaultData = () => {
    localStorage.removeItem('bb_bookings');
    localStorage.removeItem('bb_customers');
    localStorage.removeItem('bb_expenses');
    localStorage.removeItem('bb_withdrawals');
    localStorage.removeItem('bb_barbers');
    localStorage.removeItem('bb_services');
    setBarbers(INITIAL_BARBERS);
    setServices(INITIAL_SERVICES);
    setBookings(INITIAL_BOOKINGS);
    setCustomers(INITIAL_CUSTOMERS);
    setExpenses(INITIAL_EXPENSES);
    setWithdrawals(INITIAL_WITHDRAWALS);
  };

  // Auth actions
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
    setCurrentBranch(barber.branchId); // Automatically sync active branch to barber's location
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Branch filtered collections
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

  // Admin Dashboard Calculations
  const completedBookings = useMemo(() => {
    return branchBookings.filter((b) => b.status === 'completed');
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

  const totalWithdrawals = useMemo(() => {
    return branchWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  }, [branchWithdrawals]);

  const netProfit = useMemo(() => {
    return todayRevenue - totalExpenses;
  }, [todayRevenue, totalExpenses]);

  const cashInDrawer = useMemo(() => {
    const initialFloat = branches.find((b) => b.id === currentBranch)?.initialCashDrawer || 250;
    const cashSales = completedBookings.filter((b) => b.paymentMethod === 'cash').reduce((sum, b) => sum + b.price, 0);
    return Math.max(0, initialFloat + cashSales - totalExpenses - totalWithdrawals);
  }, [branches, currentBranch, completedBookings, totalExpenses, totalWithdrawals]);

  // ==========================================
  // BARBER RBAC METRICS (STRICTLY ISOLATED)
  // ==========================================
  const currentBarberId = currentUser?.role === 'barber' ? currentUser.barberId : null;

  const currentBarber = useMemo(() => {
    if (!currentBarberId) return null;
    return barbers.find((b) => b.id === currentBarberId) || null;
  }, [barbers, currentBarberId]);

  const myAppointments = useMemo(() => {
    if (!currentBarberId) return [];
    return bookings.filter((b) => b.barberId === currentBarberId);
  }, [bookings, currentBarberId]);

  const myCompletedServices = useMemo(() => {
    return myAppointments.filter((b) => b.status === 'completed');
  }, [myAppointments]);

  const myClientsToday = myCompletedServices.length;
  const myServicesCompletedToday = myCompletedServices.length;

  const myTodayRevenue = useMemo(() => {
    return myCompletedServices.reduce((sum, b) => sum + b.price, 0);
  }, [myCompletedServices]);

  const myTodayEarnings = useMemo(() => {
    const rate = currentBarber?.commissionRate || 0.5;
    return myTodayRevenue * rate;
  }, [myTodayRevenue, currentBarber]);

  const myMonthEarnings = useMemo(() => {
    const base = currentBarber?.monthBaseEarnings || 0;
    return base + myTodayEarnings;
  }, [currentBarber, myTodayEarnings]);

  const myWithdrawals = useMemo(() => {
    if (!currentBarberId) return [];
    return withdrawals.filter((w) => w.barberId === currentBarberId);
  }, [withdrawals, currentBarberId]);

  const myTotalWithdrawn = useMemo(() => {
    return myWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  }, [myWithdrawals]);

  const myRemainingBalance = useMemo(() => {
    return Math.max(0, myMonthEarnings - myTotalWithdrawn);
  }, [myMonthEarnings, myTotalWithdrawn]);

  // ==========================================
  // ACTIONS (KILLER WORKFLOW & OPERATIONS)
  // ==========================================
  const createBooking = (data: {
    customerName: string;
    customerPhone: string;
    barberId: string;
    serviceId: string;
    time: string;
  }) => {
    // Check double booking for that barber
    const conflict = bookings.find(
      (b) => b.barberId === data.barberId && b.time === data.time && b.status !== 'completed'
    );

    if (conflict) {
      return {
        success: false,
        error: `Slot ${data.time} is already booked for this barber with ${conflict.customerName}. Please choose another time.`,
      };
    }

    const barber = barbers.find((b) => b.id === data.barberId);
    const service = services.find((s) => s.id === data.serviceId);
    if (!barber || !service) return { success: false, error: 'Invalid selection' };

    const newBooking: BookingAppointment = {
      id: 'apt-' + Date.now(),
      ticketNumber: 'BB-' + Math.floor(100 + Math.random() * 900),
      branchId: barber.branchId,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim() || '+995 5xx xxx xxx',
      barberId: barber.id,
      barberName: barber.name,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      time: data.time,
      type: 'booking',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Upsert customer in directory
    setCustomers((prev) => {
      const found = prev.find((c) => c.name.toLowerCase() === data.customerName.trim().toLowerCase());
      if (found) return prev;
      return [
        {
          id: 'c-' + Date.now(),
          name: data.customerName.trim(),
          phone: data.customerPhone.trim() || '+995 5xx xxx xxx',
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
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'arrived' } : b))
    );
  };

  const completeService = (bookingId: string, paymentMethod: 'cash' | 'card') => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'completed', paymentMethod }
          : b
      )
    );

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
                serviceName: booking.serviceName,
                barberName: booking.barberName,
                amount: booking.price,
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

  const addWalkIn = (data: {
    customerName: string;
    customerPhone?: string;
    barberId: string;
    serviceId: string;
    paymentMethod: 'cash' | 'card';
  }) => {
    const barber = barbers.find((b) => b.id === data.barberId);
    const service = services.find((s) => s.id === data.serviceId);
    if (!barber || !service) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTicket: BookingAppointment = {
      id: 'apt-' + Date.now(),
      ticketNumber: 'BB-' + Math.floor(100 + Math.random() * 900),
      branchId: barber.branchId,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone?.trim() || '+995 5xx xxx xxx',
      barberId: barber.id,
      barberName: barber.name,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      time: timeNow,
      type: 'walk-in',
      status: 'completed',
      paymentMethod: data.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newTicket, ...prev]);

    setCustomers((prev) => {
      const found = prev.find((c) => c.name.toLowerCase() === data.customerName.trim().toLowerCase());
      if (found) {
        return prev.map((c) =>
          c.id === found.id
            ? {
                ...c,
                totalVisits: c.totalVisits + 1,
                totalSpent: c.totalSpent + service.price,
                lastVisit: 'Today',
                history: [
                  {
                    date: 'Today',
                    serviceName: service.name,
                    barberName: barber.name,
                    amount: service.price,
                    type: 'walk-in',
                  },
                  ...c.history,
                ],
              }
            : c
        );
      } else {
        return [
          {
            id: 'c-' + Date.now(),
            name: data.customerName.trim(),
            phone: data.customerPhone?.trim() || '+995 5xx xxx xxx',
            totalVisits: 1,
            totalSpent: service.price,
            lastVisit: 'Today',
            preferredBarber: barber.name,
            history: [
              {
                date: 'Today',
                serviceName: service.name,
                barberName: barber.name,
                amount: service.price,
                type: 'walk-in',
              },
            ],
          },
          ...prev,
        ];
      }
    });
  };

  const addExpense = (title: string, amount: number) => {
    const newExp: Expense = {
      id: 'e-' + Date.now(),
      branchId: currentBranch,
      title: title.trim(),
      amount,
      date: 'Today',
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const addWithdrawal = (barberId: string, amount: number, reason: string) => {
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber) return;
    const newWd: BarberWithdrawal = {
      id: 'w-' + Date.now(),
      branchId: barber.branchId,
      barberId: barber.id,
      barberName: barber.name,
      amount,
      date: 'Today',
      reason: reason.trim() || 'Mid-month cash advance',
    };
    setWithdrawals((prev) => [newWd, ...prev]);
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
        branchBarbers,
        branchBookings,
        branchExpenses,
        branchWithdrawals,
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
        completeService,
        addWalkIn,
        addExpense,
        addWithdrawal,
        theme,
        toggleTheme,
        resetToDefaultData,
      }}
    >
      {children}
    </CashContext.Provider>
  );
};

export const useCash = () => {
  const context = useContext(CashContext);
  if (!context) throw new Error('useCash must be used within CashProvider');
  return context;
};
