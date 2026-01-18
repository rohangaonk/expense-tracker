'use server';

import { parseExpense as aiParseExpense, ParsedExpense } from '@repo/ai';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

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
  });

  if (error) {
    console.error('Error saving expense:', error);
    throw new Error('Failed to save expense');
  }

  redirect('/'); // Redirect to dashboard after save
}
