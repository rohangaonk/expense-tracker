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
}

export interface ChartData {
  date: string;
  amount: number;
}

export interface CategoryStat {
  category: string;
  total_amount: number;
  expense_count: number;
}

export interface DashboardData {
  initialExpenses: Expense[];
  totalAmount: number;
  categoryStats: CategoryStat[];
  chartData: ChartData[];
}

export async function getDashboardData(startDate?: string, endDate?: string, category?: string): Promise<DashboardData | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [statsResult, chartDataResult, initialExpensesResult] = await Promise.all([
    // Query 1: Per-category stats via RPC
    supabase.rpc('get_expense_stats', {
      p_user_id: user.id,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
    }),

    // Query 2: Chart data (query directly to allow category filtering)
    (async () => {
      let query = supabase
        .from('expenses')
        .select('date, amount, category')
        .eq('user_id', user.id);

      if (startDate) query = query.gte('date', startDate);
      if (endDate)   query = query.lte('date', endDate);

      return await query;
    })(),

    // Query 3: First 20 expenses for display
    (async () => {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (startDate) query = query.gte('date', startDate);
      if (endDate)   query = query.lte('date', endDate);
      if (category)  query = query.eq('category', category);

      return await query;
    })(),
  ]);

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

  const categoryStats: CategoryStat[] = (statsResult.data || []).map((row: { category: string; total_amount: number; expense_count: number }) => ({
    category:      row.category,
    total_amount:  Number(row.total_amount),
    expense_count: Number(row.expense_count),
  }));

  const totalAmount = categoryStats.reduce((sum, s) => sum + s.total_amount, 0);

  const chartData: ChartData[] = (chartDataResult.data || [])
    .filter((row: { date: string; amount: number; category: string }) => !category || row.category === category)
    .map((row: { date: string; amount: number; category: string }) => ({
      date: row.date,
      amount: Number(row.amount),
    }));

  return {
    initialExpenses: initialExpensesResult.data || [],
    totalAmount,
    categoryStats,
    chartData,
  };
}

export async function getExpenses(page: number, limit: number = 20, startDate?: string, endDate?: string, category?: string): Promise<Expense[]> {
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

  if (startDate) query = query.gte('date', startDate);
  if (endDate)   query = query.lte('date', endDate);
  if (category)  query = query.eq('category', category);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching paginated expenses:', error);
    return [];
  }

  return data;
}
