import { createClient, getAuthenticatedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditExpenseForm from './EditExpenseForm';

interface PageProps {
  params: { id: string };
}

export default async function EditExpensePage({ params }: PageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = createClient();

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
