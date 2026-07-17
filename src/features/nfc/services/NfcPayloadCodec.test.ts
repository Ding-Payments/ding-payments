import { MAX_NDEF_PAYLOAD_BYTES } from '@/features/nfc/constants/nfcConstants';
import { createPaymentRequest } from '@/features/nfc/schemas/paymentRequest';
import {
  decodePaymentRequest,
  encodePaymentRequest,
} from '@/features/nfc/services/NfcPayloadCodec';
import { NfcError } from '@/features/nfc/services/NfcService.types';

const VALID_RECIPIENT = 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66';

describe('NfcPayloadCodec', () => {
  const sampleRequest = createPaymentRequest({
    recipient: VALID_RECIPIENT,
    asset: 'USDC',
    amount: '10.50',
    timestamp: 1_740_000_000,
    expiresAt: 1_740_000_060,
  });

  it('roundtrips valid payment requests', () => {
    const encoded = encodePaymentRequest(sampleRequest);
    const decoded = decodePaymentRequest(encoded);

    expect(decoded).toEqual(sampleRequest);
  });

  it('rejects malformed JSON payloads', () => {
    const bytes = new TextEncoder().encode('{not-json');

    expect(() => decodePaymentRequest(bytes)).toThrow(NfcError);
    expect(() => decodePaymentRequest(bytes)).toThrow(/valid JSON/i);
  });

  it('rejects oversize payloads', () => {
    const oversized = new Uint8Array(MAX_NDEF_PAYLOAD_BYTES + 1);

    expect(() => decodePaymentRequest(oversized)).toThrow(NfcError);
    expect(() => decodePaymentRequest(oversized)).toThrow(/exceeds/i);
  });

  it('rejects expired payloads when rejectExpired is enabled', () => {
    const encoded = encodePaymentRequest(sampleRequest);

    expect(() =>
      decodePaymentRequest(encoded, {
        rejectExpired: true,
        nowMs: sampleRequest.expiresAt * 1000 + 1,
      })
    ).toThrow(/expired/i);
  });
});
