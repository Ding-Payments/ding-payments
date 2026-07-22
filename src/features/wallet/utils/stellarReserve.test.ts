import {
  getMinimumBalanceStroops,
  getMinimumBalanceStroopsForNewTrustline,
  getMinimumBalanceXlmForNewTrustline,
  horizonBalanceToStroops,
  STELLAR_BASE_RESERVE_STROOPS,
  STELLAR_BASE_RESERVE_XLM,
  STROOP_FACTOR,
  TRUSTLINE_RESERVE_BUFFER_STROOPS,
  TRUSTLINE_RESERVE_BUFFER_XLM,
} from './stellarReserve';

describe('horizonBalanceToStroops', () => {
  it('converts Horizon decimal strings without floating-point math', () => {
    expect(horizonBalanceToStroops('123.4567890')).toBe(1234567890n);
    expect(horizonBalanceToStroops('0.0000001')).toBe(1n);
  });

  it('pads and truncates fractional digits to 7 decimal places', () => {
    expect(horizonBalanceToStroops('1.5')).toBe(15000000n);
    expect(horizonBalanceToStroops('1.123456789')).toBe(11234567n);
  });

  it('returns 0n for malformed balances', () => {
    expect(horizonBalanceToStroops('')).toBe(0n);
    expect(horizonBalanceToStroops('not-a-number')).toBe(0n);
  });
});

describe('getMinimumBalanceStroops', () => {
  it('uses payment reserve formula (2 + subentryCount) * base reserve with no buffer', () => {
    expect(getMinimumBalanceStroops(0)).toBe(10_000_000n);
    expect(getMinimumBalanceStroops(3)).toBe(25_000_000n);
    expect(getMinimumBalanceStroops(10)).toBe(60_000_000n);
  });

  it('matches base reserve constants in stroops', () => {
    expect(STELLAR_BASE_RESERVE_STROOPS).toBe(BigInt(STELLAR_BASE_RESERVE_XLM * 10_000_000));
    expect(getMinimumBalanceStroops(0)).toBe(2n * STELLAR_BASE_RESERVE_STROOPS);
  });
});

describe('getMinimumBalanceStroopsForNewTrustline', () => {
  it('adds one subentry and the trustline buffer stroops', () => {
    expect(getMinimumBalanceStroopsForNewTrustline(0)).toBe(
      3n * STELLAR_BASE_RESERVE_STROOPS + TRUSTLINE_RESERVE_BUFFER_STROOPS
    );
    expect(getMinimumBalanceStroopsForNewTrustline(3)).toBe(
      6n * STELLAR_BASE_RESERVE_STROOPS + TRUSTLINE_RESERVE_BUFFER_STROOPS
    );
  });

  it('includes the 0.01 XLM buffer only for trustline creation', () => {
    expect(TRUSTLINE_RESERVE_BUFFER_STROOPS).toBe(
      horizonBalanceToStroops(String(TRUSTLINE_RESERVE_BUFFER_XLM))
    );
    expect(
      getMinimumBalanceStroops(0) + TRUSTLINE_RESERVE_BUFFER_STROOPS <
        getMinimumBalanceStroopsForNewTrustline(0)
    ).toBe(true);
  });
});

describe('getMinimumBalanceXlmForNewTrustline', () => {
  it('matches legacy Number-based trustline checks used by TrustlineService', () => {
    expect(getMinimumBalanceXlmForNewTrustline(0)).toBe(1.51);
    expect(getMinimumBalanceXlmForNewTrustline(3)).toBe(3.01);
  });

  it('aligns stroops and XLM formulas for subentry_count 0', () => {
    const stroopsMinimum = getMinimumBalanceStroopsForNewTrustline(0);
    const whole = stroopsMinimum / STROOP_FACTOR;
    const fraction = stroopsMinimum % STROOP_FACTOR;
    const fractionStr = fraction.toString().padStart(7, '0');
    expect(Number(`${whole}.${fractionStr}`)).toBe(getMinimumBalanceXlmForNewTrustline(0));
  });
});
