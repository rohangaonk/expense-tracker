export type ViewMode = 'month' | 'week';

export interface DateRange {
  start: string; // YYYY-MM-DD format
  end: string;   // YYYY-MM-DD format
}

/**
 * Get the start and end dates for the current month
 */
export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  return getMonthRange(now);
}

/**
 * Get the start and end dates for the current week (Monday-Sunday)
 */
export function getCurrentWeekRange(): DateRange {
  const now = new Date();
  return getWeekRange(now);
}

/**
 * Get the start and end dates for a specific month
 */
export function getMonthRange(date: Date): DateRange {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0); // Last day of the month
  
  return {
    start: formatDateForDB(start),
    end: formatDateForDB(end),
  };
}

/**
 * Get the start and end dates for a specific week (Monday-Sunday)
 */
export function getWeekRange(date: Date): DateRange {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: formatDateForDB(monday),
    end: formatDateForDB(sunday),
  };
}

/**
 * Navigate to the previous period (month or week)
 */
export function getPreviousPeriod(date: Date, mode: ViewMode): Date {
  const newDate = new Date(date);
  
  if (mode === 'month') {
    newDate.setMonth(newDate.getMonth() - 1);
  } else {
    newDate.setDate(newDate.getDate() - 7);
  }
  
  return newDate;
}

/**
 * Navigate to the next period (month or week)
 */
export function getNextPeriod(date: Date, mode: ViewMode): Date {
  const newDate = new Date(date);
  
  if (mode === 'month') {
    newDate.setMonth(newDate.getMonth() + 1);
  } else {
    newDate.setDate(newDate.getDate() + 7);
  }
  
  return newDate;
}

/**
 * Format a period label for display
 */
export function formatPeriodLabel(date: Date, mode: ViewMode): string {
  if (mode === 'month') {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  } else {
    const { start, end } = getWeekRange(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const year = endDate.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${year}`;
    } else {
      return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`;
    }
  }
}

/**
 * Check if a date is in the current period
 */
export function isCurrentPeriod(date: Date, mode: ViewMode): boolean {
  const now = new Date();
  
  if (mode === 'month') {
    return date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  } else {
    const currentWeek = getWeekRange(now);
    const checkWeek = getWeekRange(date);
    return currentWeek.start === checkWeek.start;
  }
}

/**
 * Format a date for database queries (YYYY-MM-DD)
 */
function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a date string from URL params
 */
export function parseDateFromParam(dateStr: string | null): Date {
  if (!dateStr) {
    return new Date();
  }
  
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Format a date for URL params (YYYY-MM-DD)
 */
export function formatDateForParam(date: Date): string {
  return formatDateForDB(date);
}
