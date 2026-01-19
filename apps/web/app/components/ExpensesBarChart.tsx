'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';

interface Expense {
  date: string;
  amount: number;
}

interface ExpensesBarChartProps {
  expenses: Expense[];
}

export default function ExpensesBarChart({ expenses }: ExpensesBarChartProps) {
  const data = useMemo(() => {
    const dailyMap = new Map<string, number>();

    expenses.forEach(expense => {
      // Ensure date is in YYYY-MM-DD format for consistency
      const dateKey = new Date(expense.date).toISOString().split('T')[0];
      const currentAmount = dailyMap.get(dateKey) || 0;
      dailyMap.set(dateKey, currentAmount + Number(expense.amount));
    });

    // Create array and sort by date
    return Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [expenses]);

  const formatCurrency = (value: number) => 
    `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(date);
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No expenses to display in chart
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#888888' }}
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={(value) => `₹${value}`}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#888888' }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
            formatter={(value: number | string | undefined) => [formatCurrency(Number(value) || 0), 'Spent']}
            labelFormatter={(label) => formatDate(label as string)}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#3b82f6" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
