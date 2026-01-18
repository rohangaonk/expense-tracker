'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateExpenseAction, type ExpenseData } from '@/app/actions/expense';
import Link from 'next/link';

interface EditExpenseFormProps {
  expense: {
    id: string;
    amount: number;
    currency: string;
    category: string;
    description: string;
    merchant: string | null;
    date: string;
    time: string | null;
  };
}

export default function EditExpenseForm({ expense }: EditExpenseFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseData>({
    defaultValues: {
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      description: expense.description,
      merchant: expense.merchant,
      date: expense.date,
      time: expense.time,
    },
  });

  const onSubmit = async (data: ExpenseData) => {
    setIsSaving(true);
    try {
      await updateExpenseAction(expense.id, data);
    } catch (err) {
      console.error(err);
      alert('Failed to update expense');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            &larr; Back
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Expense</h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { required: true, valueAsNumber: true })}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0.00"
            />
            {errors.amount && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</label>
            <input
              type="text"
              {...register('category', { required: true })}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Food, Travel, etc."
            />
            {errors.category && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
            <input
              type="text"
              {...register('description', { required: true })}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Brief description"
            />
            {errors.description && <span className="text-red-500 text-xs">Required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Date</label>
              <input
                type="date"
                {...register('date', { required: true })}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Merchant (Optional)</label>
              <input
                type="text"
                {...register('merchant')}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Store name"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
          >
            {isSaving ? 'Saving...' : 'Update Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
