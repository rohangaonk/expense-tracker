'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import {
  parseExpensesAction,
  saveBulkExpensesAction,
  type ExpenseData,
} from '../actions/expense';
import { addToSyncQueue } from '../../lib/offline/sync';
import Link from 'next/link';
import VoiceButton from '../components/VoiceButton';
import { useToast } from '../../components/ToastProvider';
import { ParsedExpense } from '@repo/ai';

import { EXPENSE_CATEGORIES } from '../../lib/categories';

const CATEGORIES = EXPENSE_CATEGORIES.map(c => c.name);


// ---------------------------------------------------------------------------
// ReviewItem — an editable parsed expense card
// ---------------------------------------------------------------------------
interface ReviewItemProps {
  item: ParsedExpense & { _id: string };
  index: number;
  onChange: (id: string, updated: Partial<ParsedExpense>) => void;
  onRemove: (id: string) => void;
}

function ReviewItem({ item, index, onChange, onRemove }: ReviewItemProps) {
  const [editing, setEditing] = useState(false);
  const uid = useId();

  const field = (key: keyof ParsedExpense, value: unknown) =>
    onChange(item._id, { [key]: value });

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border transition-all duration-200 shadow-sm ${
      editing
        ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/40'
        : 'border-gray-100 dark:border-gray-800'
    }`}>
      {/* Collapsed summary row */}
      {!editing && (
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Index badge */}
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {item.description || <span className="text-gray-400 italic">No description</span>}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {item.category} • {item.date}
            </p>
          </div>

          <p className="flex-shrink-0 text-base font-bold text-gray-900 dark:text-white">
            ₹{Number(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
            <button
              onClick={() => onRemove(item._id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Expanded editor */}
      {editing && (
        <div className="p-4 space-y-3">
          {/* Row 1: Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Amount (₹)</label>
              <input
                id={`${uid}-amount`}
                type="number"
                step="0.01"
                value={item.amount ?? ''}
                onChange={e => field('amount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Date</label>
              <input
                id={`${uid}-date`}
                type="date"
                value={item.date ?? ''}
                onChange={e => field('date', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Description</label>
            <input
              id={`${uid}-desc`}
              type="text"
              value={item.description}
              onChange={e => field('description', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Brief description"
            />
          </div>

          {/* Row 3: Category + Merchant */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Category</label>
              <select
                id={`${uid}-cat`}
                value={item.category}
                onChange={e => field('category', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Merchant</label>
              <input
                id={`${uid}-merchant`}
                type="text"
                value={item.merchant ?? ''}
                onChange={e => field('merchant', e.target.value || null)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Done button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Blank expense template
// ---------------------------------------------------------------------------
const today = new Date().toISOString().split('T')[0];

function blankItem(): ParsedExpense & { _id: string } {
  return {
    _id: crypto.randomUUID(),
    amount: null,
    currency: 'INR',
    category: 'Other',
    description: '',
    merchant: null,
    date: today,
    time: null,
  };
}

// ---------------------------------------------------------------------------
// Main Add Expense Page
// ---------------------------------------------------------------------------
export default function AddExpensePage() {
  const [inputVal, setInputVal] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // null = input step; array = review step
  const [items, setItems] = useState<(ParsedExpense & { _id: string })[] | null>(null);

  const { showInfo, showError } = useToast();

  // ---- Parsing ----
  const handleParse = useCallback(async () => {
    if (!inputVal.trim()) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const parsed = await parseExpensesAction(inputVal);
      setItems(
        parsed.map(p => ({ ...p, _id: crypto.randomUUID() }))
      );
    } catch (err) {
      console.error(err);
      setParseError('Could not parse expenses. Please try again.');
    } finally {
      setIsParsing(false);
    }
  }, [inputVal]);

  // Auto-parse after voice recording
  const handleRecordingComplete = (transcript: string) => {
    setVoiceTranscript(transcript);
    setInputVal(transcript);
  };
  useEffect(() => {
    if (voiceTranscript.trim()) {
      handleParse();
      setVoiceTranscript('');
    }
  }, [voiceTranscript, handleParse]);

  // ---- Item mutations ----
  const handleChange = (id: string, updated: Partial<ParsedExpense>) => {
    setItems(prev => prev?.map(it => it._id === id ? { ...it, ...updated } : it) ?? null);
  };
  const handleRemove = (id: string) => {
    setItems(prev => {
      const next = prev?.filter(it => it._id !== id) ?? null;
      return next?.length ? next : null; // go back to input step if all removed
    });
  };
  const handleAddBlank = () => {
    setItems(prev => [...(prev ?? []), blankItem()]);
  };

  // ---- Saving ----
  const handleSave = async () => {
    if (!items?.length) return;

    // Validate: every item must have amount > 0 and a description
    const invalid = items.find(it => !it.amount || it.amount <= 0 || !it.description.trim());
    if (invalid) {
      showError('Each expense needs an amount and description.');
      return;
    }

    setIsSaving(true);
    try {
      const expenseData: ExpenseData[] = items.map(it => ({
        amount: it.amount!,
        currency: it.currency || 'INR',
        category: it.category,
        description: it.description,
        merchant: it.merchant ?? null,
        date: it.date ?? today,
        time: it.time ?? null,
      }));

      if (navigator.onLine) {
        await saveBulkExpensesAction(expenseData);
      } else {
        for (const data of expenseData) {
          await addToSyncQueue(data);
        }
        showInfo(`You are offline. ${expenseData.length} expense${expenseData.length > 1 ? 's' : ''} saved locally and will sync when online.`);
        setItems(null);
        setInputVal('');
      }
    } catch (err) {
      console.error(err);
      showError('Failed to save expenses. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Render ----
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4">
      <div className="max-w-md mx-auto space-y-5">

        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            ← Back
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add Expenses</h1>
          {/* Spacer to center title */}
          <span className="w-10" />
        </header>

        {/* ── Step 1: Input ── */}
        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            What did you spend on?
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            You can enter multiple expenses separated by commas — e.g. <em>500 pizza, 180 petrol, 100 milk</em>
          </p>
          <div className="relative">
            <textarea
              className="w-full p-3 pr-24 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm resize-none"
              rows={3}
              placeholder="e.g. 500 pizza, 180 petrol, 100 milk"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleParse(); }}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <VoiceButton
                onTranscriptChange={setInputVal}
                onRecordingComplete={handleRecordingComplete}
              />
              <button
                onClick={handleParse}
                disabled={isParsing || !inputVal.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1"
              >
                {isParsing ? (
                  <span>Parsing…</span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M15.98 1.804a1 1 0 0 0-1.215-.04l-7.276 5.25a1 1 0 0 0-.295 1.054l1.396 4.312-3.805 1.902a1 1 0 0 0-.48 1.137l.462 2.312a1 1 0 0 0 .98.804h.023l2.355-.392a1 1 0 0 0 .762-.777l.951-4.755 3.996-1.998a1 1 0 0 0 .5-1.528l-1.026-4.502 3.016-2.176a1 1 0 0 0-.154-1.65Z" />
                    </svg>
                    Magic Parse
                  </>
                )}
              </button>
            </div>
          </div>
          {parseError && <p className="text-red-500 text-xs">{parseError}</p>}
        </section>

        {/* ── Step 2: Review list ── */}
        {items && items.length > 0 && (
          <section className="space-y-3">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Review {items.length} expense{items.length !== 1 ? 's' : ''}
              </h2>
              <button
                onClick={() => { setItems(null); }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ← Re-parse
              </button>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {items.map((item, i) => (
                <ReviewItem
                  key={item._id}
                  item={item}
                  index={i}
                  onChange={handleChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Add another row */}
            <button
              onClick={handleAddBlank}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add another expense
            </button>

            {/* Total + Save */}
            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold text-white">
                  ₹{items.reduce((s, it) => s + (it.amount || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-white dark:bg-gray-100 text-gray-900 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : `Save ${items.length} expense${items.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
