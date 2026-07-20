const DEFAULT_MAX_FRACTION_DIGITS = 4;

export function formatBalance(
  rawBalance: string | number,
  maxFractionDigits: number = DEFAULT_MAX_FRACTION_DIGITS
): string {
  const value = typeof rawBalance === 'number' ? rawBalance : Number(rawBalance);

  if (!Number.isFinite(value)) {
    return '0';
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  });
}
