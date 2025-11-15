/**
 * Goal Breakdown Algorithm
 *
 * Automatically calculates milestone dates and structure for goal breakdown.
 * Breaks down long-term goals into: 12mo → 6mo → 3mo → 1mo → weekly milestones
 */

export interface BreakdownMilestone {
  period_type: '12_month' | '6_month' | '3_month' | '1_month' | 'weekly';
  title: string;
  description: string;
  target_date: string; // YYYY-MM-DD
  completion_percentage_target: number;
  key_deliverables: string[];
  order_index: number;
}

export interface GoalBreakdownStructure {
  goal_title: string;
  start_date: string; // YYYY-MM-DD
  target_date: string; // YYYY-MM-DD
  total_duration_months: number;
  milestones: BreakdownMilestone[];
}

/**
 * Calculate milestone dates for a goal
 */
export function calculateMilestoneDates(
  startDate: Date,
  targetDate: Date
): {
  month_12?: Date;
  month_6?: Date;
  month_3?: Date;
  month_1: Date;
  weekly_dates: Date[];
} {
  const start = new Date(startDate);
  const target = new Date(targetDate);

  // Calculate total duration in months
  const totalMonths =
    (target.getFullYear() - start.getFullYear()) * 12 +
    (target.getMonth() - start.getMonth());

  // Calculate milestone dates
  const result: {
    month_12?: Date;
    month_6?: Date;
    month_3?: Date;
    month_1: Date;
    weekly_dates: Date[];
  } = {
    month_1: new Date(start),
    weekly_dates: [],
  };

  // 12-month milestone (only if goal is 12+ months)
  if (totalMonths >= 12) {
    result.month_12 = addMonths(start, 12);
  }

  // 6-month milestone (only if goal is 6+ months)
  if (totalMonths >= 6) {
    result.month_6 = addMonths(start, 6);
  }

  // 3-month milestone (only if goal is 3+ months)
  if (totalMonths >= 3) {
    result.month_3 = addMonths(start, 3);
  }

  // 1-month milestone (always present)
  result.month_1 = addMonths(start, 1);

  // Weekly milestones for first month (4 weeks)
  for (let week = 1; week <= 4; week++) {
    result.weekly_dates.push(addDays(start, week * 7));
  }

  return result;
}

/**
 * Generate milestone structure from dates (used before AI generates content)
 */
export function generateMilestoneStructure(
  goalTitle: string,
  startDate: Date,
  targetDate: Date
): GoalBreakdownStructure {
  const dates = calculateMilestoneDates(startDate, targetDate);
  const milestones: BreakdownMilestone[] = [];
  let orderIndex = 0;

  // Calculate total duration
  const totalMonths =
    (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
    (targetDate.getMonth() - startDate.getMonth());

  // Add 12-month milestone if applicable
  if (dates.month_12) {
    milestones.push({
      period_type: '12_month',
      title: `${goalTitle} - 12 Month Milestone`,
      description: 'Major milestone at 12 months',
      target_date: formatDate(dates.month_12),
      completion_percentage_target: Math.round((12 / totalMonths) * 100),
      key_deliverables: [],
      order_index: orderIndex++,
    });
  }

  // Add 6-month milestone if applicable
  if (dates.month_6) {
    milestones.push({
      period_type: '6_month',
      title: `${goalTitle} - 6 Month Milestone`,
      description: 'Mid-term checkpoint at 6 months',
      target_date: formatDate(dates.month_6),
      completion_percentage_target: Math.round((6 / totalMonths) * 100),
      key_deliverables: [],
      order_index: orderIndex++,
    });
  }

  // Add 3-month milestone if applicable
  if (dates.month_3) {
    milestones.push({
      period_type: '3_month',
      title: `${goalTitle} - 3 Month Milestone`,
      description: 'Quarter checkpoint at 3 months',
      target_date: formatDate(dates.month_3),
      completion_percentage_target: Math.round((3 / totalMonths) * 100),
      key_deliverables: [],
      order_index: orderIndex++,
    });
  }

  // Add 1-month milestone (always present)
  milestones.push({
    period_type: '1_month',
    title: `${goalTitle} - 1 Month Milestone`,
    description: 'First month checkpoint',
    target_date: formatDate(dates.month_1),
    completion_percentage_target: Math.round((1 / totalMonths) * 100),
    key_deliverables: [],
    order_index: orderIndex++,
  });

  // Add weekly milestones
  dates.weekly_dates.forEach((weekDate, index) => {
    milestones.push({
      period_type: 'weekly',
      title: `Week ${index + 1} Focus`,
      description: `Week ${index + 1} objectives`,
      target_date: formatDate(weekDate),
      completion_percentage_target: Math.round(
        ((index + 1) / (totalMonths * 4)) * 100
      ),
      key_deliverables: [],
      order_index: orderIndex++,
    });
  });

  return {
    goal_title: goalTitle,
    start_date: formatDate(startDate),
    target_date: formatDate(targetDate),
    total_duration_months: totalMonths,
    milestones,
  };
}

/**
 * Helper: Add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Helper: Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Helper: Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate current completion percentage based on time elapsed
 */
export function calculateTimeBasedCompletion(
  startDate: Date,
  targetDate: Date,
  currentDate: Date = new Date()
): number {
  const totalTime = targetDate.getTime() - startDate.getTime();
  const elapsedTime = currentDate.getTime() - startDate.getTime();

  if (elapsedTime <= 0) return 0;
  if (elapsedTime >= totalTime) return 100;

  return Math.round((elapsedTime / totalTime) * 100);
}

/**
 * Determine which milestone period we're currently in
 */
export function getCurrentPeriod(
  startDate: Date,
  currentDate: Date = new Date()
): '12_month' | '6_month' | '3_month' | '1_month' | 'weekly' {
  const monthsElapsed = getMonthsDifference(startDate, currentDate);

  if (monthsElapsed < 1) {
    // Within first month - use weekly
    return 'weekly';
  } else if (monthsElapsed < 3) {
    // 1-3 months - use 1_month
    return '1_month';
  } else if (monthsElapsed < 6) {
    // 3-6 months - use 3_month
    return '3_month';
  } else if (monthsElapsed < 12) {
    // 6-12 months - use 6_month
    return '6_month';
  } else {
    // 12+ months - use 12_month
    return '12_month';
  }
}

/**
 * Helper: Calculate months difference between two dates
 */
function getMonthsDifference(startDate: Date, endDate: Date): number {
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  );
}
