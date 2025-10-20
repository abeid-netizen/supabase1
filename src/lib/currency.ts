/**
 * Format number as Tanzanian Shillings currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Parse a currency string back to a number
 * @param currencyString - The currency string to parse
 * @returns Parsed number value
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and commas
  const cleaned = currencyString.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned);
};