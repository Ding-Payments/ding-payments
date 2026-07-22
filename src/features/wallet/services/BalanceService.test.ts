import { Horizon } from '@stellar/stellar-sdk';

import { fetchBalances, getMinimumBalanceStroops, parseBalances, parseNativeBalanceStroops, parseUsdcBalanceStroops } from './BalanceService';

jest.mock('@stellar/stellar-sdk', () => {
  const horizonServerInstance = {
    loadAccount: jest.fn(),
  };

  return {
    Horizon: {
      Server: jest.fn(() => horizonServerInstance),
    },
    Networks: {
      PUBLIC: 'Public Global Stellar Network ; September 2015',
      TESTNET: 'Test SDF Network ; September 2015',
    },
  };
});

const USDC_ISSUER = 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66';
const server = new Horizon.Server('https://horizon-testnet.stellar.org') as unknown as {
  loadAccount: jest.Mock;
};

describe('parseBalances', () => {
  it('extracts the native XLM balance', () => {
    const result = parseBalances({
      balances: [{ asset_type: 'native', balance: '123.4567890' } as never],
    });

    expect(result.xlm).toBe('123.4567890');
    expect(result.usdc).toBeNull();
    expect(result.hasUsdcTrustline).toBe(false);
  });

  it('extracts the USDC balance when it matches the configured issuer', () => {
    const result = parseBalances({
      balances: [
        { asset_type: 'native', balance: '50.0000000' } as never,
        {
          asset_type: 'credit_alphanum4',
          asset_code: 'USDC',
          asset_issuer: USDC_ISSUER,
          balance: '10.0000000',
        } as never,
      ],
    });

    expect(result.usdc).toBe('10.0000000');
    expect(result.hasUsdcTrustline).toBe(true);
  });

  it('ignores credit lines from an issuer other than the configured USDC issuer', () => {
    const result = parseBalances({
      balances: [
        {
          asset_type: 'credit_alphanum4',
          asset_code: 'USDC',
          asset_issuer: 'GDIFFERENTISSUERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          balance: '5.0000000',
        } as never,
      ],
    });

    expect(result.usdc).toBeNull();
    expect(result.hasUsdcTrustline).toBe(false);
  });

  it('defaults the XLM balance to 0 when no native line is present', () => {
    const result = parseBalances({ balances: [] });
    expect(result.xlm).toBe('0');
  });
});

describe('parseNativeBalanceStroops', () => {
  it('converts Horizon native balance strings to stroops without floating point', () => {
    const stroops = parseNativeBalanceStroops({
      balances: [{ asset_type: 'native', balance: '123.4567890' } as never],
    });

    expect(stroops).toBe(1234567890n);
    expect(typeof stroops).toBe('bigint');
  });

  it('returns 0n when no native line is present', () => {
    expect(parseNativeBalanceStroops({ balances: [] })).toBe(0n);
  });
});

describe('parseUsdcBalanceStroops', () => {
  it('converts matching USDC trustline balances to stroops', () => {
    const stroops = parseUsdcBalanceStroops({
      balances: [
        {
          asset_type: 'credit_alphanum4',
          asset_code: 'USDC',
          asset_issuer: USDC_ISSUER,
          balance: '10.5000001',
        } as never,
      ],
    });

    expect(stroops).toBe(105000001n);
  });

  it('returns 0n when no configured USDC trustline exists', () => {
    expect(parseUsdcBalanceStroops({ balances: [] })).toBe(0n);
  });
});

describe('getMinimumBalanceStroops', () => {
  it('returns 1 XLM (10_000_000 stroops) for subentry_count 0', () => {
    expect(getMinimumBalanceStroops(0)).toBe(10_000_000n);
  });

  it('scales reserve with subentry_count using (2 + n) * base reserve', () => {
    expect(getMinimumBalanceStroops(3)).toBe(25_000_000n);
    expect(getMinimumBalanceStroops(10)).toBe(60_000_000n);
  });
});

describe('fetchBalances', () => {
  beforeEach(() => {
    server.loadAccount.mockReset();
  });

  it('loads the account from Horizon and parses its balances', async () => {
    server.loadAccount.mockResolvedValueOnce({
      balances: [{ asset_type: 'native', balance: '5.0000000' }],
    });

    const result = await fetchBalances('GPUBLICKEY');

    expect(server.loadAccount).toHaveBeenCalledWith('GPUBLICKEY');
    expect(result.xlm).toBe('5.0000000');
  });
});
