// Centralized category definitions — single source of truth

export const CATEGORY_ORDER = [
  'Produce',
  'Dairy',
  'Dairy Alternatives',
  'Bakery',
  'Beverages',
  'Grains & Staples',
  'Snacks',
  'Condiments',
  'Frozen',
  'Personal Care',
  'Household',
  'Other',
] as const;

export type Category = (typeof CATEGORY_ORDER)[number];

export const CATEGORY_ICONS: Record<string, string> = {
  Produce: '🥬',
  Dairy: '🥛',
  'Dairy Alternatives': '🫙',
  Bakery: '🍞',
  Beverages: '☕',
  Snacks: '🍿',
  'Personal Care': '🧴',
  Household: '🧹',
  'Grains & Staples': '🌾',
  Condiments: '🫒',
  Frozen: '🧊',
  Other: '📦',
};

export const CATEGORY_COLORS: Record<string, string> = {
  Produce:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Dairy: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Dairy Alternatives':
    'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  Bakery: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Beverages:
    'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Snacks:
    'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Personal Care':
    'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Household:
    'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  'Grains & Staples':
    'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Condiments:
    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Frozen: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  Other: 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
};

/**
 * Maps product keywords to categories.
 * Keys are lowercase. Only keywords that don't appear in the product database
 * by exact name should be listed here — product-level categorization
 * comes from the Product.category field in the product database.
 */
export const KEYWORD_CATEGORY_MAP: Record<string, string> = {
  // Dairy
  milk: 'Dairy',
  yogurt: 'Dairy',
  cheese: 'Dairy',
  butter: 'Dairy',
  curd: 'Dairy',
  paneer: 'Dairy',
  cream: 'Dairy',
  eggs: 'Dairy',
  // Dairy Alternatives
  'almond milk': 'Dairy Alternatives',
  'oat milk': 'Dairy Alternatives',
  'soy milk': 'Dairy Alternatives',
  // Produce
  apple: 'Produce',
  banana: 'Produce',
  tomato: 'Produce',
  onion: 'Produce',
  potato: 'Produce',
  mango: 'Produce',
  watermelon: 'Produce',
  corn: 'Produce',
  spinach: 'Produce',
  carrot: 'Produce',
  cucumber: 'Produce',
  lemon: 'Produce',
  strawberry: 'Produce',
  grapes: 'Produce',
  orange: 'Produce',
  peas: 'Produce',
  guava: 'Produce',
  // Bakery
  bread: 'Bakery',
  croissant: 'Bakery',
  bun: 'Bakery',
  cake: 'Bakery',
  biscuit: 'Bakery',
  toast: 'Bakery',
  'pav': 'Bakery',
  // Beverages
  tea: 'Beverages',
  coffee: 'Beverages',
  juice: 'Beverages',
  water: 'Beverages',
  cola: 'Beverages',
  // Snacks
  chips: 'Snacks',
  chocolate: 'Snacks',
  nut: 'Snacks',
  granola: 'Snacks',
  crisp: 'Snacks',
  bhujia: 'Snacks',
  // Personal Care
  toothpaste: 'Personal Care',
  soap: 'Personal Care',
  shampoo: 'Personal Care',
  facewash: 'Personal Care',
  // Household
  detergent: 'Household',
  dishwash: 'Household',
  cleaner: 'Household',
  towel: 'Household',
  // Grains & Staples
  rice: 'Grains & Staples',
  atta: 'Grains & Staples',
  flour: 'Grains & Staples',
  dal: 'Grains & Staples',
  quinoa: 'Grains & Staples',
  'toor': 'Grains & Staples',
  // Condiments
  oil: 'Condiments',
  sauce: 'Condiments',
  jam: 'Condiments',
  salt: 'Condiments',
  sugar: 'Condiments',
};

export function getCategoryForProduct(productName: string): string {
  const lower = productName.toLowerCase();
  // Try longest keyword match first for multi-word matches
  const entries = Object.entries(KEYWORD_CATEGORY_MAP).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [keyword, category] of entries) {
    if (lower.includes(keyword) || keyword.includes(lower)) {
      return category;
    }
  }
  return 'Other';
}

export function sortCategories(categories: string[]): string[] {
  return [...categories].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a as Category) - CATEGORY_ORDER.indexOf(b as Category),
  );
}
