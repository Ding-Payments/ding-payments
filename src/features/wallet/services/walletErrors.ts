/**
 * CLI-041 — Wallet error mapping
 *
 * Maps Horizon/SDK failures to stable WalletErrorCode values with user-safe
 * Spanish messages. Never expose raw Horizon payloads to UI or analytics.
 *
 * @see authErrors.ts — architectural pattern reference
 */
import { NotFoundError } from '@stellar/stellar-sdk';

import {
  PAYMENT_TX_ERRORS,
  PaymentTxValidationError,
} from '@/features/wallet/schemas/paymentTx';
import type { AffordabilityReason } from './FeeService';
import type { EnsureUsdcTrustlineStatus } from './TrustlineService';

export const WalletErrorCode = {
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  INVALID_RECIPIENT: 'INVALID_RECIPIENT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_RESERVE: 'INSUFFICIENT_RESERVE',
  NO_USDC_TRUSTLINE: 'NO_USDC_TRUSTLINE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_PAYMENT_PARAMS: 'INVALID_PAYMENT_PARAMS',
  BAD_SEQUENCE: 'BAD_SEQUENCE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  WALLET_KEY_MISSING: 'WALLET_KEY_MISSING',
  CONFIG_ERROR: 'CONFIG_ERROR',
  UNSUPPORTED_OPERATION: 'UNSUPPORTED_OPERATION',
  UNKNOWN: 'UNKNOWN',
} as const;

export type WalletErrorCodeValue = (typeof WalletErrorCode)[keyof typeof WalletErrorCode];

export interface WalletError {
  code: WalletErrorCodeValue;
  message: string;
  cause?: unknown;
  retryable?: boolean;
}

const WALLET_ERROR_MESSAGES: Record<WalletErrorCodeValue, string> = {
  ACCOUNT_NOT_FOUND:
    'No encontramos tu cuenta en la red Stellar. Verifica que esté activa.',
  INVALID_RECIPIENT: 'La cuenta destinataria no existe o no es válida.',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente para completar este pago.',
  INSUFFICIENT_RESERVE:
    'No tienes suficiente XLM para cubrir la comisión y la reserva mínima de la cuenta.',
  NO_USDC_TRUSTLINE: 'USDC no está habilitado en tu billetera. Actívalo antes de enviar.',
  INVALID_AMOUNT: 'El monto no es válido. Revisa la cantidad e inténtalo de nuevo.',
  INVALID_PAYMENT_PARAMS: 'Los datos del pago no son válidos.',
  BAD_SEQUENCE: 'La transacción expiró o la secuencia cambió. Inténtalo de nuevo.',
  TRANSACTION_FAILED: 'No se pudo enviar la transacción. Inténtalo de nuevo.',
  NETWORK_ERROR:
    'No pudimos conectar con la red. Verifica tu conexión e inténtalo de nuevo.',
  TIMEOUT: 'La operación tardó demasiado. Inténtalo de nuevo.',
  WALLET_KEY_MISSING: 'No se encontró la llave de la billetera en este dispositivo.',
  CONFIG_ERROR: 'La configuración de USDC no está disponible.',
  UNSUPPORTED_OPERATION: 'La operación no está disponible en este entorno.',
  UNKNOWN: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
};

const RETRYABLE_CODES = new Set<WalletErrorCodeValue>([
  WalletErrorCode.NETWORK_ERROR,
  WalletErrorCode.TIMEOUT,
  WalletErrorCode.BAD_SEQUENCE,
]);

const AMOUNT_VALIDATION_MESSAGES = new Set<string>([
  PAYMENT_TX_ERRORS.invalidAmountFormat,
  PAYMENT_TX_ERRORS.amountTooManyDecimals,
  PAYMENT_TX_ERRORS.amountZero,
]);

interface HorizonResultCodes {
  transaction?: string;
  operations?: string[];
}

interface HorizonErrorShape {
  response?: {
    status?: number;
    data?: {
      extras?: {
        result_codes?: HorizonResultCodes;
      };
    };
  };
}

function isNotFoundError(error: unknown): boolean {
  if (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: unknown }).name === 'NotFoundError'
  ) {
    return true;
  }

  if (typeof NotFoundError === 'function') {
    return error instanceof NotFoundError;
  }

  return false;
}

function isAbortError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: unknown }).name === 'AbortError'
  );
}

function extractResultCodes(error: unknown): HorizonResultCodes | null {
  if (error === null || typeof error !== 'object') {
    return null;
  }

  const resultCodes = (error as HorizonErrorShape).response?.data?.extras?.result_codes;
  if (!resultCodes) {
    return null;
  }

  return resultCodes;
}

function extractHttpStatus(error: unknown): number | null {
  if (error === null || typeof error !== 'object') {
    return null;
  }

  const status = (error as HorizonErrorShape).response?.status;
  return typeof status === 'number' ? status : null;
}

function mapOperationResultCode(operationCode: string): WalletErrorCodeValue | null {
  switch (operationCode) {
    case 'op_underfunded':
    case 'op_line_full':
      return WalletErrorCode.INSUFFICIENT_BALANCE;
    case 'op_no_trust':
    case 'op_no_trustline':
      return WalletErrorCode.NO_USDC_TRUSTLINE;
    case 'op_no_destination':
      return WalletErrorCode.INVALID_RECIPIENT;
    default:
      return null;
  }
}

function mapTransactionResultCode(transactionCode: string): WalletErrorCodeValue | null {
  switch (transactionCode) {
    case 'tx_bad_seq':
      return WalletErrorCode.BAD_SEQUENCE;
    case 'tx_too_early':
    case 'tx_too_late':
    case 'tx_failed':
      return WalletErrorCode.TRANSACTION_FAILED;
    default:
      return null;
  }
}

function mapHorizonResultCodes(resultCodes: HorizonResultCodes): WalletErrorCodeValue | null {
  const operations = resultCodes.operations ?? [];

  for (const operationCode of operations) {
    const mapped = mapOperationResultCode(operationCode);
    if (mapped) {
      return mapped;
    }
  }

  if (resultCodes.transaction) {
    return mapTransactionResultCode(resultCodes.transaction);
  }

  return null;
}

function isNetworkError(error: unknown): boolean {
  const status = extractHttpStatus(error);
  if (status !== null && status >= 500) {
    return true;
  }

  return error instanceof TypeError;
}

export function getWalletErrorMessage(code: WalletErrorCodeValue): string {
  return WALLET_ERROR_MESSAGES[code];
}

export function createWalletError(code: WalletErrorCodeValue, cause?: unknown): WalletError {
  return {
    code,
    message: WALLET_ERROR_MESSAGES[code],
    cause,
    retryable: RETRYABLE_CODES.has(code),
  };
}

export function mapHorizonError(error: unknown): WalletError {
  if (isNotFoundError(error)) {
    return createWalletError(WalletErrorCode.ACCOUNT_NOT_FOUND, error);
  }

  if (isAbortError(error)) {
    return createWalletError(WalletErrorCode.TIMEOUT, error);
  }

  const resultCodes = extractResultCodes(error);
  if (resultCodes) {
    const mappedCode = mapHorizonResultCodes(resultCodes);
    if (mappedCode) {
      return createWalletError(mappedCode, error);
    }

    return createWalletError(WalletErrorCode.TRANSACTION_FAILED, error);
  }

  if (isNetworkError(error)) {
    return createWalletError(WalletErrorCode.NETWORK_ERROR, error);
  }

  return createWalletError(WalletErrorCode.UNKNOWN, error);
}

export function mapAffordabilityReason(reason: AffordabilityReason): WalletErrorCodeValue {
  switch (reason) {
    case 'account_not_found':
      return WalletErrorCode.ACCOUNT_NOT_FOUND;
    case 'network_error':
      return WalletErrorCode.NETWORK_ERROR;
    case 'insufficient_balance':
      return WalletErrorCode.INSUFFICIENT_BALANCE;
    case 'insufficient_xlm_for_fee_and_reserve':
      return WalletErrorCode.INSUFFICIENT_RESERVE;
    case 'no_usdc_trustline':
      return WalletErrorCode.NO_USDC_TRUSTLINE;
  }
}

export function mapPaymentValidationError(error: unknown): WalletError {
  if (error instanceof PaymentTxValidationError) {
    const code = AMOUNT_VALIDATION_MESSAGES.has(error.message)
      ? WalletErrorCode.INVALID_AMOUNT
      : WalletErrorCode.INVALID_PAYMENT_PARAMS;

    return createWalletError(code, error);
  }

  return createWalletError(WalletErrorCode.UNKNOWN, error);
}

export function mapEnsureTrustlineStatus(
  status: Extract<EnsureUsdcTrustlineStatus, 'insufficient_reserve' | 'error'>
): WalletErrorCodeValue {
  if (status === 'insufficient_reserve') {
    return WalletErrorCode.INSUFFICIENT_RESERVE;
  }

  return WalletErrorCode.UNKNOWN;
}

export function sanitizeWalletError(err: WalletError): {
  code: WalletErrorCodeValue;
  message: string;
} {
  return { code: err.code, message: err.message };
}
