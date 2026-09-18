import { FOOD_DATABASE, FoodDatabaseEntry } from '../data/foodDatabase';
import { TMAIAnalysisResult, MultiItemAnalysisResult } from '../types/tracker';

// Normalize query tokens
function cleanToken(s: string): string {
  return s.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

interface ParsedChunk {
  raw: string;
  quantity: number;
  unit: string;
  foodName: string;
}

// Regex to identify quantity and unit at the start, middle, or end of a string
// e.g. "200g chicken", "2 eggs", "1.5 cups milk", "chicken 150 grams", "3 idlis"
function parseSingleChunk(text: string): ParsedChunk {
  const trimmed = text.trim();

  // Pattern 1: Number + Unit + Food Name (e.g. "200g chicken", "200 g chicken", "2 eggs", "1 banana", "1 scoop whey")
  const leadingMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.*)$/i);
  if (leadingMatch) {
    const rawQty = parseFloat(leadingMatch[1]);
    let potentialUnit = leadingMatch[2]?.toLowerCase() || '';
    let remainder = leadingMatch[3].trim();

    // Check if potentialUnit is actually a unit or part of the food name
    const recognizedUnits = ['g', 'gram', 'grams', 'gm', 'gms', 'kg', 'ml', 'l', 'cup', 'cups', 'scoop', 'scoops', 'piece', 'pieces', 'pc', 'pcs', 'slice', 'slices', 'tbsp', 'tsp', 'egg', 'eggs', 'idli', 'idlis', 'dosa', 'dosas', 'roti', 'rotis', 'banana', 'bananas'];

    if (potentialUnit && recognizedUnits.includes(potentialUnit)) {
      // Normalize units that are also food names (e.g. "2 eggs" -> qty 2, unit 'piece', food 'egg')
      if (['egg', 'eggs'].includes(potentialUnit) && (!remainder || remainder.length === 0)) {
        return { raw: text, quantity: rawQty, unit: 'piece', foodName: 'egg' };
      }
      if (['idli', 'idlis'].includes(potentialUnit) && (!remainder || remainder.length === 0)) {
        return { raw: text, quantity: rawQty, unit: 'piece', foodName: 'idli' };
      }
      if (['dosa', 'dosas'].includes(potentialUnit) && (!remainder || remainder.length === 0)) {
        return { raw: text, quantity: rawQty, unit: 'piece', foodName: 'dosa' };
      }
      if (['roti', 'rotis'].includes(potentialUnit) && (!remainder || remainder.length === 0)) {
        return { raw: text, quantity: rawQty, unit: 'piece', foodName: 'roti' };
      }
      if (['banana', 'bananas'].includes(potentialUnit) && (!remainder || remainder.length === 0)) {
        return { raw: text, quantity: rawQty, unit: 'piece', foodName: 'banana' };
      }
      return { raw: text, quantity: rawQty, unit: normalizeUnit(potentialUnit), foodName: remainder };
    } else if (potentialUnit) {
      // It was part of the food name (e.g. "2 large eggs")
      return { raw: text, quantity: rawQty, unit: 'piece', foodName: `${potentialUnit} ${remainder}`.trim() };
    } else {
      return { raw: text, quantity: rawQty, unit: 'piece', foodName: remainder };
    }
  }

  // Pattern 2: Food Name + Number + Unit (e.g. "chicken 200g", "rice 150 grams", "milk 250ml")
  const trailingMatch = trimmed.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]*)$/i);
  if (trailingMatch) {
    const foodPart = trailingMatch[1].trim();
    const rawQty = parseFloat(trailingMatch[2]);
    const rawUnit = trailingMatch[3]?.toLowerCase() || 'g';
    return { raw: text, quantity: rawQty, unit: normalizeUnit(rawUnit), foodName: foodPart };
  }

  // Pattern 3: Just food name without quantity (assume 1 default serving)
  return { raw: text, quantity: 1, unit: 'serving', foodName: trimmed };
}

function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase();
  if (['g', 'gram', 'grams', 'gm', 'gms'].includes(u)) return 'g';
  if (['kg', 'kilogram', 'kilograms'].includes(u)) return 'kg';
  if (['ml', 'milliliter', 'milliliters'].includes(u)) return 'ml';
  if (['l', 'liter', 'liters', 'litre', 'litres'].includes(u)) return 'l';
  if (['scoop', 'scoops'].includes(u)) return 'scoop';
  if (['cup', 'cups'].includes(u)) return 'cup';
  if (['tbsp', 'tablespoon'].includes(u)) return 'tbsp';
  if (['tsp', 'teaspoon'].includes(u)) return 'tsp';
  if (['slice', 'slices'].includes(u)) return 'piece';
  if (['piece', 'pieces', 'pc', 'pcs', 'egg', 'eggs', 'idli', 'idlis', 'dosa', 'dosas', 'roti', 'rotis', 'banana', 'bananas'].includes(u)) return 'piece';
  return 'piece';
}

function findBestDatabaseMatch(foodName: string): FoodDatabaseEntry | null {
  const clean = cleanToken(foodName);
  if (!clean) return null;

  // Direct alias or name exact match
  for (const entry of FOOD_DATABASE) {
    if (cleanToken(entry.name) === clean) return entry;
    for (const alias of entry.aliases) {
      if (cleanToken(alias) === clean) return entry;
    }
  }

  // Substring or token match
  const tokens = clean.split(/\s+/).filter(Boolean);
  let bestEntry: FoodDatabaseEntry | null = null;
  let bestScore = 0;

  for (const entry of FOOD_DATABASE) {
    let score = 0;
    const allAliases = [entry.name, ...entry.aliases];

    for (const alias of allAliases) {
      const aliasClean = cleanToken(alias);
      if (clean.includes(aliasClean) || aliasClean.includes(clean)) {
        score = Math.max(score, 10);
      }
      for (const t of tokens) {
        if (aliasClean.includes(t)) {
          score += 3;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  return bestScore >= 3 ? bestEntry : null;
}

export function parseTMAIFood(input: string): MultiItemAnalysisResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, rawInput: input };
  }

  // Split multiple foods by "and", "&", "+", comma, or newline,
  // but protect phrases like "dosa with 2 eggs" or "mac and cheese"
  let parts: string[] = [];

  // Special handle "dosa with 2 eggs" or similar combined dishes
  if (/dosa\s+with\s+(?:2\s+)?eggs?/i.test(trimmed)) {
    parts = [trimmed];
  } else {
    // Split by newlines, commas, or isolated " and ", " & ", " + "
    const splitRegex = /(?:\r?\n|,\s*|\s+(?:and|&|\+)\s+)/i;
    parts = trimmed.split(splitRegex).map(p => p.trim()).filter(Boolean);
  }

  if (parts.length === 0) {
    parts = [trimmed];
  }

  const items: TMAIAnalysisResult[] = [];

  for (const part of parts) {
    const parsed = parseSingleChunk(part);
    const dbMatch = findBestDatabaseMatch(parsed.foodName);

    if (dbMatch) {
      // Calculate nutrition based on quantity & unit
      const res = calculateFromDbEntry(dbMatch, parsed);
      items.push(res);
    } else {
      // Intelligent fallback estimation
      const estimated = estimateUnknownFood(parsed);
      items.push(estimated);
    }
  }

  const totalCalories = Math.round(items.reduce((acc, item) => acc + item.calories, 0));
  const totalProtein = Math.round(items.reduce((acc, item) => acc + item.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((acc, item) => acc + item.carbs, 0) * 10) / 10;
  const totalFat = Math.round(items.reduce((acc, item) => acc + item.fat, 0) * 10) / 10;

  return {
    items,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    rawInput: input,
  };
}

function calculateFromDbEntry(entry: FoodDatabaseEntry, parsed: ParsedChunk): TMAIAnalysisResult {
  let qty = parsed.quantity || 1;
  let unit = parsed.unit;

  // Handle kg conversion
  if (unit === 'kg') {
    qty = qty * 1000;
    unit = 'g';
  }
  // Handle l conversion
  if (unit === 'l') {
    qty = qty * 1000;
    unit = 'ml';
  }

  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  // If unit is piece/scoop/tbsp and entry has per-piece nutrition
  if (['piece', 'scoop', 'tbsp', 'slice', 'cup'].includes(unit) && entry.caloriesPerPiece !== undefined) {
    calories = entry.caloriesPerPiece * qty;
    protein = (entry.proteinPerPiece || 0) * qty;
    carbs = (entry.carbsPerPiece || 0) * qty;
    fat = (entry.fatPerPiece || 0) * qty;
  } else if (entry.caloriesPer100g !== undefined) {
    // Weight-based calculation (default unit grams or ml)
    const factor = (unit === 'g' || unit === 'ml') ? (qty / 100) : (qty * (entry.pieceWeightGrams || 100) / 100);
    calories = entry.caloriesPer100g * factor;
    protein = (entry.proteinPer100g || 0) * factor;
    carbs = (entry.carbsPer100g || 0) * factor;
    fat = (entry.fatPer100g || 0) * factor;
  } else if (entry.caloriesPerPiece !== undefined) {
    calories = entry.caloriesPerPiece * qty;
    protein = (entry.proteinPerPiece || 0) * qty;
    carbs = (entry.carbsPerPiece || 0) * qty;
    fat = (entry.fatPerPiece || 0) * qty;
  }

  // Exact matching flag
  const isExact = true;

  return {
    food: entry.name,
    emoji: entry.emoji,
    quantity: qty,
    unit: unit,
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    confidence: isExact ? 'exact' : 'estimated',
    notes: 'Estimated nutrition from Tracker Macros AI standard database.'
  };
}

function estimateUnknownFood(parsed: ParsedChunk): TMAIAnalysisResult {
  const name = parsed.foodName || 'Meal';
  let qty = parsed.quantity || 1;
  const unit = parsed.unit || 'serving';

  let calPer100 = 180;
  let pPer100 = 8;
  let cPer100 = 20;
  let fPer100 = 7;
  let emoji = '🍽️';

  const lower = name.toLowerCase();
  if (lower.includes('shake') || lower.includes('smoothie')) {
    calPer100 = 120; pPer100 = 10; cPer100 = 14; fPer100 = 2; emoji = '🥤';
  } else if (lower.includes('salad') || lower.includes('greens') || lower.includes('veg')) {
    calPer100 = 45; pPer100 = 2; cPer100 = 6; fPer100 = 1; emoji = '🥗';
  } else if (lower.includes('meat') || lower.includes('steak') || lower.includes('beef') || lower.includes('pork')) {
    calPer100 = 240; pPer100 = 26; cPer100 = 0; fPer100 = 15; emoji = '🥩';
  } else if (lower.includes('fish') || lower.includes('prawn') || lower.includes('shrimp')) {
    calPer100 = 120; pPer100 = 22; cPer100 = 0; fPer100 = 3; emoji = '🍤';
  } else if (lower.includes('curry') || lower.includes('gravy')) {
    calPer100 = 160; pPer100 = 7; cPer100 = 12; fPer100 = 10; emoji = '🍛';
  } else if (lower.includes('soup')) {
    calPer100 = 60; pPer100 = 3; cPer100 = 8; fPer100 = 2; emoji = '🥣';
  } else if (lower.includes('cookie') || lower.includes('cake') || lower.includes('chocolate') || lower.includes('sweet')) {
    calPer100 = 450; pPer100 = 5; cPer100 = 60; fPer100 = 22; emoji = '🍪';
  } else if (lower.includes('sandwich') || lower.includes('burger') || lower.includes('wrap')) {
    calPer100 = 240; pPer100 = 14; cPer100 = 28; fPer100 = 9; emoji = '🥪';
  } else if (lower.includes('noodle') || lower.includes('pasta')) {
    calPer100 = 150; pPer100 = 5; cPer100 = 28; fPer100 = 2; emoji = '🍝';
  }

  const factor = (unit === 'g' || unit === 'ml') ? (qty / 100) : (qty * 1.5);
  const calories = Math.round(calPer100 * factor);
  const protein = Math.round(pPer100 * factor * 10) / 10;
  const carbs = Math.round(cPer100 * factor * 10) / 10;
  const fat = Math.round(fPer100 * factor * 10) / 10;

  return {
    food: capitalize(name),
    emoji: emoji,
    quantity: qty,
    unit: unit,
    calories,
    protein,
    carbs,
    fat,
    confidence: 'estimated',
    notes: 'ⓘ Values may vary depending on recipe, oil and preparation method.'
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
