import { NotFoundError, Operation } from '@stellar/stellar-sdk';

import {
  DEFAULT_PAYMENT_TX_TIMEOUT_SECONDS,
  PAYMENT_TX_ERRORS,
  PaymentTxValidationError,
  parsePaymentAmount,
  stroopsToStellarAmount,
} from '@/features/wallet/schemas/paymentTx';
import { STELLAR_ASSETS } from '@/features/wallet/constants/assets';
import { mapHorizonError, WalletErrorCode } from '../walletErrors';
import { buildPaymentTx, PaymentTxBuildError } from '../TransactionBuilder';

const mockLoadAccount = jest.fn();

jest.mock('../StellarHorizonClient', () => ({
  stellarHorizonClient: {
    loadAccount: (...args: unknown[]) => mockLoadAccount(...args),
  },
}));

const paymentCalls: Array<Record<string, unknown>> = [];
const setTimeoutCalls: number[] = [];
const builderInstances: unknown[] = [];

jest.mock('@stellar/stellar-sdk', () => {
  class MockAsset {
    code: string;
    issuer?: string;
    isNative?: boolean;

    constructor(code: string, issuer?: string) {
      this.code = code;
      this.issuer = issuer;
      this.isNative = code === 'native';
    }

    static native() {
      return new MockAsset('native');
    }
  }

  class MockTransactionBuilder {
    sourceAccount: unknown;
    options: unknown;
    private memo: unknown;
    private operations: unknown[] = [];

    constructor(sourceAccount: unknown, options: unknown) {
      this.sourceAccount = sourceAccount;
      this.options = options;
      builderInstances.push(this);
    }

    addOperation(operation: unknown) {
      this.operations.push(operation);
      return this;
    }

    addMemo(memo: unknown) {
      this.memo = memo;
      return this;
    }

    setTimeout(seconds: number) {
      setTimeoutCalls.push(seconds);
      return this;
    }

    build() {
      return {
        operations: this.operations,
        memo: this.memo,
        sourceAccount: this.sourceAccount,
        sign: jest.fn(),
      };
    }
  }

  return {
    Asset: MockAsset,
    BASE_FEE: '100',
    NotFoundError: class MockNotFoundError extends Error {
      constructor(message?: string) {
        super(message ?? 'Not Found');
        this.name = 'NotFoundError';
      }
    },
    Memo: {
      text: (value: string) => ({ type: 'text', value }),
    },
    Operation: {
      payment: jest.fn((params: Record<string, unknown>) => {
        paymentCalls.push(params);
        return { type: 'payment', ...params };
      }),
    },
    TransactionBuilder: MockTransactionBuilder,
    Networks: {
      PUBLIC: 'Public Global Stellar Network ; September 2015',
      TESTNET: 'Test SDF Network ; September 2015',
    },
  };
});

/** Valid 56-char Stellar account ids (G + 55 base32 chars). */
const SOURCE = 'GBRHKTZK42KXDGWYQLO3XWE4CCO76LNJV3HY33XWXX6BAHEHS5LADKKO';
const DESTINATION = 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66';

const SOURCE_ACCOUNT = {
  account_id: SOURCE,
  sequence: '42',
  balances: [{ asset_type: 'native', balance: '100.0000000' }],
};

describe('buildPaymentTx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    paymentCalls.length = 0;
    setTimeoutCalls.length = 0;
    builderInstances.length = 0;
    mockLoadAccount.mockReset();
    mockLoadAccount.mockResolvedValue(SOURCE_ACCOUNT);
  });

  it('builds a valid XLM payment', async () => {
    const transaction = await buildPaymentTx({
      source: SOURCE,
      destination: DESTINATION,
      asset: 'XLM',
      amount: '10.5',
    });

    expect(mockLoadAccount).toHaveBeenCalledWith(SOURCE);
    expect(paymentCalls[0]).toMatchObject({
      destination: DESTINATION,
      amount: '10.5000000',
    });
    expect((paymentCalls[0]?.asset as { isNative?: boolean }).isNative).toBe(true);
    expect(setTimeoutCalls).toEqual([DEFAULT_PAYMENT_TX_TIMEOUT_SECONDS]);
    expect(transaction.sign).toBeDefined();
    expect(transaction.sign).not.toHaveBeenCalled();
  });

  it('builds a valid USDC payment with issuer asset', async () => {
    await buildPaymentTx({
      source: SOURCE,
      destination: DESTINATION,
      asset: 'USDC',
      amount: '25.1234567',
    });

    const asset = paymentCalls[0]?.asset as { code: string; issuer?: string };
    expect(asset.code).toBe('USDC');
    expect(asset.issuer).toBeTruthy();
    expect(paymentCalls[0]?.amount).toBe('25.1234567');
  });

  it('converts decimal amounts to canonical 7-digit Stellar precision', async () => {
    await buildPaymentTx({
      source: SOURCE,
      destination: DESTINATION,
      asset: 'XLM',
      amount: '1',
    });

    expect(paymentCalls[0]?.amount).toBe('1.0000000');
  });

  it('rejects zero amounts', async () => {
    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: DESTINATION,
        asset: 'XLM',
        amount: '0',
      })
    ).rejects.toThrow(PaymentTxValidationError);

    expect(mockLoadAccount).not.toHaveBeenCalled();
  });

  it('rejects negative amounts', async () => {
    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: DESTINATION,
        asset: 'XLM',
        amount: '-1',
      })
    ).rejects.toThrow(PaymentTxValidationError);
  });

  it('rejects amounts with too many decimal places', async () => {
    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: DESTINATION,
        asset: 'XLM',
        amount: '1.12345678',
      })
    ).rejects.toThrow(PaymentTxValidationError);
  });

  it('rejects sub-stroop precision such as 1.00000001', async () => {
    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: DESTINATION,
        asset: 'XLM',
        amount: '1.00000001',
      })
    ).rejects.toThrow(PaymentTxValidationError);
  });

  it('rejects invalid destination keys', async () => {
    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: 'not-a-stellar-key',
        asset: 'XLM',
        amount: '1',
      })
    ).rejects.toThrow(PaymentTxValidationError);
  });

  it('accepts valid Stellar destination keys', async () => {
    await buildPaymentTx({
      source: SOURCE,
      destination: DESTINATION,
      asset: 'XLM',
      amount: '2',
    });

    expect(paymentCalls[0]?.destination).toBe(DESTINATION);
  });

  it('rejects unsupported assets', async () => {
    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: DESTINATION,
        asset: 'BTC',
        amount: '1',
      } as never)
    ).rejects.toThrow(PaymentTxValidationError);
  });

  it('applies default timebounds of 300 seconds', async () => {
    await buildPaymentTx({
      source: SOURCE,
      destination: DESTINATION,
      asset: 'XLM',
      amount: '1',
    });

    expect(setTimeoutCalls).toEqual([300]);
  });

  it('allows overriding timeout via deps', async () => {
    await buildPaymentTx(
      {
        source: SOURCE,
        destination: DESTINATION,
        asset: 'XLM',
        amount: '1',
      },
      { timeoutSeconds: 120 }
    );

    expect(setTimeoutCalls).toEqual([120]);
  });

  it('rejects invalid source keys', async () => {
    await expect(
      buildPaymentTx({
        source: 'invalid-source-key',
        destination: DESTINATION,
        asset: 'XLM',
        amount: '1',
      })
    ).rejects.toThrow(PaymentTxValidationError);

    expect(mockLoadAccount).not.toHaveBeenCalled();
  });

  it('rejects memos longer than 28 characters', async () => {
    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: DESTINATION,
        asset: 'XLM',
        amount: '1',
        memo: 'a'.repeat(29),
      })
    ).rejects.toThrow(PaymentTxValidationError);

    expect(mockLoadAccount).not.toHaveBeenCalled();
  });

  it('throws PaymentTxBuildError when USDC issuer is not configured', async () => {
    const usdcAsset = STELLAR_ASSETS.USDC as {
      code: string;
      issuer?: string;
      displayName: string;
      decimals: number;
    };
    const originalIssuer = usdcAsset.issuer;

    usdcAsset.issuer = undefined;

    try {
      await expect(
        buildPaymentTx({
          source: SOURCE,
          destination: DESTINATION,
          asset: 'USDC',
          amount: '1',
        })
      ).rejects.toThrow(PaymentTxBuildError);
    } finally {
      usdcAsset.issuer = originalIssuer;
    }
  });

  it('throws when the source account cannot be loaded', async () => {
    mockLoadAccount.mockRejectedValueOnce(new Error('Not Found'));

    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: DESTINATION,
        asset: 'XLM',
        amount: '1',
      })
    ).rejects.toThrow(PaymentTxBuildError);

    expect(Operation.payment).not.toHaveBeenCalled();
  });

  it('throws PaymentTxBuildError when Horizon returns NotFoundError for the source account', async () => {
    mockLoadAccount.mockRejectedValueOnce(new NotFoundError('missing account', {}));

    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: DESTINATION,
        asset: 'XLM',
        amount: '1',
      })
    ).rejects.toThrow(PaymentTxBuildError);

    expect(mapHorizonError(new NotFoundError('missing account', {})).code).toBe(
      WalletErrorCode.ACCOUNT_NOT_FOUND
    );
  });

  it('throws PaymentTxBuildError when Horizon loadAccount fails with a network error', async () => {
    mockLoadAccount.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(
      buildPaymentTx({
        source: SOURCE,
        destination: DESTINATION,
        asset: 'XLM',
        amount: '1',
      })
    ).rejects.toThrow(PaymentTxBuildError);

    expect(mapHorizonError(new TypeError('Network request failed')).code).toBe(
      WalletErrorCode.NETWORK_ERROR
    );
  });

  it('uses the loaded account (sequence) as the transaction source', async () => {
    await buildPaymentTx({
      source: SOURCE,
      destination: DESTINATION,
      asset: 'XLM',
      amount: '1',
    });

    expect(builderInstances[0]).toMatchObject({
      sourceAccount: SOURCE_ACCOUNT,
    });
    expect((builderInstances[0] as { sourceAccount: { sequence: string } }).sourceAccount.sequence).toBe(
      '42'
    );
  });

  it('does not perform real network calls — Horizon client is mocked', async () => {
    await buildPaymentTx({
      source: SOURCE,
      destination: DESTINATION,
      asset: 'XLM',
      amount: '1',
    });

    expect(mockLoadAccount).toHaveBeenCalledTimes(1);
    expect(builderInstances).toHaveLength(1);
  });

  it('adds an optional text memo when provided', async () => {
    const transaction = await buildPaymentTx({
      source: SOURCE,
      destination: DESTINATION,
      asset: 'XLM',
      amount: '1',
      memo: 'pago-nfc',
    });

    expect(transaction.memo).toEqual({ type: 'text', value: 'pago-nfc' });
  });
});

describe('parsePaymentAmount', () => {
  it('maps exact stroop values without floating-point drift', () => {
    const parsed = parsePaymentAmount('10.5', 'XLM');
    expect(parsed.stroops).toBe(105000000n);
    expect(parsed.stellarAmount).toBe('10.5000000');
    expect(stroopsToStellarAmount(parsed.stroops)).toBe('10.5000000');
  });

  it('rejects malformed amount strings with INVALID_AMOUNT semantics', () => {
    expect(() => parsePaymentAmount('1.2.3', 'XLM')).toThrow(PaymentTxValidationError);
    expect(() => parsePaymentAmount('1.2.3', 'XLM')).toThrow(PAYMENT_TX_ERRORS.invalidAmountFormat);
  });
});
