import { getDashboardData } from './actions/dashboard';
import { signout } from './auth/actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PendingExpenses from './components/PendingExpenses';
import SummaryCards from './components/SummaryCards';
import CategorySection from './components/CategorySection';
import PeriodSelector from './components/PeriodSelector';
import { 
  ViewMode, 
  getMonthRange,
  getWeekRange,
  parseDateFromParam 
} from './lib/date-utils';

export default async function Home({
  searchParams,
}: {
  searchParams: { view?: string; date?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Parse URL params for view mode and date
  const viewMode = (searchParams.view as ViewMode) || 'month';
  const selectedDate = parseDateFromParam(searchParams.date || null);

  // Calculate date range based on view mode
  const dateRange = viewMode === 'month' 
    ? getMonthRange(selectedDate)
    : getWeekRange(selectedDate);

  const dashboardData = await getDashboardData(dateRange.start, dateRange.end);

  if (!dashboardData) {
    redirect('/login');
  }

  const { 
    expenses, 
    totalAmount, 
    recurringTotal, 
    houseTotal,
    parentsTotal,
    regularTotal,
    expensesByCategory 
  } = dashboardData;

  const recurringCount = expenses.filter(e => e.is_recurring).length;
  const houseCount = expenses.filter(e => !e.is_recurring && e.category === 'House').length;
  const parentsCount = expenses.filter(e => !e.is_recurring && e.category === 'Parents').length;
  const regularCount = expenses.filter(e => !e.is_recurring && e.category !== 'House' && e.category !== 'Parents').length;
  const nonRecurringCount = expenses.filter(e => !e.is_recurring).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-950 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track your expenses effortlessly
              </p>
            </div>
            <form action={signout}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Pending Sync Alert */}
        <PendingExpenses />

        {/* Period Selector */}
        <PeriodSelector />

        {/* Summary Cards */}
        <SummaryCards
          recurring={recurringTotal}
          houseTotal={houseTotal}
          parentsTotal={parentsTotal}
          regularTotal={regularTotal}
          total={totalAmount}
          recurringCount={recurringCount}
          houseCount={houseCount}
          parentsCount={parentsCount}
          regularCount={regularCount}
          nonRecurringCount={nonRecurringCount}
        />

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No expenses yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Start tracking your expenses by adding your first one
            </p>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Your First Expense
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Expenses by Category
            </h2>
            {Object.entries(expensesByCategory).map(([category, categoryExpenses]) => (
              <CategorySection
                key={category}
                category={category}
                expenses={categoryExpenses}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Link
        href="/add"
        className="fixed bottom-6 right-6 w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group hover:scale-110"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </div>
  );
}
