import { NotFoundError } from '@stellar/stellar-sdk';

import { PaymentTxValidationError } from '@/features/wallet/schemas/paymentTx';
import { canAffordPayment, estimateFee } from './FeeService';

jest.mock('@stellar/stellar-sdk', () => {
  class MockNotFoundError extends Error {
    constructor(message?: string) {
      super(message ?? 'Not Found');
      this.name = 'NotFoundError';
    }
  }

  const horizonServerInstance = {
    loadAccount: jest.fn(),
    submitTransaction: jest.fn(),
  };

  return {
    BASE_FEE: '100',
    NotFoundError: MockNotFoundError,
    Horizon: {
      Server: jest.fn(() => horizonServerInstance),
    },
    Networks: {
      PUBLIC: 'Public Global Stellar Network ; September 2015',
      TESTNET: 'Test SDF Network ; September 2015',
    },
    Asset: jest.fn(),
    Keypair: { fromSecret: jest.fn() },
    Operation: { changeTrust: jest.fn() },
    TransactionBuilder: jest.fn(),
  };
});

jest.mock('@/lib/SecureKeyStore', () => ({
  SecureKeyStore: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

const USDC_ISSUER = 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66';
const PUBLIC_KEY = 'GBRHKTZK42KXDGWYQLO3XWE4CCO76LNJV3HY33XWXX6BAHEHS5LADKKO';

function createMockHorizonClient() {
  return { loadAccount: jest.fn() };
}

function nativeAccount(balance: string, subentryCount = 0) {
  return {
    balances: [{ asset_type: 'native', balance }],
    subentry_count: subentryCount,
  };
}

function usdcAccount(nativeBalance: string, usdcBalance: string, subentryCount = 1) {
  return {
    balances: [
      { asset_type: 'native', balance: nativeBalance },
      {
        asset_type: 'credit_alphanum4',
        asset_code: 'USDC',
        asset_issuer: USDC_ISSUER,
        balance: usdcBalance,
      },
    ],
    subentry_count: subentryCount,
  };
}

describe('estimateFee', () => {
  it('returns 100 stroops and 0.0000100 XLM for a single base-fee operation', () => {
    const fee = estimateFee();

    expect(fee.feeStroops).toBe(100n);
    expect(fee.feeXlm).toBe('0.0000100');
  });
});

describe('canAffordPayment', () => {
  it('returns true for XLM when balance covers amount, fee, and minimum reserve', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(nativeAccount('5.0000000', 0));

    const result = await canAffordPayment(PUBLIC_KEY, '1', 'XLM', { horizonClient });

    expect(result).toEqual({
      canAfford: true,
      estimatedFee: { feeStroops: 100n, feeXlm: '0.0000100' },
    });
  });

  it('returns false for XLM when balance is below amount + fee + reserve', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(nativeAccount('0.5000000', 0));

    const result = await canAffordPayment(PUBLIC_KEY, '1', 'XLM', { horizonClient });

    expect(result.canAfford).toBe(false);
    expect(result.reason).toBe('insufficient_balance');
  });

  it('returns false when XLM covers the amount but not fee and reserve', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(nativeAccount('1.5000100', 0));

    const result = await canAffordPayment(PUBLIC_KEY, '1', 'XLM', { horizonClient });

    expect(result.canAfford).toBe(false);
    expect(result.reason).toBe('insufficient_xlm_for_fee_and_reserve');
  });

  it('returns true for USDC when USDC and XLM for fee plus reserve are sufficient', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(usdcAccount('2.0000100', '10.0000000'));

    const result = await canAffordPayment(PUBLIC_KEY, '5', 'USDC', { horizonClient });

    expect(result.canAfford).toBe(true);
  });

  it('returns false when USDC balance is insufficient', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(usdcAccount('2.0000100', '1.0000000'));

    const result = await canAffordPayment(PUBLIC_KEY, '5', 'USDC', { horizonClient });

    expect(result.canAfford).toBe(false);
    expect(result.reason).toBe('insufficient_balance');
  });

  it('returns false when USDC is sufficient but XLM cannot cover fee and reserve', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(usdcAccount('1.0000000', '10.0000000'));

    const result = await canAffordPayment(PUBLIC_KEY, '5', 'USDC', { horizonClient });

    expect(result.canAfford).toBe(false);
    expect(result.reason).toBe('insufficient_xlm_for_fee_and_reserve');
  });

  it('returns false for USDC when the payer has no USDC trustline', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(nativeAccount('5.0000000', 0));

    const result = await canAffordPayment(PUBLIC_KEY, '1', 'USDC', { horizonClient });

    expect(result.canAfford).toBe(false);
    expect(result.reason).toBe('no_usdc_trustline');
  });

  it('throws PaymentTxValidationError for zero amount', async () => {
    const horizonClient = createMockHorizonClient();

    await expect(
      canAffordPayment(PUBLIC_KEY, '0', 'XLM', { horizonClient })
    ).rejects.toThrow(PaymentTxValidationError);

    expect(horizonClient.loadAccount).not.toHaveBeenCalled();
  });

  it('throws PaymentTxValidationError for negative amount', async () => {
    const horizonClient = createMockHorizonClient();

    await expect(
      canAffordPayment(PUBLIC_KEY, '-1', 'XLM', { horizonClient })
    ).rejects.toThrow(PaymentTxValidationError);
  });

  it('throws PaymentTxValidationError for too many decimal places', async () => {
    const horizonClient = createMockHorizonClient();

    await expect(
      canAffordPayment(PUBLIC_KEY, '1.12345678', 'XLM', { horizonClient })
    ).rejects.toThrow(PaymentTxValidationError);
  });

  it('returns false for dust payments that would leave the account below minimum reserve', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(nativeAccount('2.0000100', 0));

    const result = await canAffordPayment(PUBLIC_KEY, '1.0000100', 'XLM', { horizonClient });

    expect(result.canAfford).toBe(false);
    expect(result.reason).toBe('insufficient_xlm_for_fee_and_reserve');
  });

  it('returns account_not_found when Horizon reports a missing account', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockRejectedValueOnce(new NotFoundError('missing'));

    const result = await canAffordPayment(PUBLIC_KEY, '1', 'XLM', { horizonClient });

    expect(result.canAfford).toBe(false);
    expect(result.reason).toBe('account_not_found');
  });

  it('returns network_error for other Horizon failures', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockRejectedValueOnce(new Error('timeout'));

    const result = await canAffordPayment(PUBLIC_KEY, '1', 'XLM', { horizonClient });

    expect(result.canAfford).toBe(false);
    expect(result.reason).toBe('network_error');
  });

  it('requires more XLM reserve when subentry_count is high', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(nativeAccount('7.0000099', 10));

    const result = await canAffordPayment(PUBLIC_KEY, '1', 'XLM', { horizonClient });

    expect(result.canAfford).toBe(false);
    expect(result.reason).toBe('insufficient_xlm_for_fee_and_reserve');
  });

  it('allows payment at the edge when subentry_count reserve is exactly met', async () => {
    const horizonClient = createMockHorizonClient();
    horizonClient.loadAccount.mockResolvedValueOnce(nativeAccount('7.0000100', 10));

    const result = await canAffordPayment(PUBLIC_KEY, '1', 'XLM', { horizonClient });

    expect(result.canAfford).toBe(true);
  });
});
