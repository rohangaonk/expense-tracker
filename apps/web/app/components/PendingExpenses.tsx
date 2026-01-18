'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/offline/db';
import { processSyncQueue } from '../../lib/offline/sync';
import { useState } from 'react';

export default function PendingExpenses() {
  const pendingCount = useLiveQuery(() => db.syncQueue.where('type').equals('ADD_EXPENSE').count(), [], 0);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    console.log('[PendingExpenses] Manual sync triggered');
    setIsSyncing(true);
    try {
      const results = await processSyncQueue();
      console.log('[PendingExpenses] Sync results:', results);
      
      const successCount = results?.filter(r => r.status === 'success').length || 0;
      const failCount = results?.filter(r => r.status === 'error').length || 0;
      
      if (successCount > 0) {
        alert(`✅ Successfully synced ${successCount} expense(s)!`);
        window.location.reload(); // Reload to show updated expenses
      }
      if (failCount > 0) {
        alert(`❌ Failed to sync ${failCount} expense(s). Check console for details.`);
      }
    } catch (error) {
      console.error('[PendingExpenses] Sync error:', error);
      alert('❌ Sync failed: ' + (error as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!pendingCount || pendingCount === 0) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-800/40 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-600 dark:text-yellow-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Pending Sync</h3>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            {pendingCount} expense{pendingCount > 1 ? 's' : ''} waiting to be synced.
          </p>
        </div>
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
}
