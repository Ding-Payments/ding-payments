/**
 * CLI-039 — Payment transaction input schema and amount validation.
 *
 * Validates Stellar payment parameters before TransactionBuilder constructs ops.
 * Amount parsing uses bigint stroops — no JavaScript Number for monetary math.
 */
import { z } from 'zod';

import {
  STELLAR_ASSETS,
  type SupportedAssetCode,
  isSupportedAssetCode,
} from '@/features/wallet/constants/assets';

/** Stellar StrKey public key (G + 55 base32 chars) — aligned with paymentRequest schema. */
export const STELLAR_PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;

/** Default transaction timebounds window (seconds) — C09 spec. */
export const DEFAULT_PAYMENT_TX_TIMEOUT_SECONDS = 300;

/** Stellar wire-format precision (stroops = 10^7). */
export const STELLAR_AMOUNT_PRECISION = 7;

const STROOP_FACTOR = 10n ** 7n;

const AMOUNT_STRING_REGEX = /^(\d+)(?:\.(\d+))?$/;

export const PAYMENT_TX_ERRORS = {
  invalidSource: 'Invalid source Stellar public key',
  invalidDestination: 'Invalid destination Stellar public key',
  unsupportedAsset: 'Unsupported asset code',
  invalidAmountFormat: 'Amount must be a positive decimal string',
  amountTooManyDecimals: 'Amount exceeds the maximum decimal precision for this asset',
  amountZero: 'Amount must be greater than zero',
  memoTooLong: 'Memo must be at most 28 characters',
} as const;

export const paymentTxSchema = z.object({
  source: z.string().regex(STELLAR_PUBLIC_KEY_REGEX, PAYMENT_TX_ERRORS.invalidSource),
  destination: z.string().regex(STELLAR_PUBLIC_KEY_REGEX, PAYMENT_TX_ERRORS.invalidDestination),
  asset: z
    .string()
    .refine(isSupportedAssetCode, { message: PAYMENT_TX_ERRORS.unsupportedAsset }),
  amount: z.string().min(1, PAYMENT_TX_ERRORS.invalidAmountFormat),
  memo: z
    .string()
    .max(28, PAYMENT_TX_ERRORS.memoTooLong)
    .optional(),
});

export type PaymentTxParams = z.infer<typeof paymentTxSchema>;

export class PaymentTxValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentTxValidationError';
  }
}

export interface ParsedPaymentAmount {
  /** Canonical decimal string with exactly 7 fractional digits for Stellar SDK. */
  stellarAmount: string;
  /** Integer stroops (1 XLM = 10^7 stroops). */
  stroops: bigint;
}

export function parsePaymentTxParams(input: unknown): PaymentTxParams {
  const result = paymentTxSchema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ');
    throw new PaymentTxValidationError(message);
  }
  return result.data;
}

/**
 * Validates and converts a decimal amount string to stroops without floating-point math.
 * Rejects zero, excess fractional digits, and malformed strings.
 */
export function parsePaymentAmount(
  amount: string,
  asset: SupportedAssetCode
): ParsedPaymentAmount {
  const trimmed = amount.trim();
  const match = trimmed.match(AMOUNT_STRING_REGEX);

  if (!match) {
    throw new PaymentTxValidationError(PAYMENT_TX_ERRORS.invalidAmountFormat);
  }

  const wholePart = match[1];
  const fractionPart = match[2] ?? '';
  const maxDecimals = STELLAR_ASSETS[asset].decimals;

  if (fractionPart.length > maxDecimals) {
    throw new PaymentTxValidationError(PAYMENT_TX_ERRORS.amountTooManyDecimals);
  }

  if (fractionPart.length > STELLAR_AMOUNT_PRECISION) {
    throw new PaymentTxValidationError(PAYMENT_TX_ERRORS.amountTooManyDecimals);
  }

  const paddedFraction = fractionPart.padEnd(STELLAR_AMOUNT_PRECISION, '0');
  const stroops = BigInt(`${wholePart}${paddedFraction}`);

  if (stroops <= 0n) {
    throw new PaymentTxValidationError(PAYMENT_TX_ERRORS.amountZero);
  }

  return {
    stellarAmount: `${wholePart}.${paddedFraction}`,
    stroops,
  };
}

export function stroopsToStellarAmount(stroops: bigint): string {
  const negative = stroops < 0n;
  const absolute = negative ? -stroops : stroops;
  const whole = absolute / STROOP_FACTOR;
  const fraction = absolute % STROOP_FACTOR;
  const fractionStr = fraction.toString().padStart(STELLAR_AMOUNT_PRECISION, '0');
  const formatted = `${whole}.${fractionStr}`;
  return negative ? `-${formatted}` : formatted;
}
