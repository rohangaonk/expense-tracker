import Dexie, { type Table } from 'dexie';

export interface SyncQueueItem {
  id?: number;
  type: 'ADD_EXPENSE' | 'UPDATE_EXPENSE' | 'DELETE_EXPENSE';
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface LocalExpense {
  id?: string; // UUID from supabase or temp ID
  amount: number;
  category: string;
  description: string;
  date: string;
  merchant?: string;
  synced: boolean; // true if from server, false if locally added
}

export class ExpenseTrackerDB extends Dexie {
  syncQueue!: Table<SyncQueueItem>;
  expenses!: Table<LocalExpense>;

  constructor() {
    super('ExpenseTrackerDB');
    this.version(1).stores({
      syncQueue: '++id, type, timestamp',
      expenses: 'id, date, synced' 
    });
  }
}

export const db = new ExpenseTrackerDB();
