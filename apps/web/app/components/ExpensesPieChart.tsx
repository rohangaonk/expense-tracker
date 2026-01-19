'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExpensesPieChartProps {
  regularTotal: number;
  recurringTotal: number;
  houseTotal: number;
  parentsTotal: number;
}

export default function ExpensesPieChart({
  regularTotal,
  recurringTotal,
  houseTotal,
  parentsTotal,
}: ExpensesPieChartProps) {
  const data = [
    { name: 'Regular', value: regularTotal, color: '#a855f7' }, // Purple
    { name: 'Recurring', value: recurringTotal, color: '#3b82f6' }, // Blue
    { name: 'House', value: houseTotal, color: '#f97316' }, // Orange
    { name: 'Parents', value: parentsTotal, color: '#6366f1' }, // Indigo
  ].filter(item => item.value > 0);

  const formatCurrency = (value: number) => 
    `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No expenses to display in chart
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number | string | undefined) => [formatCurrency(Number(value) || 0), 'Amount']}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
