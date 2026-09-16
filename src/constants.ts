// ============================================
// BLACKBOX — Single Source of Truth for Business Constants
// ============================================
// All financial rates, discount percentages, and business rules
// are defined here. Never use raw literals (0.5, 0.2, 45) in
// components or context — import from this file instead.

/** Student discount rate as a decimal fraction (20% = 0.20) */
export const STUDENT_DISCOUNT_RATE = 0.20;

/** Student discount percentage for display (20) */
export const STUDENT_DISCOUNT_PERCENT = 20;

/** Default barber commission rate as a decimal fraction (50% = 0.50) */
export const DEFAULT_COMMISSION_RATE = 0.50;

/**
 * Compute the student discount amount for a given price.
 * Returns 0 if price is null/0 or student flag is false.
 */
export const calcStudentDiscount = (price: number | null, isStudent: boolean): number => {
  if (!isStudent || !price) return 0;
  return price * STUDENT_DISCOUNT_RATE;
};

/**
 * Compute the net price after student discount.
 * Returns 0 if price is null.
 */
export const calcNetPrice = (price: number | null, isStudent: boolean): number => {
  if (!price) return 0;
  return price - calcStudentDiscount(price, isStudent);
};

/**
 * Compute barber commission earnings from a revenue amount.
 */
export const calcBarberCut = (amount: number, commissionRate: number): number => {
  return amount * commissionRate;
};

/**
 * Format a number as GEL currency string with 2 decimal places.
 * e.g. formatGEL(36) => "₾36.00"
 */
export const formatGEL = (amount: number): string => {
  return `₾${amount.toFixed(2)}`;
};

/**
 * Format a number as GEL without the symbol (for contexts where ₾ is already shown).
 */
export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};
