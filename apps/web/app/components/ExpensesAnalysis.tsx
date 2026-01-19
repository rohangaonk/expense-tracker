'use client';

import { useState } from 'react';
import ExpensesPieChart from './ExpensesPieChart';
import ExpensesBarChart from './ExpensesBarChart';

interface ExpensesAnalysisProps {
  regularTotal: number;
  recurringTotal: number;
  houseTotal: number;
  parentsTotal: number;
  expenses: { date: string; amount: number }[];
}

export default function ExpensesAnalysis({
  regularTotal,
  recurringTotal,
  houseTotal,
  parentsTotal,
  expenses,
}: ExpensesAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📈</span> Spending Analysis
        </h2>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          {isOpen ? (
            <>
              Hide Chart
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </>
          ) : (
            <>
              Show Chart
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 ease-in-out">
          {/* Chart Type Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex">
              <button
                onClick={() => setChartType('pie')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'pie'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">🥧</span> Distribution
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">📊</span> Daily Trend
              </button>
            </div>
          </div>

          {chartType === 'pie' ? (
            <ExpensesPieChart
              regularTotal={regularTotal}
              recurringTotal={recurringTotal}
              houseTotal={houseTotal}
              parentsTotal={parentsTotal}
            />
          ) : (
            <ExpensesBarChart expenses={expenses} />
          )}
        </div>
      )}
    </div>
  );
}
