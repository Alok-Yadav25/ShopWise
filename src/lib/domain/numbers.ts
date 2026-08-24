/**
 * Centralized number and unit parsing.
 * Single source of truth for all quantity/number extraction from natural language.
 */

// English number words
const ENGLISH_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  hundred: 100,
};

// Hindi/Hinglish number words
const HINDI_NUMBERS: Record<string, number> = {
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  chaar: 4,
  paanch: 5,
  pach: 5,
  chhe: 6,
  che: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  gyarah: 11,
  barah: 12,
  pandrah: 15,
  bees: 20,
  teees: 30,
  chalees: 40,
  pachas: 50,
  sau: 100,
};

const ALL_NUMBERS: Record<string, number> = {
  ...ENGLISH_NUMBERS,
  ...HINDI_NUMBERS,
};

export const UNIT_ALIASES: Record<string, string> = {
  // Volume
  litre: 'L',
  liter: 'L',
  l: 'L',
  lt: 'L',
  litr: 'L',
  litres: 'L',
  liters: 'L',
  ml: 'ml',
  millilitre: 'ml',
  milliliter: 'ml',

  // Weight
  kilogram: 'kg',
  kilo: 'kg',
  kg: 'kg',
  kgs: 'kg',
  kilos: 'kg',
  gram: 'g',
  gms: 'g',
  gm: 'g',
  grams: 'g',

  // Count
  dozen: 'dozen',
  dz: 'dozen',
  piece: 'pcs',
  pieces: 'pcs',
  pc: 'pcs',
  pcs: 'pcs',

  // Packaged
  bottle: 'bottle',
  bottles: 'bottle',
  pack: 'pack',
  packs: 'pack',
  packet: 'pack',
  packets: 'pack',
  bag: 'bag',
  bags: 'bag',
  box: 'box',
  boxes: 'box',
  bar: 'bar',
  bars: 'bar',
  tube: 'tube',
  tubes: 'tube',
  jar: 'jar',
  jars: 'jar',
  roll: 'roll',
  rolls: 'roll',
  bunch: 'bunch',
  bunches: 'bunch',
};

function hasWholeWord(text: string, word: string): boolean {
  const words = text.split(/\s+/);
  return words.includes(word);
}

/**
 * Parse a number from text — supports digits, English words, and Hindi words.
 * Returns undefined if no number found.
 */
export function parseNumber(text: string): number | undefined {
  const lower = text.toLowerCase();

  // Direct digit match (most specific)
  const digitMatch = lower.match(/\b(\d+)\b/);
  if (digitMatch) return parseInt(digitMatch[1], 10);

  // Check word numbers — sort by length descending for longest match
  const sortedWords = Object.entries(ALL_NUMBERS).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [word, num] of sortedWords) {
    if (hasWholeWord(lower, word)) return num;
  }

  return undefined;
}

/**
 * Normalize a unit string to its canonical short form.
 */
export function normalizeUnit(unit: string): string {
  return UNIT_ALIASES[unit.toLowerCase()] || unit;
}

export interface ParsedQuantity {
  quantity: number;
  unit: string;
}

const UNIT_REGEX = '\\b(litre|liter|l|lt|litres|liters|ml|millilitre|milliliter|kilogram|kilo|kg|kgs|kilos|gram|gms|gm|grams|dozen|dz|piece|pieces|pc|pcs|bottle|bottles|pack|packs|packet|packets|bag|bags|box|boxes|bar|bars|tube|tubes|jar|jars|roll|rolls|bunch|bunches)\\b';

/**
 * Parse a combined quantity+unit string from natural language.
 * Handles patterns like:
 *   "2 litres"
 *   "500 ml"
 *   "1 kg"
 *   "do dozen"
 *   "teen pack"
 *   "6 bottles"
 *
 * Returns the parsed quantity and normalized unit.
 * Default quantity is 1, default unit is 'pcs'.
 */
export function parseQuantityAndUnit(text: string): ParsedQuantity {
  let quantity = 1;
  let unit = 'pcs';

  // Step 1: Try to extract quantity and unit together from the start of the string.
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return { quantity, unit };

  // Check if first word is a number
  const firstWord = words[0].toLowerCase();
  const numFromFirst = ALL_NUMBERS[firstWord] ?? parseInt(firstWord, 10);
  const isFirstNumber = !isNaN(numFromFirst) && numFromFirst > 0;

  if (isFirstNumber) {
    quantity = numFromFirst;
    // Check if second word (or remainder) contains a unit
    const rest = words.slice(1).join(' ');
    const unitRe = new RegExp(UNIT_REGEX, 'i');
    const unitMatch = rest.match(unitRe);
    if (unitMatch) {
      unit = normalizeUnit(unitMatch[1]);
    }
    return { quantity, unit };
  }

  // Step 2: Fallback — find number and unit anywhere in text
  const num = parseNumber(text);
  if (num !== undefined && num > 0) {
    quantity = num;
    const unitRe = new RegExp(UNIT_REGEX, 'i');
    const unitMatch = text.match(unitRe);
    if (unitMatch) {
      unit = normalizeUnit(unitMatch[1]);
    }
  } else {
    // Step 3: Try just a unit without a number
    const unitRe = new RegExp(UNIT_REGEX, 'i');
    const unitMatch = text.match(unitRe);
    if (unitMatch) {
      unit = normalizeUnit(unitMatch[1]);
    }
  }

  return { quantity, unit };
}

/**
 * Extract price constraints from natural language text.
 */
export function extractPriceConstraints(text: string): {
  priceMin?: number;
  priceMax?: number;
} {
  const result: { priceMin?: number; priceMax?: number } = {};

  // Under/below/less than/max/within
  const underMatch = text.match(
    /(?:under|below|less than|max|maximum|up to|cheaper than|within)\s+(?:rs\.?|₹|rupees?)?\s*(\d+)/i,
  );
  if (underMatch) result.priceMax = parseInt(underMatch[1], 10);

  // Over/above/more than/min/at least
  const overMatch = text.match(
    /(?:over|above|more than|min|minimum|at least|starting from)\s+(?:rs\.?|₹|rupees?)?\s*(\d+)/i,
  );
  if (overMatch) result.priceMin = parseInt(overMatch[1], 10);

  // Between X and Y
  const betweenMatch = text.match(
    /between\s+(?:rs\.?|₹)?\s*(\d+)\s+and\s+(?:rs\.?|₹)?\s*(\d+)/i,
  );
  if (betweenMatch) {
    result.priceMin = parseInt(betweenMatch[1], 10);
    result.priceMax = parseInt(betweenMatch[2], 10);
  }

  return result;
}

/**
 * Split a text into multiple item strings.
 * Handles commas, "and", "aur", "bhi" as separators.
 */
export function extractMultipleItems(text: string): string[] {
  // Split on "and", "aur", "bhi" — these are reliable separators
  const parts = text.split(
    /(?:\s+and\s+)|(?:\s+aur\s+)|(?:\s+bhi\s+)/i,
  );

  // For comma splitting, be more conservative:
  // Only split on ", " when both sides look like independent items
  // (not greetings/address words like "Bhai," or "Yaar,")
  const result: string[] = [];
  const greetings = /^(?:bhai|yaar|dost|boss|friend|hey|hi|hello|ok|okay|so|well|um|ah|oh|chalo|accha|theek)/i;

  for (const part of parts) {
    // Check if this part contains a comma that should split
    const commaParts = part.split(/\s*,\s*/);
    if (commaParts.length > 1) {
      for (const cp of commaParts) {
        const trimmed = cp.trim();
        if (trimmed.length > 1 && !greetings.test(trimmed)) {
          result.push(trimmed);
        }
      }
    } else {
      const trimmed = part.trim();
      if (trimmed.length > 1) {
        result.push(trimmed);
      }
    }
  }

  return result.length > 1 ? result : [text];
}
