/**
 * Currency Formatting Utilities
 * Handles currency formatting with proper validation and fallbacks
 */

export interface CurrencyFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Maps various currency representations to standard ISO currency codes
 */
const CURRENCY_MAP: Record<string, string> = {
  // Dollar variations
  '$': 'USD',
  'usd': 'USD',
  'dollar': 'USD',
  'dollars': 'USD',
  
  // Euro variations
  '€': 'EUR',
  'eur': 'EUR',
  'euro': 'EUR',
  'euros': 'EUR',
  
  // Vietnamese Dong variations
  '₫': 'VND',
  'vnd': 'VND',
  'dong': 'VND',
  'vietnamese dong': 'VND',
  
  // British Pound variations
  '£': 'GBP',
  'gbp': 'GBP',
  'pound': 'GBP',
  'pounds': 'GBP',
  
  // Japanese Yen variations
  '¥': 'JPY',
  'jpy': 'JPY',
  'yen': 'JPY',
};

/**
 * Gets the appropriate locale for a currency
 */
const getCurrencyLocale = (currency: string): string => {
  switch (currency) {
    case 'VND':
      return 'vi-VN';
    case 'EUR':
      return 'de-DE';
    case 'GBP':
      return 'en-GB';
    case 'JPY':
      return 'ja-JP';
    default:
      return 'en-US';
  }
};

/**
 * Normalizes currency code to ISO standard
 */
export const normalizeCurrencyCode = (currency: string): string => {
  if (!currency) return 'USD';
  
  const normalized = currency.toString().toLowerCase().trim();
  
  // Check if it's in our mapping
  if (CURRENCY_MAP[normalized]) {
    return CURRENCY_MAP[normalized];
  }
  
  // If it's already a 3-letter code, uppercase it
  if (normalized.length === 3 && /^[a-z]{3}$/.test(normalized)) {
    return normalized.toUpperCase();
  }
  
  // Default fallback
  return 'USD';
};

/**
 * Formats a price with currency, handling various currency formats
 */
export const formatPrice = (
  price: string | number, 
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string => {
  const amount = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(amount)) {
    return '0.00';
  }
  
  const currencyCode = normalizeCurrencyCode(currency);
  const locale = options.locale || getCurrencyLocale(currencyCode);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: options.minimumFractionDigits ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    }).format(amount);
  } catch (error) {
    console.warn(`Currency formatting failed for ${currencyCode}, using fallback`, error);
    
    // Fallback formatting
    const symbol = getSymbolFallback(currencyCode);
    return `${symbol}${amount.toFixed(2)}`;
  }
};

/**
 * Gets currency symbol fallback for manual formatting
 */
const getSymbolFallback = (currency: string): string => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'VND': return '₫';
    default: return currency + ' ';
  }
};

/**
 * Formats currency for display in lists (simplified)
 */
export const formatCurrencySimple = (amount: number, currency: string = 'USD'): string => {
  return formatPrice(amount, currency, { maximumFractionDigits: 0 });
};

/**
 * Formats currency range (e.g., "$5.00 - $15.00")
 */
export const formatPriceRange = (
  minPrice: number, 
  maxPrice: number, 
  currency: string = 'USD'
): string => {
  const min = formatPrice(minPrice, currency);
  const max = formatPrice(maxPrice, currency);
  return `${min} - ${max}`;
};