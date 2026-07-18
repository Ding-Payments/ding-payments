import { NFC_READER_TIMEOUT_MS } from '@/features/nfc/constants/nfcConstants';
import { decodePaymentRequest } from '@/features/nfc/services/NfcPayloadCodec';
import type { PaymentRequest } from '@/features/nfc/schemas/paymentRequest';
import { NfcError, toNfcError } from '@/features/nfc/services/NfcService.types';
import { nfcService } from '@/features/nfc/services/nfcServiceImpl';

export interface NfcReaderSession {
  cancel: () => Promise<void>;
}

export interface StartReaderSessionOptions {
  timeoutMs?: number;
  onRequest: (request: PaymentRequest) => void;
  onError?: (error: NfcError) => void;
  alertMessage?: string;
}

export async function startReaderSession(
  options: StartReaderSessionOptions
): Promise<NfcReaderSession> {
  const timeoutMs = options.timeoutMs ?? NFC_READER_TIMEOUT_MS;
  let cancelled = false;
  let delivered = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const cleanup = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    await nfcService.cancelSession().catch(() => undefined);
  };

  const supported = await nfcService.isSupported();
  if (!supported) {
    throw new NfcError('UNSUPPORTED', 'NFC is not supported on this device');
  }

  const enabled = await nfcService.isEnabled();
  if (!enabled) {
    throw new NfcError('DISABLED', 'NFC is disabled. Enable it in system settings.');
  }

  timeoutId = setTimeout(async () => {
    if (cancelled || delivered) {
      return;
    }

    cancelled = true;
    await cleanup();
    options.onError?.(new NfcError('SESSION_TIMEOUT', 'NFC reader session timed out'));
  }, timeoutMs);

  try {
    await nfcService.startReaderSession({
      alertMessage: options.alertMessage,
      onPayload: (payload) => {
        if (cancelled || delivered) {
          return;
        }

        try {
          const request = decodePaymentRequest(payload, { rejectExpired: true });
          delivered = true;
          cancelled = true;
          void cleanup();
          options.onRequest(request);
        } catch (error) {
          if (delivered || cancelled) {
            return;
          }

          const nfcError = toNfcError(error);
          options.onError?.(nfcError);
        }
      },
      onError: (error) => {
        if (cancelled || delivered) {
          return;
        }

        cancelled = true;
        void cleanup();
        options.onError?.(error);
      },
    });
  } catch (error) {
    cancelled = true;
    await cleanup();
    throw toNfcError(error);
  }

  return {
    cancel: async () => {
      if (cancelled) {
        return;
      }

      cancelled = true;
      await cleanup();
      options.onError?.(new NfcError('SESSION_CANCELLED', 'NFC reader session cancelled'));
    },
  };
}
