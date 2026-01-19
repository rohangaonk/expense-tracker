'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { parseExpenseAction, saveExpenseAction, type ExpenseData } from '../actions/expense';
import { addToSyncQueue } from '../../lib/offline/sync';
import Link from 'next/link';
import VoiceButton from '../components/VoiceButton';
import { useToast } from '../../components/ToastProvider';

export default function AddExpensePage() {
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const { showInfo } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ExpenseData>({
    defaultValues: {
      currency: 'INR',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
    },
  });

  const [inputVal, setInputVal] = useState('');
  const isRecurring = watch('is_recurring');

  const handleParse = useCallback(async () => {
    if (!inputVal.trim()) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const parsed = await parseExpenseAction(inputVal);
      if (parsed.amount) setValue('amount', parsed.amount);
      if (parsed.currency) setValue('currency', parsed.currency);
      if (parsed.category) setValue('category', parsed.category);
      if (parsed.description) setValue('description', parsed.description);
      if (parsed.merchant) setValue('merchant', parsed.merchant);
      if (parsed.date) setValue('date', parsed.date);
      if (parsed.time) setValue('time', parsed.time);
      if (parsed.is_recurring) setValue('is_recurring', parsed.is_recurring);
      if (parsed.is_house) setValue('is_house', parsed.is_house);
      if (parsed.is_parents) setValue('is_parents', parsed.is_parents);
    } catch (err) {
      console.error(err);
      setParseError('Failed to parse expense. Please try again.');
    } finally {
      setIsParsing(false);
    }
  }, [inputVal, setValue]);

  const onSubmit = async (data: ExpenseData) => {
    setIsSaving(true);
    try {
      if (navigator.onLine) {
        await saveExpenseAction(data);
      } else {
        await addToSyncQueue(data);
        showInfo('You are offline. Expense saved locally and will sync when online.');
         // Optional: Reset form here as if success
      }
      // Reset form on success (both online/offline cases, assuming addToSyncQueue doesn't throw easily)
      setInputVal('');
      setVoiceTranscript('');
      // You might want to reset the form fields too if not redirected
    } catch (err) {
      console.error(err);
      alert('Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle voice transcript updates
  const handleTranscriptChange = (transcript: string) => {
    setInputVal(transcript);
  };

  // Auto-parse when voice recording completes
  const handleRecordingComplete = (transcript: string) => {
    setVoiceTranscript(transcript);
    setInputVal(transcript);
  };

  // Trigger parsing when voice transcript is set
  useEffect(() => {
    if (voiceTranscript && voiceTranscript.trim()) {
      handleParse();
      setVoiceTranscript(''); // Reset to avoid re-parsing
    }
  }, [voiceTranscript, handleParse]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center justify-between">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              &larr; Back
            </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add Expense</h1>
        </header>

        <section className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Natural Language Input
          </label>
          <div className="relative">
            <textarea
              className="w-full p-3 pr-24 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
              rows={3}
              placeholder="e.g., Spent 150 on coffee at Starbucks"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <VoiceButton
                onTranscriptChange={handleTranscriptChange}
                onRecordingComplete={handleRecordingComplete}
              />
              <button
                onClick={handleParse}
                disabled={isParsing || !inputVal}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1"
              >
                {isParsing ? (
                  <span>Parsing...</span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M15.98 1.804a1 1 0 0 0-1.215-.04l-7.276 5.25a1 1 0 0 0-.295 1.054l1.396 4.312-3.805 1.902a1 1 0 0 0-.48 1.137l.462 2.312a1 1 0 0 0 .98.804h.023l2.355-.392a1 1 0 0 0 .762-.777l.951-4.755 3.996-1.998a1 1 0 0 0 .5-1.528l-1.026-4.502 3.016-2.176a1 1 0 0 0-.154-1.65ZM5.286 9.42l3.498-2.527.702 3.067-4.2 .92 3.23-3.086Z" />
                    </svg>
                    Magic Parse
                  </>
                )}
              </button>
            </div>
          </div>
          {parseError && <p className="text-red-500 text-xs">{parseError}</p>}
        </section>

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


          {/* Special Flags */}
          <div className="grid grid-cols-2 gap-4">
             <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <input
                  type="checkbox"
                  id="is_house"
                  {...register('is_house')}
                  className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="is_house" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  <span className="text-lg">🏠</span>
                  House
                </label>
             </div>
             
             <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <input
                  type="checkbox"
                  id="is_parents"
                  {...register('is_parents')}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_parents" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  <span className="text-lg">👪</span>
                  Parents
                </label>
             </div>
          </div>
          {/* Recurring Expense Toggle */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <input
              type="checkbox"
              id="is_recurring"
              {...register('is_recurring')}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_recurring" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
              <span className="text-lg">🔄</span>
              Mark as recurring expense
            </label>
          </div>

          {/* Recurrence Period (shown only if recurring is checked) */}
          {isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recurrence Period
              </label>
              <select
                {...register('recurrence_period')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select period...</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
          >
            {isSaving ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
