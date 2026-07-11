'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Expense, getExpenses } from '../actions/dashboard';
import ExpenseCard from './ExpenseCard';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface ExpenseListProps {
  initialExpenses: Expense[];
  startDate?: string;
  endDate?: string;
  category?: string | null;
}

export default function ExpenseList({ initialExpenses, startDate, endDate, category }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [page, setPage] = useState(2); // Start fetching from page 2
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialExpenses.length >= 20);
  const observerTarget = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Reset state when filters change
  useEffect(() => {
    setExpenses(initialExpenses);
    setPage(2);
    setHasMore(initialExpenses.length >= 20);
  }, [initialExpenses, startDate, endDate, category]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newExpenses = await getExpenses(page, 20, startDate, endDate, category || undefined);
      
      if (newExpenses.length < 20) {
        setHasMore(false);
      }
      
      setExpenses(prev => [...prev, ...newExpenses]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, startDate, endDate, category]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore, hasMore]);

  const handleClearCategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          Recent Expenses
          {category && (
            <span 
              onClick={handleClearCategory}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800/40 select-none animate-in fade-in zoom-in-95 duration-200"
            >
              {category} ✕
            </span>
          )}
        </h2>
      </div>
      
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            No expenses found for this category.
          </div>
        ) : (
          expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))
        )}
      </div>

      {(hasMore || loading) && (
        <div 
          ref={observerTarget} 
          className="h-20 flex items-center justify-center p-4"
        >
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          )}
        </div>
      )}
      
      {!hasMore && expenses.length > 0 && (
        <div className="text-center py-6 text-xs text-gray-400 dark:text-gray-600">
          No more expenses
        </div>
      )}
    </div>
  );
}
