'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryStat } from '../actions/dashboard';
import { getCategoryDetails } from '../../lib/categories';

const COLOR_MAP: Record<string, string> = {
  amber:  '#f59e0b',
  cyan:   '#06b6d4',
  green:  '#10b981',
  red:    '#ef4444',
  orange: '#f97316',
  lime:   '#84cc16',
  indigo: '#6366f1',
  sky:    '#0ea5e9',
  purple: '#a855f7',
  rose:   '#f43f5e',
  pink:   '#ec4899',
  teal:   '#14b8a6',
  stone:  '#78716c',
  violet: '#8b5cf6',
  gray:   '#6b7280',
};

interface ExpensesPieChartProps {
  categoryStats: CategoryStat[];
}

export default function ExpensesPieChart({ categoryStats }: ExpensesPieChartProps) {
  const data = categoryStats
    .filter(s => s.total_amount > 0)
    .map((s) => {
      const cat = getCategoryDetails(s.category);
      return {
        name: s.category,
        value: s.total_amount,
        icon: cat.icon,
        color: COLOR_MAP[cat.color] || COLOR_MAP.gray,
      };
    });

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
            paddingAngle={3}
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
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => {
              const item = data.find(d => d.name === value);
              return `${item?.icon ?? ''} ${value}`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
