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
}

export interface DashboardData {
  expenses: Expense[];
  totalAmount: number;
  recurringTotal: number;
  nonRecurringTotal: number;
  categoryBreakdown: Record<string, number>;
  expensesByCategory: Record<string, Expense[]>;
}

export async function getDashboardData(startDate?: string, endDate?: string): Promise<DashboardData | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let query = supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id);

  // Apply date range filter if provided
  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data: expenses, error } = await query
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw new Error('Failed to fetch expenses');
  }

  // Calculate totals
  const totalAmount = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const recurringTotal = expenses?.filter(e => e.is_recurring).reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const nonRecurringTotal = expenses?.filter(e => !e.is_recurring).reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  
  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  expenses?.forEach((exp) => {
    const category = exp.category;
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + Number(exp.amount);
  });

  // Group expenses by category
  const expensesByCategory: Record<string, Expense[]> = {};
  expenses?.forEach((exp) => {
    const category = exp.category;
    if (!expensesByCategory[category]) {
      expensesByCategory[category] = [];
    }
    expensesByCategory[category].push(exp);
  });

  return {
    expenses: expenses || [],
    totalAmount,
    recurringTotal,
    nonRecurringTotal,
    categoryBreakdown,
    expensesByCategory,
  };
}
