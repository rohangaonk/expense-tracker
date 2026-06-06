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
  const [gymOnly, setGymOnly] = useState(false);
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

  const displayedExpenses = gymOnly
    ? expenses.filter(e => e.is_gym)
    : expenses;

  const gymExpenseCount = expenses.filter(e => e.is_gym).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Recent Expenses
        </h2>

        {/* Gym Filter Chip */}
        <button
          onClick={() => setGymOnly(prev => !prev)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            gymOnly
              ? 'bg-green-500 text-white shadow-sm shadow-green-200 dark:shadow-green-900/40 scale-105'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 border border-gray-200 dark:border-gray-700'
          }`}
          title={gymOnly ? 'Show all expenses' : 'Show gym expenses only'}
        >
          <span>💪</span>
          Gym
          {gymExpenseCount > 0 && (
            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
              gymOnly ? 'bg-white/30 text-white' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
            }`}>
              {gymExpenseCount}
            </span>
          )}
        </button>
      </div>
      
      <div className="space-y-3">
        {displayedExpenses.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400 dark:text-gray-600">
            {gymOnly ? 'No gym expenses in this period' : 'No expenses'}
          </div>
        ) : (
          displayedExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))
        )}
      </div>

      {/* Loading Sentinel — only show when not filtering */}
      {!gymOnly && (hasMore || loading) && (
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
      
      {!gymOnly && !hasMore && expenses.length > 0 && (
        <div className="text-center py-6 text-xs text-gray-400 dark:text-gray-600">
          No more expenses
        </div>
      )}
    </div>
  );
}
