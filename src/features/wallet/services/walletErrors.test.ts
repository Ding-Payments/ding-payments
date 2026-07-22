jest.mock('@stellar/stellar-sdk', () => {
  class MockNotFoundError extends Error {
    constructor(message?: string) {
      super(message ?? 'Not Found');
      this.name = 'NotFoundError';
    }
  }

  return {
    NotFoundError: MockNotFoundError,
    Networks: {
      PUBLIC: 'Public Global Stellar Network ; September 2015',
      TESTNET: 'Test SDF Network ; September 2015',
    },
  };
});

import { NotFoundError } from '@stellar/stellar-sdk';

import { PaymentTxValidationError, PAYMENT_TX_ERRORS } from '@/features/wallet/schemas/paymentTx';
import {
  createWalletError,
  getWalletErrorMessage,
  mapAffordabilityReason,
  mapHorizonError,
  mapPaymentValidationError,
  sanitizeWalletError,
  WalletErrorCode,
} from './walletErrors';

function horizonSubmitError(resultCodes: {
  transaction?: string;
  operations?: string[];
}): Error & { response: { status: number; data: { extras: { result_codes: typeof resultCodes } } } } {
  return {
    name: 'HorizonError',
    message: 'Transaction failed',
    response: {
      status: 400,
      data: {
        extras: {
          result_codes: resultCodes,
        },
      },
    },
  } as never;
}

describe('mapHorizonError', () => {
  it.each([
    ['NotFoundError', new NotFoundError('missing', {}), WalletErrorCode.ACCOUNT_NOT_FOUND],
    [
      'op_underfunded',
      horizonSubmitError({ transaction: 'tx_failed', operations: ['op_underfunded'] }),
      WalletErrorCode.INSUFFICIENT_BALANCE,
    ],
    [
      'op_no_trust',
      horizonSubmitError({ transaction: 'tx_failed', operations: ['op_no_trust'] }),
      WalletErrorCode.NO_USDC_TRUSTLINE,
    ],
    [
      'op_no_trustline',
      horizonSubmitError({ transaction: 'tx_failed', operations: ['op_no_trustline'] }),
      WalletErrorCode.NO_USDC_TRUSTLINE,
    ],
    [
      'op_no_destination',
      horizonSubmitError({ transaction: 'tx_failed', operations: ['op_no_destination'] }),
      WalletErrorCode.INVALID_RECIPIENT,
    ],
    [
      'op_line_full',
      horizonSubmitError({ transaction: 'tx_failed', operations: ['op_line_full'] }),
      WalletErrorCode.INSUFFICIENT_BALANCE,
    ],
    [
      'tx_bad_seq',
      horizonSubmitError({ transaction: 'tx_bad_seq', operations: [] }),
      WalletErrorCode.BAD_SEQUENCE,
    ],
    [
      'tx_too_early',
      horizonSubmitError({ transaction: 'tx_too_early', operations: [] }),
      WalletErrorCode.TRANSACTION_FAILED,
    ],
    [
      'tx_too_late',
      horizonSubmitError({ transaction: 'tx_too_late', operations: [] }),
      WalletErrorCode.TRANSACTION_FAILED,
    ],
    [
      'generic 5xx',
      { response: { status: 503, data: {} } },
      WalletErrorCode.NETWORK_ERROR,
    ],
    ['network TypeError', new TypeError('Network request failed'), WalletErrorCode.NETWORK_ERROR],
    ['AbortError', Object.assign(new Error('aborted'), { name: 'AbortError' }), WalletErrorCode.TIMEOUT],
    ['unknown error', new Error('something else'), WalletErrorCode.UNKNOWN],
  ] as const)('maps %s to %s', (_label, error, expectedCode) => {
    const result = mapHorizonError(error);
    expect(result.code).toBe(expectedCode);
  });

  it('prioritizes operation result codes over transaction codes', () => {
    const result = mapHorizonError(
      horizonSubmitError({
        transaction: 'tx_bad_seq',
        operations: ['op_underfunded'],
      })
    );

    expect(result.code).toBe(WalletErrorCode.INSUFFICIENT_BALANCE);
  });
});

describe('mapAffordabilityReason', () => {
  it.each([
    ['account_not_found', WalletErrorCode.ACCOUNT_NOT_FOUND],
    ['network_error', WalletErrorCode.NETWORK_ERROR],
    ['insufficient_balance', WalletErrorCode.INSUFFICIENT_BALANCE],
    ['insufficient_xlm_for_fee_and_reserve', WalletErrorCode.INSUFFICIENT_RESERVE],
    ['no_usdc_trustline', WalletErrorCode.NO_USDC_TRUSTLINE],
  ] as const)('maps %s to %s', (reason, expectedCode) => {
    expect(mapAffordabilityReason(reason)).toBe(expectedCode);
  });
});

describe('mapPaymentValidationError', () => {
  it('maps amount validation failures to INVALID_AMOUNT', () => {
    const result = mapPaymentValidationError(
      new PaymentTxValidationError(PAYMENT_TX_ERRORS.amountZero)
    );

    expect(result.code).toBe(WalletErrorCode.INVALID_AMOUNT);
  });

  it('maps schema validation failures to INVALID_PAYMENT_PARAMS', () => {
    const result = mapPaymentValidationError(
      new PaymentTxValidationError(PAYMENT_TX_ERRORS.invalidSource)
    );

    expect(result.code).toBe(WalletErrorCode.INVALID_PAYMENT_PARAMS);
  });
});

describe('getWalletErrorMessage', () => {
  it('returns a Spanish message for every WalletErrorCode value', () => {
    for (const code of Object.values(WalletErrorCode)) {
      const message = getWalletErrorMessage(code);
      expect(message.length).toBeGreaterThan(0);
      expect(message).toBe(createWalletError(code).message);
    }
  });
});

describe('createWalletError', () => {
  it('preserves cause internally while exposing a safe message', () => {
    const cause = { response: { data: { secret: 'must-not-leak' } } };
    const result = createWalletError(WalletErrorCode.NETWORK_ERROR, cause);

    expect(result.cause).toBe(cause);
    expect(result.message).toBe(getWalletErrorMessage(WalletErrorCode.NETWORK_ERROR));
    expect(result.retryable).toBe(true);
  });
});

describe('sanitizeWalletError', () => {
  it('never exposes cause or raw Horizon payloads', () => {
    const sanitized = sanitizeWalletError(
      createWalletError(WalletErrorCode.TRANSACTION_FAILED, {
        response: { data: { extras: { result_codes: { operations: ['op_underfunded'] } } } },
      })
    );

    expect(sanitized).toEqual({
      code: WalletErrorCode.TRANSACTION_FAILED,
      message: getWalletErrorMessage(WalletErrorCode.TRANSACTION_FAILED),
    });
    expect(sanitized).not.toHaveProperty('cause');
    expect(JSON.stringify(sanitized)).not.toContain('op_underfunded');
  });
});
