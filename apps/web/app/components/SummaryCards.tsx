'use client';

import { CategoryStat } from '../actions/dashboard';
import { getCategoryDetails } from '../../lib/categories';

interface SummaryCardsProps {
  total: number;
  totalCount: number;
  categoryStats: CategoryStat[];
}

export default function SummaryCards({ total, totalCount, categoryStats }: SummaryCardsProps) {
  return (
    <div className="space-y-2 mb-4">
      {/* Grand Total */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-3 shadow-md text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <p className="text-xs opacity-80">Total Expenses</p>
              <p className="text-2xl font-bold leading-tight">
                ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">{totalCount} items</p>
          </div>
        </div>
      </div>

      {/* Per-category cards — dynamic grid */}
      {categoryStats.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {categoryStats.map((stat) => {
            const cat = getCategoryDetails(stat.category);
            // Pick gradient based on the category color token
            const gradientMap: Record<string, string> = {
              amber:  'from-amber-500  to-amber-600',
              cyan:   'from-cyan-500   to-cyan-600',
              green:  'from-green-500  to-emerald-600',
              red:    'from-red-500    to-red-600',
              orange: 'from-orange-500 to-orange-600',
              lime:   'from-lime-500   to-lime-600',
              indigo: 'from-indigo-500 to-indigo-600',
              sky:    'from-sky-500    to-sky-600',
              purple: 'from-purple-500 to-purple-600',
              rose:   'from-rose-500   to-rose-600',
              pink:   'from-pink-500   to-pink-600',
              teal:   'from-teal-500   to-teal-600',
              stone:  'from-stone-500  to-stone-600',
              violet: 'from-violet-500 to-violet-600',
              gray:   'from-gray-500   to-gray-600',
            };
            const gradient = gradientMap[cat.color] ?? gradientMap.gray;

            return (
              <div
                key={stat.category}
                className={`bg-gradient-to-br ${gradient} rounded-lg p-2.5 shadow-md text-white`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{cat.icon}</span>
                  <p className="text-xs opacity-90">{stat.category}</p>
                </div>
                <p className="text-lg font-bold leading-tight">
                  ₹{stat.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs opacity-75 mt-0.5">{stat.expense_count} items</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
