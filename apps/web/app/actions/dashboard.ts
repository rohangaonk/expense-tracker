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

export interface DashboardData {
  expenses: Expense[];
  totalAmount: number;
  categoryBreakdown: Record<string, number>;
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw new Error('Failed to fetch expenses');
  }

  // Calculate total and category breakdown
  const totalAmount = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const categoryBreakdown: Record<string, number> = {};

  expenses?.forEach((exp) => {
    const category = exp.category;
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + Number(exp.amount);
  });

  return {
    expenses: expenses || [],
    totalAmount,
    categoryBreakdown,
  };
}
