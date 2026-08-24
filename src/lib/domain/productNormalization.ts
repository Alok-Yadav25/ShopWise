/**
 * Product normalization and alias system.
 * Single source of truth for mapping natural language product names
 * to canonical product database entries.
 */

export interface ProductAlias {
  canonicalName: string;
  aliases: string[];
  category: string;
}

// Aliases map: lowercase input → canonical product name
export const PRODUCT_ALIASES: Record<string, string> = {
  // Dairy
  milk: 'Amul Taaza Milk',
  'amul milk': 'Amul Taaza Milk',
  'taaza milk': 'Amul Taaza Milk',
  'amul taaza': 'Amul Taaza Milk',
  'mother dairy milk': 'Mother Dairy Milk',
  'mother dairy': 'Mother Dairy Milk',
  'amul gold': 'Amul Gold Milk',
  'gold milk': 'Amul Gold Milk',
  eggs: 'Free Range Eggs',
  egg: 'Free Range Eggs',
  'free range eggs': 'Free Range Eggs',
  yogurt: 'Epigamia Greek Yogurt',
  curd: 'Epigamia Greek Yogurt',
  dahi: 'Epigamia Greek Yogurt',
  butter: 'Amul Butter',
  cheese: 'Amul Cheese Slices',
  paneer: 'Amul Cheese Slices',

  // Dairy Alternatives
  'almond milk': 'Almond Breeze Milk',
  'almond breeze': 'Almond Breeze Milk',
  'oat milk': 'Oatly Oat Milk',
  oatly: 'Oatly Oat Milk',

  // Produce
  apples: 'Apples',
  apple: 'Apples',
  'green apples': 'Apples',
  'fresh apples': 'Apples',
  'organic apples': 'Organic Apples',
  bananas: 'Bananas',
  banana: 'Bananas',
  kela: 'Bananas',
  tomatoes: 'Tomatoes',
  tomato: 'Tomatoes',
  tamatar: 'Tomatoes',
  onions: 'Onions',
  onion: 'Onions',
  pyaz: 'Onions',
  potatoes: 'Potatoes',
  potato: 'Potatoes',
  aloo: 'Potatoes',
  spinach: 'Spinach',
  palak: 'Spinach',
  'sweet corn': 'Sweet Corn',
  corn: 'Sweet Corn',
  mango: 'Mango (Alphonso)',
  aam: 'Mango (Alphonso)',
  'mango alphonso': 'Mango (Alphonso)',
  watermelon: 'Watermelon',
  strawberry: 'Strawberries',
  strawberries: 'Strawberries',
  lemon: 'Lemons',
  nimbu: 'Lemons',
  cucumber: 'Cucumber',
  kakdi: 'Cucumber',
  carrots: 'Carrots',
  carrot: 'Carrots',
  gajar: 'Carrots',
  peas: 'Peas',
  orange: 'Oranges',
  oranges: 'Oranges',
  grapes: 'Grapes',
  guava: 'Guava',

  // Bakery
  bread: 'Whole Wheat Bread',
  'whole wheat bread': 'Whole Wheat Bread',
  'wheat bread': 'Whole Wheat Bread',
  'double roti': 'Whole Wheat Bread',
  'multigrain bread': 'Organic Multigrain Bread',
  'organic bread': 'Organic Multigrain Bread',
  croissant: 'Croissant',
  'pav bun': 'Pav Bun',
  pav: 'Pav Bun',

  // Beverages
  tea: 'Tata Gold Tea',
  'tata tea': 'Tata Gold Tea',
  chai: 'Tata Gold Tea',
  coffee: 'Nescafe Classic Coffee',
  nescafe: 'Nescafe Classic Coffee',
  'real juice': 'Real Fruit Juice - Mango',
  'fruit juice': 'Real Fruit Juice - Mango',
  bisleri: 'Bisleri Water',
  water: 'Bisleri Water',
  pani: 'Bisleri Water',

  // Snacks
  chips: "Lay's Classic Salted Chips",
  lays: "Lay's Classic Salted Chips",
  'granola bar': 'Nature Valley Granola Bar',
  granola: 'Nature Valley Granola Bar',
  'aloo bhujia': 'Haldiram Aloo Bhujia',
  bhujia: 'Haldiram Aloo Bhujia',
  chocolate: 'Dark Chocolate 70%',
  'dark chocolate': 'Dark Chocolate 70%',
  'mixed nuts': 'Mixed Nuts',
  nuts: 'Mixed Nuts',

  // Personal Care
  toothpaste: 'Colgate MaxFresh Toothpaste',
  'face wash': 'Himalaya Neem Face Wash',
  facewash: 'Himalaya Neem Face Wash',
  shampoo: 'Head & Shoulders Shampoo',
  soap: 'Dettol Soap',

  // Household
  detergent: 'Surf Excel Detergent',
  'surf excel': 'Surf Excel Detergent',
  'dish wash': 'Vim Dishwash Liquid',
  dishwash: 'Vim Dishwash Liquid',

  // Grains & Staples
  rice: 'India Gate Basmati Rice',
  'basmati rice': 'India Gate Basmati Rice',
  atta: 'Aashirvaad Atta',
  'aashirvaad atta': 'Aashirvaad Atta',
  flour: 'Aashirvaad Atta',
  aata: 'Aashirvaad Atta',
  dal: 'Toor Dal',
  'toor dal': 'Toor Dal',
  quinoa: 'Quinoa',

  // Condiments
  oil: 'Saffola Gold Oil',
  'saffola oil': 'Saffola Gold Oil',
  jam: 'Kissan Jam',
  'kissan jam': 'Kissan Jam',
  sauce: 'Maggi Hot & Sweet Sauce',

  // Frozen
  smiles: 'McCain Smiles',
  'mccain smiles': 'McCain Smiles',
};

// Hindi product name → English canonical name
export const HINDI_PRODUCT_MAP: Record<string, string> = {
  doodh: 'milk',
  anda: 'eggs',
  kela: 'banana',
  seb: 'apples',
  tamatar: 'tomatoes',
  pyaz: 'onions',
  aloo: 'potatoes',
  aam: 'mango',
  palak: 'spinach',
  gajar: 'carrots',
  chini: 'sugar',
  namak: 'salt',
  tel: 'oil',
  chawal: 'rice',
  aata: 'atta',
  chai: 'tea',
  pani: 'water',
  roti: 'bread',
  dahi: 'curd',
  makhan: 'butter',
  paneer: 'paneer',
  lehsun: 'garlic',
  adrak: 'ginger',
  kakdi: 'cucumber',
  nimbu: 'lemon',
  kaju: 'cashew',
  badam: 'almond',
};

/**
 * Normalize a product name from user input to a canonical database name.
 */
export function normalizeProductName(input: string): string {
  let cleaned = input.toLowerCase().trim();

  // Remove common noise words
  cleaned = cleaned.replace(
    /^(?:some|a |an |the |about |of |for |with |bottles? of |packets? of |packs? of |pieces? of |kilos? of |litres? of |liters? of )/i,
    '',
  );
  cleaned = cleaned.replace(/^(?:and |bhi |aur )/, '');
  cleaned = cleaned.replace(
    /(?:under|below|less than|under)\s+(?:rs\.?|₹|rupees?)?\s*\d+/gi,
    '',
  );
  cleaned = cleaned.trim();

  // Check Hindi mappings first
  const hindiMapped = HINDI_PRODUCT_MAP[cleaned];
  if (hindiMapped) cleaned = hindiMapped;

  // Check product aliases
  const aliasMapped = PRODUCT_ALIASES[cleaned];
  if (aliasMapped) return aliasMapped;

  // Try partial alias matching
  for (const [alias, canonical] of Object.entries(PRODUCT_ALIASES)) {
    if (cleaned.includes(alias) || alias.includes(cleaned)) {
      return canonical;
    }
  }

  // Return capitalized cleaned name
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Check if two product names refer to the same logical product.
 */
export function areSameProduct(nameA: string, nameB: string): boolean {
  const a = normalizeProductName(nameA).toLowerCase();
  const b = normalizeProductName(nameB).toLowerCase();

  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const aliasA = PRODUCT_ALIASES[nameA.toLowerCase().trim()];
  const aliasB = PRODUCT_ALIASES[nameB.toLowerCase().trim()];
  if (aliasA && aliasB && aliasA === aliasB) return true;

  return false;
}

// --- Unit merge helpers ---

interface UnitInfo {
  name: string;
  family: string;
  toBase: number; // conversion factor to base unit
}

const LITRE_FAMILY: UnitInfo[] = [
  { name: 'ml', family: 'volume', toBase: 1 },
  { name: 'L', family: 'volume', toBase: 1000 },
];

const KG_FAMILY: UnitInfo[] = [
  { name: 'g', family: 'weight', toBase: 1 },
  { name: 'kg', family: 'weight', toBase: 1000 },
];

function normalizeUnitForMerge(unit: string): UnitInfo {
  const lower = unit.toLowerCase();
  for (const u of [...LITRE_FAMILY, ...KG_FAMILY]) {
    if (lower === u.name || lower === u.name.toLowerCase()) return u;
  }
  // Fallback: treat as count family (no conversion)
  return { name: unit, family: 'count', toBase: 1 };
}

function pickBestUnit(family: string, totalBase: number): UnitInfo {
  if (family === 'volume') {
    return totalBase >= 1000 ? LITRE_FAMILY[1] : LITRE_FAMILY[0]; // L or ml
  }
  if (family === 'weight') {
    return totalBase >= 1000 ? KG_FAMILY[1] : KG_FAMILY[0]; // kg or g
  }
  // Count family — preserve the original unit name
  return { name: 'pcs', family: 'count', toBase: 1 };
}

/**
 * Merge quantities when adding a duplicate item.
 * Returns the merged quantity. Returns null if items are not compatible.
 */
export function mergeQuantities(
  existingQty: number,
  existingUnit: string,
  newQty: number,
  newUnit: string,
): { quantity: number; unit: string } | null {
  const existingNorm = normalizeUnitForMerge(existingUnit);
  const newNorm = normalizeUnitForMerge(newUnit);

  // Same family — merge with conversion
  if (existingNorm.family === newNorm.family) {
    const existingBase = existingQty * existingNorm.toBase;
    const newBase = newQty * newNorm.toBase;
    const total = existingBase + newBase;
    // For count family, preserve the original unit name (pack, dozen, etc.)
    if (existingNorm.family === 'count') {
      return { quantity: total, unit: existingNorm.name };
    }
    const bestUnit = pickBestUnit(existingNorm.family, total);
    return { quantity: Math.round((total / bestUnit.toBase) * 100) / 100, unit: bestUnit.name };
  }

  // Different families — don't merge
  return null;
}
