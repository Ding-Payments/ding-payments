/**
 * Receive amount validation (CLI-062).
 *
 * @see docs/receive-flow.md — timeout model and error matrix
 */
import { z } from 'zod';

/** Decimal amount string (up to 7 fractional digits) — matches paymentRequest's AMOUNT_REGEX. */
const AMOUNT_REGEX = /^\d+(\.\d{1,7})?$/;

/** Largest amount a receive request may ask for. */
export const MAX_RECEIVE_AMOUNT = 999_999;

/** Maximum fractional digits accepted for USDC amounts. */
const USDC_MAX_DECIMALS = 2;

export const RECEIVE_AMOUNT_ERRORS = {
  invalidFormat: 'Enter a valid amount using digits and up to 7 decimal places.',
  tooSmall: 'Amount must be greater than zero.',
  tooLarge: `Amount cannot exceed ${MAX_RECEIVE_AMOUNT.toLocaleString('en-US')}.`,
  usdcPrecision: `USDC amounts support up to ${USDC_MAX_DECIMALS} decimal places.`,
  unsupportedAsset: 'Select a supported asset (XLM or USDC).',
} as const;

function decimalPlaces(amount: string): number {
  return amount.includes('.') ? amount.split('.')[1].length : 0;
}

export const receiveAmountSchema = z
  .object({
    amount: z
      .string()
      .regex(AMOUNT_REGEX, RECEIVE_AMOUNT_ERRORS.invalidFormat)
      .refine((value) => parseFloat(value) > 0, RECEIVE_AMOUNT_ERRORS.tooSmall)
      .refine((value) => parseFloat(value) <= MAX_RECEIVE_AMOUNT, RECEIVE_AMOUNT_ERRORS.tooLarge),
    asset: z.enum(['XLM', 'USDC'], { message: RECEIVE_AMOUNT_ERRORS.unsupportedAsset }),
  })
  .refine((data) => data.asset !== 'USDC' || decimalPlaces(data.amount) <= USDC_MAX_DECIMALS, {
    message: RECEIVE_AMOUNT_ERRORS.usdcPrecision,
    path: ['amount'],
  });

export type ReceiveAmountInput = z.infer<typeof receiveAmountSchema>;
