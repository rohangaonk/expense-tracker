'use server';

import { createClient } from '@/lib/supabase/server';

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant: string | null;
  date: string;
  time: string | null;
  created_at: string;
  is_recurring: boolean;
  recurrence_period: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  is_house?: boolean;
  is_parents?: boolean;
}

export interface ChartData {
  date: string;
  amount: number;
}

export interface DashboardData {
  initialExpenses: Expense[];
  totalAmount: number;
  recurringTotal: number;
  houseTotal: number;
  parentsTotal: number;
  regularTotal: number;
  nonRecurringTotal: number;
  // Counts
  recurringCount: number;
  houseCount: number;
  parentsCount: number;
  regularCount: number;
  nonRecurringCount: number;
  // chartData replaces expenses for analysis
  chartData: ChartData[];
}

export async function getDashboardData(startDate?: string, endDate?: string): Promise<DashboardData | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Use parallel queries for better performance
  const [statsResult, chartDataResult, initialExpensesResult] = await Promise.all([
    // Query 1: Get aggregated stats from database function
    supabase.rpc('get_expense_stats', {
      p_user_id: user.id,
      p_start_date: startDate || null,
      p_end_date: endDate || null
    }),
    
    // Query 2: Get minimal chart data
    supabase.rpc('get_chart_data', {
      p_user_id: user.id,
      p_start_date: startDate || null,
      p_end_date: endDate || null
    }),
    
    // Query 3: Get initial 20 expenses for display
    (async () => {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      return await query;
    })()
  ]);

  // Handle errors
  if (statsResult.error) {
    console.error('Error fetching stats:', statsResult.error);
    throw new Error('Failed to fetch expense stats');
  }

  if (chartDataResult.error) {
    console.error('Error fetching chart data:', chartDataResult.error);
    throw new Error('Failed to fetch chart data');
  }

  if (initialExpensesResult.error) {
    console.error('Error fetching initial expenses:', initialExpensesResult.error);
    throw new Error('Failed to fetch initial expenses');
  }

  // Extract stats (RPC returns array with single row)
  const stats = statsResult.data?.[0] || {
    total_amount: 0,
    recurring_total: 0,
    recurring_count: 0,
    house_total: 0,
    house_count: 0,
    parents_total: 0,
    parents_count: 0,
    regular_total: 0,
    regular_count: 0,
    non_recurring_total: 0,
    non_recurring_count: 0
  };

  // Convert chart data
  const chartData: ChartData[] = (chartDataResult.data || []).map((row: { date: string; amount: number }) => ({
    date: row.date,
    amount: row.amount
  }));

  return {
    initialExpenses: initialExpensesResult.data || [],
    totalAmount: Number(stats.total_amount),
    recurringTotal: Number(stats.recurring_total),
    houseTotal: Number(stats.house_total),
    parentsTotal: Number(stats.parents_total),
    regularTotal: Number(stats.regular_total),
    nonRecurringTotal: Number(stats.non_recurring_total),
    recurringCount: Number(stats.recurring_count),
    houseCount: Number(stats.house_count),
    parentsCount: Number(stats.parents_count),
    regularCount: Number(stats.regular_count),
    nonRecurringCount: Number(stats.non_recurring_count),
    chartData,
  };
}

export async function getExpenses(page: number, limit: number = 20, startDate?: string, endDate?: string): Promise<Expense[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching paginated expenses:', error);
    return [];
  }

  return data;
}
