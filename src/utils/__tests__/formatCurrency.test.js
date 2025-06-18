// src/utils/__tests__/formatCurrency.test.js
import { formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  it('formats numbers as ZAR currency', () => {
    expect(formatCurrency(1000)).toBe('R 1,000');
    expect(formatCurrency(1234.56, 2)).toBe('R 1,234.56');
    expect(formatCurrency(0)).toBe('R 0');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-R 1,000');
  });
});
