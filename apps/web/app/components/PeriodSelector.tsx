'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ViewMode, 
  formatPeriodLabel, 
  getPreviousPeriod, 
  getNextPeriod,
  parseDateFromParam,
  formatDateForParam,
  isCurrentPeriod
} from '@/app/lib/date-utils';

export default function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const viewMode = (searchParams.get('view') as ViewMode) || 'month';
  const dateParam = searchParams.get('date');
  const selectedDate = parseDateFromParam(dateParam);
  
  const periodLabel = formatPeriodLabel(selectedDate, viewMode);
  const isCurrent = isCurrentPeriod(selectedDate, viewMode);

  const updateParams = (newView?: ViewMode, newDate?: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newView) {
      params.set('view', newView);
    }
    
    if (newDate) {
      params.set('date', formatDateForParam(newDate));
    }
    
    router.push(`/?${params.toString()}`);
  };

  const handleViewChange = (mode: ViewMode) => {
    if (mode !== viewMode) {
      updateParams(mode, selectedDate);
    }
  };

  const handlePrevious = () => {
    const prevDate = getPreviousPeriod(selectedDate, viewMode);
    updateParams(undefined, prevDate);
  };

  const handleNext = () => {
    const nextDate = getNextPeriod(selectedDate, viewMode);
    updateParams(undefined, nextDate);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
      {/* Tab Selector */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleViewChange('month')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'month'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'week'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Week
          </button>
        </div>
        
        {!isCurrent && (
          <button
            onClick={() => updateParams(viewMode, new Date())}
            className="text-xs px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
          >
            Today
          </button>
        )}
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Previous period"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {periodLabel}
        </h2>

        <button
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Next period"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
