'use client';

import { useTransition } from 'react';
import { CategoryStat } from '../actions/dashboard';
import { getCategoryDetails } from '../../lib/categories';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface SummaryCardsProps {
  total: number;
  totalCount: number;
  categoryStats: CategoryStat[];
  activeCategory?: string | null;
}

export default function SummaryCards({ total, totalCount, categoryStats, activeCategory }: SummaryCardsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleCategoryClick = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === null || activeCategory === category) {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`space-y-2 mb-4 transition-opacity duration-150 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {/* Grand Total */}
      <div 
        onClick={() => activeCategory && handleCategoryClick(null)}
        className={`bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-3 shadow-md text-white select-none transition-all ${
          activeCategory ? 'cursor-pointer hover:opacity-90 active:scale-[0.99]' : ''
        }`}
      >
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
          <div className="text-right flex flex-col items-end justify-center">
            <p className="text-xs opacity-75">{totalCount} items</p>
            {activeCategory && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded mt-1 font-semibold hover:bg-white/35 transition-colors">
                Clear Filter ✕
              </span>
            )}
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

            const isSelected = activeCategory === stat.category;
            const hasFilter = !!activeCategory;
            const selectionStyles = hasFilter
              ? isSelected 
                ? 'opacity-100 ring-2 ring-white/80 ring-offset-2 ring-offset-indigo-600/10'
                : 'opacity-40 hover:opacity-70 scale-95'
              : 'hover:opacity-95 hover:scale-[1.01]';

            return (
              <div
                key={stat.category}
                onClick={() => handleCategoryClick(stat.category)}
                className={`bg-gradient-to-br ${gradient} rounded-lg p-2.5 shadow-md text-white cursor-pointer active:scale-[0.98] select-none transition-all duration-200 ${selectionStyles}`}
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
