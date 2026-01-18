import { db } from './db';
import { saveExpenseForSync, type ExpenseData } from '../../app/actions/expense';

export async function addToSyncQueue(data: ExpenseData, type: 'ADD_EXPENSE' = 'ADD_EXPENSE') {
  console.log('[Sync Queue] Adding item to queue:', { type, data });
  await db.syncQueue.add({
    type,
    payload: data,
    timestamp: Date.now(),
  });
  console.log('[Sync Queue] Item added successfully');
}

export async function processSyncQueue() {
  console.log('[Sync Queue] Starting sync process...');
  const queue = await db.syncQueue.toArray();
  console.log(`[Sync Queue] Found ${queue.length} items in queue`);
  
  if (queue.length === 0) {
    console.log('[Sync Queue] No items to sync');
    return [];
  }

  const results = [];

  for (const item of queue) {
    console.log(`[Sync Queue] Processing item ${item.id}:`, item);
    try {
      if (item.type === 'ADD_EXPENSE') {
        console.log('[Sync Queue] Calling saveExpenseForSync...');
        const result = await saveExpenseForSync(item.payload as ExpenseData);
        console.log('[Sync Queue] Save result:', result);
        
        // Delete from queue on success
        await db.syncQueue.delete(item.id!);
        console.log(`[Sync Queue] Item ${item.id} synced and removed from queue`);
        results.push({ id: item.id, status: 'success' });
      }
    } catch (error) {
      console.error(`[Sync Queue] Error processing item ${item.id}:`, error);
      results.push({ id: item.id, status: 'error', error });
      // Keep in queue for retry
    }
  }
  
  console.log('[Sync Queue] Sync complete. Results:', results);
  return results;
}
