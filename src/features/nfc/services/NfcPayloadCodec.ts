import { MAX_NDEF_PAYLOAD_BYTES } from '@/features/nfc/constants/nfcConstants';
import {
  parsePaymentRequest,
  parsePaymentRequestFresh,
  type PaymentRequest,
  PaymentRequestValidationError,
} from '@/features/nfc/schemas/paymentRequest';
import { NfcError } from '@/features/nfc/services/NfcService.types';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodePaymentRequest(request: PaymentRequest): Uint8Array {
  const json = JSON.stringify(request);
  const bytes = textEncoder.encode(json);

  assertMaxPayloadSize(bytes);
  return bytes;
}

export function decodePaymentRequest(
  bytes: Uint8Array,
  options?: { rejectExpired?: boolean; nowMs?: number }
): PaymentRequest {
  assertMaxPayloadSize(bytes);

  let parsed: unknown;
  try {
    parsed = JSON.parse(textDecoder.decode(bytes));
  } catch {
    throw new NfcError('PAYLOAD_MALFORMED', 'NFC payload is not valid JSON');
  }

  try {
    if (options?.rejectExpired) {
      return parsePaymentRequestFresh(parsed, options.nowMs);
    }

    return parsePaymentRequest(parsed);
  } catch (error) {
    if (error instanceof PaymentRequestValidationError) {
      const code = error.message.includes('expired') ? 'PAYLOAD_EXPIRED' : 'PAYLOAD_INVALID';
      throw new NfcError(code, error.message);
    }

    throw error;
  }
}

export function assertMaxPayloadSize(bytes: Uint8Array): void {
  if (bytes.byteLength > MAX_NDEF_PAYLOAD_BYTES) {
    throw new NfcError(
      'PAYLOAD_OVERSIZE',
      `NFC payload exceeds ${MAX_NDEF_PAYLOAD_BYTES} byte limit (${bytes.byteLength} bytes)`
    );
  }
}

export const nfcPayloadCodec = {
  encode: encodePaymentRequest,
  decode: decodePaymentRequest,
  assertMaxPayloadSize,
};
