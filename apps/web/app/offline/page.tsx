'use client';

import Link from 'next/link';
import PendingExpenses from '../components/PendingExpenses';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
             <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M12 9v.008m0 4.492v.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          You are Offline
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400">
          We can&apos;t load your dashboard right now, but your pending expenses are safe.
        </p>

        <div className="text-left w-full">
            <PendingExpenses />
        </div>

        <Link 
          href="/add" 
          className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          Add Expense Offline
        </Link>
        
        <button 
           onClick={() => window.location.reload()}
           className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 underline mt-4"
        >
            Try Reloading
        </button>
      </div>
    </div>
  );
}
