export type BranchId = 'marjane' | 'dighomi' | 'saburtalo';

export interface Branch {
  id: BranchId;
  name: string;
  shortName: string;
  address: string;
  barberCount: number;
  initialCashDrawer: number;
}

export interface Barber {
  id: string;
  name: string; // e.g. "Barber #1"
  branchId: BranchId;
  specialty: string;
  avatar: string;
  workingHours: number;
  commissionRate: number; // 0.5 for 50%
  monthBaseEarnings: number; // Baseline accumulated earnings for current month
  pin?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number | null; // GEL (null for TBD)
  duration: number; // minutes
  isTbd?: boolean;
}

export type BookingSource = 
  | 'Phone' 
  | 'Instagram' 
  | 'WhatsApp' 
  | 'Walk-in' 
  | 'Direct Barber Booking';

export type BookingStatus = 
  | 'Scheduled' 
  | 'Arrived' 
  | 'In Service' 
  | 'Completed' 
  | 'Cancelled' 
  | 'No-show' 
  | 'Rescheduled'
  | 'scheduled'
  | 'arrived'
  | 'completed';

export interface BookingAppointment {
  id: string;
  ticketNumber: string;
  branchId: BranchId;
  customerName: string;
  customerPhone: string;
  isStudent?: boolean;
  studentIdProof?: string;
  allergies?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  originalPrice: number | null; // GEL (null if TBD)
  discountPercent?: number; // 20% if student
  discountAmount: number; // e.g. 9 GEL
  price: number; // Net price after discount (0 if TBD)
  time: string; // e.g. "14:00"
  source: BookingSource;
  type: 'booking' | 'walk-in';
  status: BookingStatus;
  paymentMethod?: 'cash' | 'card';
  createdAt: string;
  isNoShowGraceExpired?: boolean; // past 10-minute grace period
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  isStudent: boolean; // Yes / No
  studentIdProof?: string; // e.g. "STU-88219"
  allergies: string; // e.g. "Sensitive skin / alcohol aftershave"
  totalVisits: number;
  totalSpent: number;
  lastVisit: string;
  preferredBarber: string;
  history: {
    date: string;
    serviceName: string;
    barberName: string;
    amount: number;
    paymentMethod?: 'cash' | 'card';
    type: 'booking' | 'walk-in';
  }[];
}

export type ExpenseCategory = 
  | 'Business' 
  | 'Barber/worker' 
  | 'Customer-related' 
  | 'Operational';

export interface Expense {
  id: string;
  branchId: BranchId;
  category: ExpenseCategory;
  title: string;
  amount: number;
  date: string;
  description?: string;
}

export interface BarberWithdrawal {
  id: string;
  branchId: BranchId;
  barberId: string;
  barberName: string;
  amount: number;
  date: string;
  reason: string;
}

export interface RevenueRecord {
  id: string;
  ticketNumber: string;
  serviceName: string;
  customerName: string;
  barberId: string;
  barberName: string;
  branchId: BranchId;
  amount: number;
  paymentMethod: 'cash' | 'card';
  dateTime: string;
}

// ==========================================
// DAILY CLOSE & CASH RECONCILIATION TYPES
// ==========================================
export type DailyCloseStatus = 'open' | 'counted' | 'reviewed' | 'closed';

export interface DailyBranchReconciliation {
  id: string;
  branchId: BranchId;
  date: string; // e.g. "2026-09-15"
  status: DailyCloseStatus;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  cashExpenses: number;
  barberAdvances: number;
  expectedCash: number;
  countedCash?: number;
  variance?: number; // counted - expected (0 = exact match, < 0 shortage, > 0 overage)
  closedBy?: string;
  closedAt?: string;
  notes?: string;
}

// ==========================================
// RBAC & AUTH TYPES
// ==========================================
export type UserRole = 'admin' | 'barber';

export interface AdminUser {
  role: 'admin';
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface BarberUser {
  role: 'barber';
  barberId: string;
  name: string;
  avatar: string;
  branchId: BranchId;
  specialty: string;
}

export type AuthUser = AdminUser | BarberUser;
