'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteExpenseAction } from '../actions/expense';
import { useConfirmDialog } from '@/components/ConfirmDialogProvider';
import { useToast } from '@/components/ToastProvider';
import { Expense } from '../actions/dashboard';
import { getCategoryDetails } from '../../lib/categories';

export default function ExpenseCard({ expense }: { expense: Expense }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm } = useConfirmDialog();
  const { showError } = useToast();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Expense?',
      message: 'Are you sure you want to delete this expense? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
    });

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteExpenseAction(expense.id);
    } catch (err) {
      console.error(err);
      showError('Failed to delete expense');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Icon & Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg bg-gray-50 dark:bg-gray-800 p-1 rounded-md">
              {getCategoryIcon(expense.category)}
            </span>
            <p className="text-base text-gray-900 dark:text-white font-medium truncate">
              {expense.description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-11">
            {expense.merchant && <span>{expense.merchant}</span>}
            {expense.merchant && <span>•</span>}
            <span>
              {new Date(expense.date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Right Side: Amount & Actions */}
        <div className="flex flex-col items-end gap-1">
          <p className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
            ₹{Number(expense.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          
          <div className="flex gap-1">
            <Link
              href={`/edit/${expense.id}`}
              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string) {
  return getCategoryDetails(category).icon;
}
