import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditExpenseForm from './EditExpenseForm';

interface PageProps {
  params: { id: string };
}

export default async function EditExpensePage({ params }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the expense
  const { data: expense, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !expense) {
    redirect('/'); // Redirect to dashboard if expense not found
  }

  return <EditExpenseForm expense={expense} />;
}
