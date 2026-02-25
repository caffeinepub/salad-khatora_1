/**
 * Utility functions for subscription date calculations.
 * Sundays are excluded from delivery days.
 */

export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

/**
 * Calculate the end date by counting forward a given number of delivery days
 * from the start date, skipping Sundays.
 * @param startDateStr - ISO date string (YYYY-MM-DD)
 * @param deliveryDays - number of delivery days to count (6 for weekly, 24 for monthly)
 * @returns ISO date string (YYYY-MM-DD) of the end date
 */
export function calculateEndDate(startDateStr: string, deliveryDays: number): string {
  const start = new Date(startDateStr + 'T00:00:00');
  let counted = 0;
  let current = new Date(start);

  while (counted < deliveryDays) {
    if (!isSunday(current)) {
      counted++;
    }
    if (counted < deliveryDays) {
      current.setDate(current.getDate() + 1);
    }
  }

  return formatDate(current);
}

/**
 * Add one delivery day to a date, skipping Sundays.
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns ISO date string (YYYY-MM-DD) of the next delivery day
 */
export function addOneDeliveryDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  // Skip Sunday
  while (isSunday(date)) {
    date.setDate(date.getDate() + 1);
  }
  return formatDate(date);
}

/**
 * Subtract one delivery day from a date, skipping Sundays.
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns ISO date string (YYYY-MM-DD) of the previous delivery day
 */
export function subtractOneDeliveryDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() - 1);
  // Skip Sunday
  while (isSunday(date)) {
    date.setDate(date.getDate() - 1);
  }
  return formatDate(date);
}

/**
 * Generate all delivery days between startDate and endDate (inclusive), excluding Sundays.
 * @param startDateStr - ISO date string (YYYY-MM-DD)
 * @param endDateStr - ISO date string (YYYY-MM-DD)
 * @returns Array of ISO date strings (YYYY-MM-DD)
 */
export function generateDeliveryDays(startDateStr: string, endDateStr: string): string[] {
  const days: string[] = [];
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  const current = new Date(start);

  while (current <= end) {
    if (!isSunday(current)) {
      days.push(formatDate(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Format a Date object to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string to a human-readable format (e.g., "Mon, 25 Feb 2026").
 */
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
export function getTodayStr(): string {
  return formatDate(new Date());
}
