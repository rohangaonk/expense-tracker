'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { processSyncQueue } from '../lib/offline/sync';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/offline/db';
import { useToast } from './ToastProvider';

interface OfflineSyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
}

const OfflineSyncContext = createContext<OfflineSyncContextType>({
  isOnline: true,
  isSyncing: false,
});

export function useOfflineSync() {
  return useContext(OfflineSyncContext);
}

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const pendingCount = useLiveQuery(() => db.syncQueue.count(), [], 0);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Initial online/offline state check
    const online = navigator.onLine;
    setIsOnline(online);
    
    console.log('[OfflineSyncProvider] Component mounted, online status:', online);
  }, []);

  // Separate effect for initial sync - runs after mount
  useEffect(() => {
    const checkAndSync = async () => {
      if (navigator.onLine) {
        console.log('[OfflineSyncProvider] Checking for pending items on mount...');
        const count = await db.syncQueue.count();
        console.log('[OfflineSyncProvider] Pending items:', count);
        
        if (count > 0) {
          console.log('[OfflineSyncProvider] Triggering auto-sync...');
          handleSync();
        }
      }
    };
    
    // Small delay to ensure everything is hydrated
    const timer = setTimeout(checkAndSync, 500);
    return () => clearTimeout(timer);
  }, []); // Run once on mount

  function handleSync() {
    console.log('[OfflineSyncProvider] handleSync called');
    setIsSyncing(true);
    processSyncQueue()
      .then((results) => {
         console.log('[OfflineSyncProvider] Sync results:', results);
         if (results && results.length > 0) {
           const successCount = results.filter(r => r.status === 'success').length;
           const failCount = results.filter(r => r.status === 'error').length;
           
           console.log(`[OfflineSyncProvider] Success: ${successCount}, Failed: ${failCount}`);
           
           if (successCount > 0) {
               showSuccess(`Successfully synced ${successCount} expense(s)!`);
               window.location.reload(); // Reload to show synced expenses
           }
           if (failCount > 0) {
               showError(`Failed to sync ${failCount} expense(s). Check console for details.`);
           }
         } else {
           console.log('[OfflineSyncProvider] No items were synced');
         }
      })
      .catch(err => {
        console.error('[OfflineSyncProvider] Sync error:', err);
        showError('Sync failed: ' + err.message);
      })
      .finally(() => {
        console.log('[OfflineSyncProvider] Sync process finished');
        setIsSyncing(false);
      });
  }

  // Event listeners for online/offline changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[OfflineSyncProvider] Network came online. Processing sync queue...');
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[OfflineSyncProvider] Network went offline.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OfflineSyncContext.Provider value={{ isOnline, isSyncing }}>
      {children}
      {/* Global Status Indicator could go here, or be a separate component */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white text-center text-xs py-1 z-50">
           You are offline. Changes will be saved locally.
        </div>
      )}
      {isSyncing && (
         <div className="fixed bottom-0 left-0 right-0 bg-blue-500 text-white text-center text-xs py-1 z-50">
           Syncing offline changes... ({pendingCount} pending)
        </div>
      )}
    </OfflineSyncContext.Provider>
  );
}
