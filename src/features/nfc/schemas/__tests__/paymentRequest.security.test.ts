import { assertNoSecrets } from '../paymentRequest';

describe('paymentRequest security guard', () => {
  it('throws when forbidden keys present', () => {
    const bad = { id: '1', secret: 'no', amount: 10 };
    expect(() => assertNoSecrets(bad)).toThrow(/forbidden fields/);
  });

  it('allows normal payloads', () => {
    const ok = { id: '1', amount: 10, currency: 'USD' };
    expect(() => assertNoSecrets(ok)).not.toThrow();
  });
});
