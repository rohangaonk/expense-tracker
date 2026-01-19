'use client';

interface SummaryCardsProps {
  recurring: number;
  houseTotal: number;
  parentsTotal: number;
  regularTotal: number;

  total: number;
  recurringCount: number;
  houseCount: number;
  parentsCount: number;
  regularCount: number;
  nonRecurringCount: number;
}

export default function SummaryCards({ 
  recurring, 
  houseTotal,
  parentsTotal,
  regularTotal,

  total,
  recurringCount,
  houseCount,
  parentsCount,
  regularCount,
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
        {/* Recurring */}
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

        {/* Regular (One-time minus special cats) */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2.5 shadow-md text-white">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">💰</span>
            <p className="text-xs opacity-90">Regular</p>
          </div>
          <p className="text-lg font-bold leading-tight">
            ₹{regularTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-75 mt-0.5">{regularCount} items</p>
        </div>

        {/* House */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-2.5 shadow-md text-white">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">🏠</span>
            <p className="text-xs opacity-90">House</p>
          </div>
          <p className="text-lg font-bold leading-tight">
            ₹{houseTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-75 mt-0.5">{houseCount} items</p>
        </div>

        {/* Parents */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-2.5 shadow-md text-white">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">👪</span>
            <p className="text-xs opacity-90">Parents</p>
          </div>
          <p className="text-lg font-bold leading-tight">
            ₹{parentsTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-75 mt-0.5">{parentsCount} items</p>
        </div>
      </div>
    </div>
  );
}
