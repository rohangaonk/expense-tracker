// Predefined expense categories with icons and colors
export const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', color: 'orange' },
  { name: 'Groceries', icon: '🛒', color: 'green' },
  { name: 'Transport', icon: '🚗', color: 'blue' },
  { name: 'Shopping', icon: '🛍️', color: 'purple' },
  { name: 'Electronics', icon: '📱', color: 'indigo' },
  { name: 'Bills & Utilities', icon: '📄', color: 'red' },
  { name: 'Entertainment', icon: '🎬', color: 'pink' },
  { name: 'Health & Fitness', icon: '💪', color: 'teal' },
  { name: 'Education', icon: '📚', color: 'yellow' },
  { name: 'Travel', icon: '✈️', color: 'cyan' },
  { name: 'Personal Care', icon: '💇', color: 'rose' },
  { name: 'Home & Garden', icon: '🏠', color: 'lime' },
  { name: 'Gifts & Donations', icon: '🎁', color: 'violet' },
  { name: 'Insurance', icon: '🛡️', color: 'slate' },
  { name: 'Other', icon: '📦', color: 'gray' },
] as const;

export type CategoryName = typeof EXPENSE_CATEGORIES[number]['name'];

// Get category details by name
export function getCategoryDetails(categoryName: string) {
  return EXPENSE_CATEGORIES.find(cat => cat.name === categoryName) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

// Get category color classes for Tailwind
export function getCategoryColorClasses(categoryName: string) {
  const category = getCategoryDetails(categoryName);
  const colorMap: Record<string, string> = {
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    slate: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  };
  
  return colorMap[category.color] || colorMap.gray;
}
