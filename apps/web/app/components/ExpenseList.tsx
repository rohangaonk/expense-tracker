'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Expense, getExpenses } from '../actions/dashboard';
import ExpenseCard from './ExpenseCard';

interface ExpenseListProps {
  initialExpenses: Expense[];
  startDate?: string;
  endDate?: string;
}

export default function ExpenseList({ initialExpenses, startDate, endDate }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [page, setPage] = useState(2); // Start fetching from page 2
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialExpenses.length >= 20);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset state when filters change
  useEffect(() => {
    setExpenses(initialExpenses);
    setPage(2);
    setHasMore(initialExpenses.length >= 20);
  }, [initialExpenses, startDate, endDate]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newExpenses = await getExpenses(page, 20, startDate, endDate);
      
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
  }, [page, loading, hasMore, startDate, endDate]);

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

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-1">
        Recent Expenses
      </h2>
      
      <div className="space-y-3">
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </div>

      {/* Loading Sentinel */}
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
