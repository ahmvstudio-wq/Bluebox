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
  name: string;
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
  price: number; // GEL
  duration: number; // minutes
}

export interface BookingAppointment {
  id: string;
  ticketNumber: string;
  branchId: BranchId;
  customerName: string;
  customerPhone: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  price: number; // GEL
  time: string; // e.g. "14:00"
  type: 'booking' | 'walk-in';
  status: 'scheduled' | 'arrived' | 'completed';
  paymentMethod?: 'cash' | 'card';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit: string;
  preferredBarber: string;
  history: {
    date: string;
    serviceName: string;
    barberName: string;
    amount: number;
    type: 'booking' | 'walk-in';
  }[];
}

export interface Expense {
  id: string;
  branchId: BranchId;
  title: string;
  amount: number;
  date: string;
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
