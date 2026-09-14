import { 
  Branch, 
  Barber, 
  ServiceItem, 
  BookingAppointment, 
  Customer, 
  Expense, 
  BarberWithdrawal,
  AdminUser 
} from './types';

export const DEFAULT_ADMIN: AdminUser = {
  role: 'admin',
  id: 'admin-1',
  name: 'Irakli Owner',
  email: 'owner@bluebox.ge',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
};

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'marjane',
    name: 'Marjanishvili Branch',
    shortName: 'Marjane',
    address: 'Sankt-Petersburgs St, 2A',
    barberCount: 6,
    initialCashDrawer: 350.00,
  },
  {
    id: 'dighomi',
    name: 'Dighomi Branch',
    shortName: 'Dighomi',
    address: 'Robakidze Ave, 7',
    barberCount: 3,
    initialCashDrawer: 200.00,
  },
  {
    id: 'saburtalo',
    name: 'Saburtalo Branch',
    shortName: 'Saburtalo',
    address: 'Pekini Ave, 22',
    barberCount: 3,
    initialCashDrawer: 250.00,
  },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  { id: 's1', name: 'Hair + Beard (Styling Included)', price: 45, duration: 45 },
  { id: 's2', name: 'Standard Haircut', price: 30, duration: 30 },
  { id: 's3', name: 'Beard Trim & Care', price: 25, duration: 25 },
  { id: 's4', name: 'Hydrofacial Deep Cleanse', price: 100, duration: 45 },
  { id: 's5', name: 'Hot Steaming & Razor Shave', price: 60, duration: 30 },
  { id: 's6', name: 'Father & Son Combo', price: 70, duration: 60 },
];

export const INITIAL_BARBERS: Barber[] = [
  // Marjane
  { 
    id: 'b1', 
    name: 'Reza Rostami', 
    branchId: 'marjane', 
    specialty: 'Beard Art & Skin Fades', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', 
    workingHours: 8, 
    commissionRate: 0.5,
    monthBaseEarnings: 1450,
    pin: '1234'
  },
  { 
    id: 'b2', 
    name: 'Giorgi Beridze', 
    branchId: 'marjane', 
    specialty: 'Classic Scissor Cuts & Fades', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', 
    workingHours: 8, 
    commissionRate: 0.5,
    monthBaseEarnings: 1680,
    pin: '1234'
  },
  { 
    id: 'b3', 
    name: 'David Kalandadze', 
    branchId: 'marjane', 
    specialty: 'Taper Fade & Lineup', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80', 
    workingHours: 8, 
    commissionRate: 0.5,
    monthBaseEarnings: 1220,
    pin: '1234'
  },
  { 
    id: 'b4', 
    name: 'Luka Maisuradze', 
    branchId: 'marjane', 
    specialty: 'Texture & Hot Shaves', 
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80', 
    workingHours: 7, 
    commissionRate: 0.5,
    monthBaseEarnings: 980,
    pin: '1234'
  },
  { 
    id: 'b5', 
    name: 'Farhad Hosseini', 
    branchId: 'marjane', 
    specialty: 'Hot Towel Treatment', 
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80', 
    workingHours: 8, 
    commissionRate: 0.5,
    monthBaseEarnings: 1100,
    pin: '1234'
  },
  { 
    id: 'b6', 
    name: 'Alexei Ivanov', 
    branchId: 'marjane', 
    specialty: 'Skin Fades & Styling', 
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', 
    workingHours: 6, 
    commissionRate: 0.5,
    monthBaseEarnings: 840,
    pin: '1234'
  },

  // Dighomi
  { 
    id: 'b7', 
    name: 'Nick Japaridze', 
    branchId: 'dighomi', 
    specialty: 'Modern Crop & Taper', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', 
    workingHours: 8, 
    commissionRate: 0.5,
    monthBaseEarnings: 1310,
    pin: '1234'
  },
  { 
    id: 'b8', 
    name: 'Saba Lomidze', 
    branchId: 'dighomi', 
    specialty: 'Beard Grooming & Shape', 
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80', 
    workingHours: 7, 
    commissionRate: 0.5,
    monthBaseEarnings: 1040,
    pin: '1234'
  },
  { 
    id: 'b9', 
    name: 'Irakli Gogoladze', 
    branchId: 'dighomi', 
    specialty: 'Precision Buzz & Razor', 
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', 
    workingHours: 8, 
    commissionRate: 0.5,
    monthBaseEarnings: 890,
    pin: '1234'
  },

  // Saburtalo
  { 
    id: 'b10', 
    name: 'Tornike Tsiklauri', 
    branchId: 'saburtalo', 
    specialty: 'Master Stylist & Beard', 
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80', 
    workingHours: 8, 
    commissionRate: 0.5,
    monthBaseEarnings: 1520,
    pin: '1234'
  },
  { 
    id: 'b11', 
    name: 'Levani Shengelia', 
    branchId: 'saburtalo', 
    specialty: 'Classic Scissor Cut', 
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80', 
    workingHours: 8, 
    commissionRate: 0.5,
    monthBaseEarnings: 1140,
    pin: '1234'
  },
  { 
    id: 'b12', 
    name: 'Kote Gelashvili', 
    branchId: 'saburtalo', 
    specialty: 'Skin Fade & Beard', 
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&auto=format&fit=crop&q=80', 
    workingHours: 8, 
    commissionRate: 0.5,
    monthBaseEarnings: 990,
    pin: '1234'
  },
];

export const INITIAL_BOOKINGS: BookingAppointment[] = [
  // 1. Scheduled (for Reza Rostami) -> Ready for "Customer Arrived" click!
  {
    id: 'apt-1',
    ticketNumber: 'BB-101',
    branchId: 'marjane',
    customerName: 'Marcus Vance',
    customerPhone: '+995 591 00 11 22',
    barberId: 'b1',
    barberName: 'Reza Rostami',
    serviceId: 's1',
    serviceName: 'Hair + Beard (Styling Included)',
    price: 45,
    time: '15:30',
    type: 'booking',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  },
  // 2. Arrived (for Giorgi Beridze) -> Ready for "Complete & Pay" click!
  {
    id: 'apt-2',
    ticketNumber: 'BB-102',
    branchId: 'marjane',
    customerName: 'Ahmed Al-Mansoor',
    customerPhone: '+995 599 11 22 33',
    barberId: 'b2',
    barberName: 'Giorgi Beridze',
    serviceId: 's4',
    serviceName: 'Hydrofacial Deep Cleanse',
    price: 100,
    time: '14:00',
    type: 'booking',
    status: 'arrived',
    createdAt: new Date().toISOString(),
  },
  // 3. Upcoming Scheduled (for Giorgi Beridze)
  {
    id: 'apt-2b',
    ticketNumber: 'BB-106',
    branchId: 'marjane',
    customerName: 'Nikoloz Tsereteli',
    customerPhone: '+995 595 77 88 99',
    barberId: 'b2',
    barberName: 'Giorgi Beridze',
    serviceId: 's1',
    serviceName: 'Hair + Beard (Styling Included)',
    price: 45,
    time: '16:00',
    type: 'booking',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  },
  // 4. Completed Walk-in for Reza
  {
    id: 'apt-3',
    ticketNumber: 'BB-103',
    branchId: 'marjane',
    customerName: 'Dato Gachechiladze',
    customerPhone: '+995 593 12 34 56',
    barberId: 'b1',
    barberName: 'Reza Rostami',
    serviceId: 's2',
    serviceName: 'Standard Haircut',
    price: 30,
    time: '13:00',
    type: 'walk-in',
    status: 'completed',
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  // 5. Completed Booking for David Kalandadze
  {
    id: 'apt-4',
    ticketNumber: 'BB-104',
    branchId: 'marjane',
    customerName: 'Sandro Chavchavadze',
    customerPhone: '+995 577 44 55 66',
    barberId: 'b3',
    barberName: 'David Kalandadze',
    serviceId: 's1',
    serviceName: 'Hair + Beard (Styling Included)',
    price: 45,
    time: '12:30',
    type: 'booking',
    status: 'completed',
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  // 6. Completed Walk-in for Luka Maisuradze
  {
    id: 'apt-5',
    ticketNumber: 'BB-105',
    branchId: 'marjane',
    customerName: 'Giga Kiknadze',
    customerPhone: '+995 558 12 88 99',
    barberId: 'b4',
    barberName: 'Luka Maisuradze',
    serviceId: 's3',
    serviceName: 'Beard Trim & Care',
    price: 25,
    time: '12:00',
    type: 'walk-in',
    status: 'completed',
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Ahmed Al-Mansoor',
    phone: '+995 599 11 22 33',
    totalVisits: 14,
    totalSpent: 630,
    lastVisit: 'Today',
    preferredBarber: 'Giorgi Beridze',
    history: [
      { date: 'Today', serviceName: 'Hydrofacial Deep Cleanse', barberName: 'Giorgi Beridze', amount: 100, type: 'booking' },
      { date: '12 Sep 2026', serviceName: 'Hair + Beard', barberName: 'Reza Rostami', amount: 45, type: 'booking' },
      { date: '28 Aug 2026', serviceName: 'Hair + Beard', barberName: 'Reza Rostami', amount: 45, type: 'walk-in' },
    ],
  },
  {
    id: 'c2',
    name: 'Marcus Vance',
    phone: '+995 591 00 11 22',
    totalVisits: 5,
    totalSpent: 225,
    lastVisit: 'Today',
    preferredBarber: 'Reza Rostami',
    history: [
      { date: 'Today', serviceName: 'Hair + Beard', barberName: 'Reza Rostami', amount: 45, type: 'booking' },
      { date: '01 Sep 2026', serviceName: 'Hair + Beard', barberName: 'Reza Rostami', amount: 45, type: 'booking' },
    ],
  },
  {
    id: 'c3',
    name: 'Dato Gachechiladze',
    phone: '+995 593 12 34 56',
    totalVisits: 6,
    totalSpent: 210,
    lastVisit: 'Today',
    preferredBarber: 'Reza Rostami',
    history: [
      { date: 'Today', serviceName: 'Standard Haircut', barberName: 'Reza Rostami', amount: 30, type: 'walk-in' },
    ],
  },
  {
    id: 'c4',
    name: 'Sandro Chavchavadze',
    phone: '+995 577 44 55 66',
    totalVisits: 4,
    totalSpent: 165,
    lastVisit: 'Today',
    preferredBarber: 'David Kalandadze',
    history: [
      { date: 'Today', serviceName: 'Hair + Beard', barberName: 'David Kalandadze', amount: 45, type: 'booking' },
    ],
  },
  {
    id: 'c5',
    name: 'Nikoloz Tsereteli',
    phone: '+995 595 77 88 99',
    totalVisits: 3,
    totalSpent: 135,
    lastVisit: 'Today',
    preferredBarber: 'Giorgi Beridze',
    history: [
      { date: '20 Aug 2026', serviceName: 'Hair + Beard', barberName: 'Giorgi Beridze', amount: 45, type: 'booking' },
    ],
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', branchId: 'marjane', title: 'Italian Coffee Beans & Mineral Water', amount: 38.50, date: 'Today' },
  { id: 'e2', branchId: 'marjane', title: 'Barbicide & Neck Strips Restock', amount: 45.00, date: 'Today' },
  { id: 'e3', branchId: 'dighomi', title: 'Paper Towels & Cleaning Detergents', amount: 25.00, date: 'Today' },
];

export const INITIAL_WITHDRAWALS: BarberWithdrawal[] = [
  { 
    id: 'w1', 
    branchId: 'marjane', 
    barberId: 'b1', 
    barberName: 'Reza Rostami', 
    amount: 50.00, 
    date: 'Today', 
    reason: 'Mid-month cash advance' 
  },
  { 
    id: 'w2', 
    branchId: 'marjane', 
    barberId: 'b2', 
    barberName: 'Giorgi Beridze', 
    amount: 150.00, 
    date: 'Yesterday', 
    reason: 'Personal expense advance' 
  },
];
