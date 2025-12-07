// Unit conversion utilities for recipe ingredients
// Converts US/Imperial units to metric while preserving original

// Conversion factors to metric
const VOLUME_TO_ML = {
  // US volume
  'cup': 236.588,
  'cups': 236.588,
  'tablespoon': 14.787,
  'tablespoons': 14.787,
  'tbsp': 14.787,
  'teaspoon': 4.929,
  'teaspoons': 4.929,
  'tsp': 4.929,
  'fluid ounce': 29.574,
  'fluid ounces': 29.574,
  'fl oz': 29.574,
  'fl. oz': 29.574,
  'pint': 473.176,
  'pints': 473.176,
  'pt': 473.176,
  'quart': 946.353,
  'quarts': 946.353,
  'qt': 946.353,
  'gallon': 3785.41,
  'gallons': 3785.41,
  'gal': 3785.41
};

const WEIGHT_TO_GRAMS = {
  'ounce': 28.3495,
  'ounces': 28.3495,
  'oz': 28.3495,
  'pound': 453.592,
  'pounds': 453.592,
  'lb': 453.592,
  'lbs': 453.592
};

const LENGTH_TO_CM = {
  'inch': 2.54,
  'inches': 2.54,
  'in': 2.54,
  '"': 2.54,
  'foot': 30.48,
  'feet': 30.48,
  'ft': 30.48
};

const TEMPERATURE_PATTERNS = [
  /(\d+)\s*°?\s*F\b/gi,
  /(\d+)\s*degrees?\s*F(?:ahrenheit)?/gi
];

// Units that are already metric (no conversion needed)
const METRIC_UNITS = new Set([
  'ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres',
  'l', 'liter', 'liters', 'litre', 'litres',
  'g', 'gram', 'grams', 'gramme', 'grammes',
  'kg', 'kilogram', 'kilograms', 'kilogramme', 'kilogrammes',
  'mg', 'milligram', 'milligrams',
  'cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres',
  'mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres',
  'm', 'meter', 'meters', 'metre', 'metres',
  '°c', 'celsius'
]);

// Parse fractions like "1/2", "1/4", "3/4"
function parseFraction(str) {
  const fractionMap = {
    '½': 0.5, '⅓': 0.333, '⅔': 0.667, '¼': 0.25, '¾': 0.75,
    '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
    '⅙': 0.167, '⅚': 0.833, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
  };

  // Check for unicode fractions
  for (const [frac, val] of Object.entries(fractionMap)) {
    if (str.includes(frac)) {
      const beforeFrac = str.replace(frac, '').trim();
      const wholeNum = beforeFrac ? parseFloat(beforeFrac) : 0;
      return wholeNum + val;
    }
  }

  // Check for "1/2" style fractions
  const fractionRegex = /(\d+)\s*\/\s*(\d+)/;
  const match = str.match(fractionRegex);
  if (match) {
    const beforeFrac = str.replace(fractionRegex, '').trim();
    const wholeNum = beforeFrac ? parseFloat(beforeFrac) : 0;
    return wholeNum + (parseInt(match[1]) / parseInt(match[2]));
  }

  return parseFloat(str) || null;
}

// Format number nicely (round to reasonable precision)
function formatNumber(num) {
  if (num >= 1000) {
    return Math.round(num);
  } else if (num >= 100) {
    return Math.round(num);
  } else if (num >= 10) {
    return Math.round(num * 10) / 10;
  } else if (num >= 1) {
    return Math.round(num * 10) / 10;
  } else {
    return Math.round(num * 100) / 100;
  }
}

// Convert Fahrenheit to Celsius
function fahrenheitToCelsius(f) {
  return Math.round((f - 32) * 5 / 9);
}

// Convert a single ingredient line
function convertIngredient(ingredient) {
  const original = ingredient.trim();
  let converted = original;
  let hasConversion = false;

  // Pattern to match quantity + unit at the start of ingredient
  // e.g., "2 cups flour", "1/2 tablespoon salt", "3 oz butter"
  const ingredientPattern = /^([\d\s\/½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞.-]+)\s*([a-zA-Z.]+\.?)\s+(.+)$/i;
  const match = original.match(ingredientPattern);

  if (match) {
    const quantityStr = match[1].trim();
    const unit = match[2].toLowerCase().replace(/\.$/, '');
    const rest = match[3];

    // Check if already metric
    if (METRIC_UNITS.has(unit)) {
      return original;
    }

    const quantity = parseFraction(quantityStr);
    if (quantity === null) {
      return original;
    }

    // Try volume conversion
    if (VOLUME_TO_ML[unit]) {
      const ml = quantity * VOLUME_TO_ML[unit];
      let metricStr;
      if (ml >= 1000) {
        metricStr = `${formatNumber(ml / 1000)} l`;
      } else if (ml >= 15) {
        metricStr = `${formatNumber(ml)} ml`;
      } else {
        metricStr = `${formatNumber(ml)} ml`;
      }
      converted = `${original} (${metricStr})`;
      hasConversion = true;
    }
    // Try weight conversion
    else if (WEIGHT_TO_GRAMS[unit]) {
      const grams = quantity * WEIGHT_TO_GRAMS[unit];
      let metricStr;
      if (grams >= 1000) {
        metricStr = `${formatNumber(grams / 1000)} kg`;
      } else {
        metricStr = `${formatNumber(grams)} g`;
      }
      converted = `${original} (${metricStr})`;
      hasConversion = true;
    }
    // Try length conversion
    else if (LENGTH_TO_CM[unit]) {
      const cm = quantity * LENGTH_TO_CM[unit];
      let metricStr;
      if (cm >= 100) {
        metricStr = `${formatNumber(cm / 100)} m`;
      } else if (cm < 1) {
        metricStr = `${formatNumber(cm * 10)} mm`;
      } else {
        metricStr = `${formatNumber(cm)} cm`;
      }
      converted = `${original} (${metricStr})`;
      hasConversion = true;
    }
  }

  // Also handle standalone measurements in the text (e.g., "cut into 1-inch pieces")
  // Length conversions in text
  for (const [unit, factor] of Object.entries(LENGTH_TO_CM)) {
    const pattern = new RegExp(`(\\d+(?:[./]\\d+)?)[\\s-]*(${unit.replace('.', '\\.')})\\b`, 'gi');
    converted = converted.replace(pattern, (match, num, u) => {
      if (converted.includes(`(${match})`)) return match; // Already converted
      const value = parseFraction(num);
      if (value === null) return match;
      const cm = value * factor;
      const metricStr = cm < 1 ? `${formatNumber(cm * 10)} mm` : `${formatNumber(cm)} cm`;
      return `${match} (${metricStr})`;
    });
  }

  return converted;
}

// Convert temperature in instruction text
function convertTemperatures(text) {
  let converted = text;

  for (const pattern of TEMPERATURE_PATTERNS) {
    converted = converted.replace(pattern, (match, temp) => {
      const fahrenheit = parseInt(temp);
      const celsius = fahrenheitToCelsius(fahrenheit);
      return `${match} (${celsius}°C)`;
    });
  }

  return converted;
}

// Convert all ingredients in a recipe
export function convertIngredientsToMetric(ingredients) {
  if (!Array.isArray(ingredients)) return ingredients;
  return ingredients.map(convertIngredient);
}

// Convert temperatures in instructions
export function convertInstructionsTemperatures(instructions) {
  if (!Array.isArray(instructions)) return instructions;
  return instructions.map(convertTemperatures);
}

// Check if an ingredient already has metric units
export function hasMetricUnits(ingredient) {
  const lowerIngredient = ingredient.toLowerCase();
  for (const unit of METRIC_UNITS) {
    if (lowerIngredient.includes(unit)) {
      return true;
    }
  }
  return false;
}

// Main conversion function for a full recipe
export function convertRecipeToMetric(recipe) {
  return {
    ...recipe,
    ingredients: convertIngredientsToMetric(recipe.ingredients || []),
    instructions: convertInstructionsTemperatures(recipe.instructions || [])
  };
}
