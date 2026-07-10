import { describe, expect, it } from 'vitest';

import { formatCurrency, formatCurrencyTotals } from './currency';

describe('currency utilities', () => {
  it('formats GBP values', () => {
    const formatted = formatCurrency(125000.5, 'GBP');
    expect(formatted).toContain('125');
    expect(formatted).toMatch(/£|GBP/);
  });

  it('formats INR values', () => {
    const formatted = formatCurrency(2500000, 'INR');
    expect(formatted).toContain('2,500,000');
    expect(formatted).toMatch(/₹|INR/);
  });

  it('formats USD values', () => {
    const formatted = formatCurrency(42000, 'USD');
    expect(formatted).toContain('42');
    expect(formatted).toMatch(/\$|USD/);
  });

  it('formats EUR values', () => {
    const formatted = formatCurrency(18000.25, 'EUR');
    expect(formatted).toContain('18');
    expect(formatted).toMatch(/€|EUR/);
  });

  it('shows separate totals for different currencies without converting', () => {
    const formatted = formatCurrencyTotals({
      GBP: 1000,
      INR: 50000,
    });

    expect(formatted).toContain('·');
    expect(formatted).toMatch(/£|GBP/);
    expect(formatted).toMatch(/₹|INR/);
  });

  it('returns a dash when no totals are available', () => {
    expect(formatCurrencyTotals({})).toBe('—');
  });
});
