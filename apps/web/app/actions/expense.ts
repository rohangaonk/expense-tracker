'use server';

import { parseExpense as aiParseExpense, ParsedExpense } from '@repo/ai';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function parseExpenseAction(text: string): Promise<ParsedExpense> {
  if (!text) {
    throw new Error('Input text is required');
  }
  try {
    return await aiParseExpense(text);
  } catch (error) {
    console.error('Error in parseExpenseAction:', error);
    throw error;
  }
}

export type ExpenseData = {
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant?: string | null;
  date: string;
  time?: string | null;
  is_recurring?: boolean;
  recurrence_period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  is_house?: boolean;
  is_parents?: boolean;
};

export async function saveExpenseAction(data: ExpenseData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    amount: data.amount,
    currency: data.currency,
    category: data.category,
    description: data.description,
    merchant: data.merchant,
    date: data.date,
    time: data.time,
    is_synced: true, // Assuming online save for now
    is_recurring: data.is_recurring || false,
    recurrence_period: data.recurrence_period || null,
    is_house: data.is_house || false,
    is_parents: data.is_parents || false,
  });

  if (error) {
    console.error('Error saving expense:', error);
    throw new Error('Failed to save expense');
  }

  redirect('/'); // Redirect to dashboard after save
}

// Version without redirect for background sync
export async function saveExpenseForSync(data: ExpenseData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    amount: data.amount,
    currency: data.currency,
    category: data.category,
    description: data.description,
    merchant: data.merchant,
    date: data.date,
    time: data.time,
    is_synced: true,
    is_recurring: data.is_recurring || false,
    recurrence_period: data.recurrence_period || null,
    is_house: data.is_house || false,
    is_parents: data.is_parents || false,
  });

  if (error) {
    console.error('Error saving expense during sync:', error);
    throw new Error('Failed to save expense: ' + error.message);
  }

  // Revalidate the home page cache
  revalidatePath('/');
  
  return { success: true };
}

export async function deleteExpenseAction(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // First verify the expense belongs to the user
  const { data: expense } = await supabase
    .from('expenses')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!expense || expense.user_id !== user.id) {
    throw new Error('Expense not found or unauthorized');
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw new Error('Failed to delete expense');
  }

  revalidatePath('/');
}

export async function updateExpenseAction(id: string, data: ExpenseData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // First verify the expense belongs to the user
  const { data: expense } = await supabase
    .from('expenses')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!expense || expense.user_id !== user.id) {
    throw new Error('Expense not found or unauthorized');
  }

  const { error } = await supabase
    .from('expenses')
    .update({
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      description: data.description,
      merchant: data.merchant,
      date: data.date,
      time: data.time,
      is_recurring: data.is_recurring || false,
      recurrence_period: data.recurrence_period || null,
      is_house: data.is_house || false,
      is_parents: data.is_parents || false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating expense:', error);
    throw new Error('Failed to update expense');
  }

  redirect('/');
}
