/**
 * Manual NFC spike helpers for dev-build verification (CLI-045).
 * Not used in production flows — validates NDEF roundtrip on physical devices.
 */
import { nfcService } from '@/features/nfc/services/nfcServiceImpl';
import { encodePaymentRequest } from '@/features/nfc/services/NfcPayloadCodec';
import { createPaymentRequest } from '@/features/nfc/schemas/paymentRequest';

export async function nfcSpikeCheckSupport(): Promise<{ supported: boolean; enabled: boolean }> {
  const supported = await nfcService.isSupported();
  const enabled = supported ? await nfcService.isEnabled() : false;
  return { supported, enabled };
}

export function nfcSpikeSamplePayload(recipient: string) {
  return createPaymentRequest({
    recipient,
    asset: 'USDC',
    amount: '1.00',
    ttlSeconds: 60,
  });
}

export async function nfcSpikeWriteSample(recipient: string): Promise<void> {
  const request = nfcSpikeSamplePayload(recipient);
  const bytes = encodePaymentRequest(request);

  await nfcService.startWriterSession(bytes, {
    alertMessage: 'NFC spike: ready to broadcast sample payment request',
  });
}

export async function nfcSpikeCancel(): Promise<void> {
  await nfcService.cancelSession();
}
