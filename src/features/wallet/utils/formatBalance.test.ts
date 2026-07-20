import { formatBalance } from './formatBalance';

describe('formatBalance', () => {
  it('formats a whole number without decimals', () => {
    expect(formatBalance('100.0000000')).toBe('100');
  });

  it('trims trailing zeros while keeping significant decimals', () => {
    expect(formatBalance('1234.5000000')).toBe('1,234.5');
  });

  it('caps fraction digits to the given precision', () => {
    expect(formatBalance('10.123456', 2)).toBe('10.12');
  });

  it('accepts numeric input', () => {
    expect(formatBalance(42)).toBe('42');
  });

  it('returns 0 for non-numeric input', () => {
    expect(formatBalance('not-a-number')).toBe('0');
  });

  it('returns 0 for an empty string', () => {
    expect(formatBalance('')).toBe('0');
  });
});
