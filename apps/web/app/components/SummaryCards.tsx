'use client';

interface SummaryCardsProps {
  recurring: number;
  nonRecurring: number;
  total: number;
  recurringCount: number;
  nonRecurringCount: number;
}

export default function SummaryCards({ 
  recurring, 
  nonRecurring, 
  total,
  recurringCount,
  nonRecurringCount 
}: SummaryCardsProps) {
  return (
    <div className="space-y-2 mb-4">
      {/* Grand Total - Most Important */}
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
            <p className="text-xs opacity-75">{recurringCount + nonRecurringCount} items</p>
          </div>
        </div>
      </div>

      {/* Recurring & One-time in a row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2.5 shadow-md text-white">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">🔄</span>
            <p className="text-xs opacity-90">Recurring</p>
          </div>
          <p className="text-lg font-bold leading-tight">
            ₹{recurring.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-75 mt-0.5">{recurringCount} items</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2.5 shadow-md text-white">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">💰</span>
            <p className="text-xs opacity-90">One-time</p>
          </div>
          <p className="text-lg font-bold leading-tight">
            ₹{nonRecurring.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-75 mt-0.5">{nonRecurringCount} items</p>
        </div>
      </div>
    </div>
  );
}
