import { receiveAmountSchema } from '@/features/receive/schemas/receiveAmount';

describe('receiveAmountSchema', () => {
  it('accepts a valid XLM amount', () => {
    const result = receiveAmountSchema.safeParse({ amount: '125.1234567', asset: 'XLM' });
    expect(result.success).toBe(true);
  });

  it('accepts a valid USDC amount with 2 decimal places', () => {
    const result = receiveAmountSchema.safeParse({ amount: '25.50', asset: 'USDC' });
    expect(result.success).toBe(true);
  });

  it('rejects USDC amounts with 3 decimal places', () => {
    const result = receiveAmountSchema.safeParse({ amount: '25.123', asset: 'USDC' });
    expect(result.success).toBe(false);
  });

  it('accepts XLM amounts with up to 7 decimal places (not capped at 2)', () => {
    const result = receiveAmountSchema.safeParse({ amount: '1.1234567', asset: 'XLM' });
    expect(result.success).toBe(true);
  });

  it('rejects a zero amount', () => {
    const result = receiveAmountSchema.safeParse({ amount: '0', asset: 'XLM' });
    expect(result.success).toBe(false);
  });

  it('rejects a negative amount string', () => {
    const result = receiveAmountSchema.safeParse({ amount: '-1', asset: 'XLM' });
    expect(result.success).toBe(false);
  });

  it('rejects amounts greater than the maximum', () => {
    const result = receiveAmountSchema.safeParse({ amount: '1000000', asset: 'XLM' });
    expect(result.success).toBe(false);
  });

  it('accepts the maximum amount exactly', () => {
    const result = receiveAmountSchema.safeParse({ amount: '999999', asset: 'XLM' });
    expect(result.success).toBe(true);
  });

  it('rejects a non-numeric string', () => {
    const result = receiveAmountSchema.safeParse({ amount: 'abc', asset: 'XLM' });
    expect(result.success).toBe(false);
  });

  it('rejects an unsupported asset', () => {
    const result = receiveAmountSchema.safeParse({ amount: '10', asset: 'BTC' });
    expect(result.success).toBe(false);
  });
});
