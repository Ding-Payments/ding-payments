/**
 * Canonical payment-request payload for NFC transport (payment_request.v1).
 *
 * @see docs/ding-payments.md — Proposed Payment Payload Structure
 * @see docs/adr-nfc-library.md — payload size and encoding constraints
 */
import { z } from 'zod';

import { isSupportedAssetCode } from '@/features/wallet/constants/assets';

/** Stellar StrKey public key (G + 55 base32 chars). */
const STELLAR_PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;

/** Decimal amount string (up to 7 fractional digits). */
const AMOUNT_REGEX = /^\d+(\.\d{1,7})?$/;

export const paymentRequestSchema = z
  .object({
    type: z.literal('payment_request'),
    recipient: z
      .string()
      .regex(STELLAR_PUBLIC_KEY_REGEX, 'Invalid Stellar public key'),
    asset: z
      .string()
      .refine(isSupportedAssetCode, 'Unsupported asset code'),
    amount: z
      .string()
      .regex(AMOUNT_REGEX, 'Amount must be a positive decimal string')
      .refine((value) => parseFloat(value) > 0, 'Amount must be greater than zero'),
    timestamp: z.number().int().positive(),
    expiresAt: z.number().int().positive(),
  })
  .refine((data) => data.expiresAt > data.timestamp, {
    message: 'expiresAt must be after timestamp',
    path: ['expiresAt'],
  });

export type PaymentRequest = z.infer<typeof paymentRequestSchema>;

export class PaymentRequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentRequestValidationError';
  }
}

export function parsePaymentRequest(input: unknown): PaymentRequest {
  const result = paymentRequestSchema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ');
    throw new PaymentRequestValidationError(message);
  }

  return result.data;
}

/** Returns true when the request is still valid at `nowMs` (defaults to Date.now()). */
export function validateExpiry(request: PaymentRequest, nowMs = Date.now()): boolean {
  return request.expiresAt * 1000 > nowMs;
}

/** Parses and rejects expired requests. */
export function parsePaymentRequestFresh(input: unknown, nowMs = Date.now()): PaymentRequest {
  const request = parsePaymentRequest(input);

  if (!validateExpiry(request, nowMs)) {
    throw new PaymentRequestValidationError('Payment request has expired');
  }

  return request;
}

export function createPaymentRequest(
  partial: Omit<PaymentRequest, 'type' | 'timestamp' | 'expiresAt'> & {
    timestamp?: number;
    expiresAt?: number;
    ttlSeconds?: number;
  },
): PaymentRequest {
  const timestamp = partial.timestamp ?? Math.floor(Date.now() / 1000);
  const ttlSeconds = partial.ttlSeconds ?? 30;
  const expiresAt = partial.expiresAt ?? timestamp + ttlSeconds;

  return parsePaymentRequest({
    type: 'payment_request',
    recipient: partial.recipient,
    asset: partial.asset,
    amount: partial.amount,
    timestamp,
    expiresAt,
  });
}
