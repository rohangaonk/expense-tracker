// Predefined expense categories with icons and colors
export const EXPENSE_CATEGORIES = [
  { name: 'Fuel',          icon: '⛽', color: 'amber'  },
  { name: 'Fish',          icon: '🐟', color: 'cyan'   },
  { name: 'Gym',           icon: '💪', color: 'green'  },
  { name: 'Bills',         icon: '📄', color: 'red'    },
  { name: 'Junk',          icon: '🍟', color: 'orange' },
  { name: 'Groceries',     icon: '🛒', color: 'lime'   },
  { name: 'Family',        icon: '👨‍👩‍👧‍👦', color: 'indigo' },
  { name: 'Travel',        icon: '✈️', color: 'sky'    },
  { name: 'Shopping',      icon: '🛍️', color: 'purple' },
  { name: 'Food & Dining', icon: '🍽️', color: 'rose'   },
  { name: 'Personal Care', icon: '💇', color: 'pink'   },
  { name: 'Health',        icon: '🏥', color: 'teal'   },
  { name: 'House',         icon: '🏠', color: 'stone'  },
  { name: 'Entertainment', icon: '🎬', color: 'violet' },
  { name: 'Other',         icon: '📦', color: 'gray'   },
] as const;

export type CategoryName = typeof EXPENSE_CATEGORIES[number]['name'];

// Get category details by name
export function getCategoryDetails(categoryName: string) {
  return EXPENSE_CATEGORIES.find(cat => cat.name === categoryName) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

// Get category color classes for Tailwind
export function getCategoryColorClasses(categoryName: string) {
  const category = getCategoryDetails(categoryName);
  const colorMap: Record<string, string> = {
    amber:  'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-300',
    cyan:   'bg-cyan-100   text-cyan-800   dark:bg-cyan-900/30   dark:text-cyan-300',
    green:  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
    red:    'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    lime:   'bg-lime-100   text-lime-800   dark:bg-lime-900/30   dark:text-lime-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    sky:    'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    rose:   'bg-rose-100   text-rose-800   dark:bg-rose-900/30   dark:text-rose-300',
    pink:   'bg-pink-100   text-pink-800   dark:bg-pink-900/30   dark:text-pink-300',
    teal:   'bg-teal-100   text-teal-800   dark:bg-teal-900/30   dark:text-teal-300',
    stone:  'bg-stone-100  text-stone-800  dark:bg-stone-900/30  dark:text-stone-300',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    gray:   'bg-gray-100   text-gray-800   dark:bg-gray-900/30   dark:text-gray-300',
  };
  return colorMap[category.color] ?? colorMap.gray;
}
