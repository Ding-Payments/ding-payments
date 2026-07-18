import { useCallback, useEffect, useRef } from 'react';

import type { PaymentRequest } from '@/features/nfc/schemas/paymentRequest';
import { startReaderSession, type NfcReaderSession } from '@/features/nfc/services/NfcReader';
import { NfcError } from '@/features/nfc/services/NfcService.types';
import { useNfcSessionStore } from '@/features/nfc/state/nfcSessionStore';

export interface UseNfcReaderResult {
  status: ReturnType<typeof useNfcSessionStore.getState>['status'];
  error: NfcError | null;
  lastRequest: PaymentRequest | null;
  startReading: () => Promise<void>;
  cancel: () => Promise<void>;
  reset: () => void;
}

export function useNfcReader(): UseNfcReaderResult {
  const status = useNfcSessionStore((state) => state.status);
  const error = useNfcSessionStore((state) => state.error);
  const lastRequest = useNfcSessionStore((state) => state.lastRequest);
  const beginScanning = useNfcSessionStore((state) => state.beginScanning);
  const setSuccess = useNfcSessionStore((state) => state.setSuccess);
  const setError = useNfcSessionStore((state) => state.setError);
  const reset = useNfcSessionStore((state) => state.reset);

  const sessionRef = useRef<NfcReaderSession | null>(null);

  const cancel = useCallback(async () => {
    await sessionRef.current?.cancel();
    sessionRef.current = null;
    reset();
  }, [reset]);

  const startReading = useCallback(async () => {
    await cancel();
    beginScanning();

    try {
      sessionRef.current = await startReaderSession({
        onRequest: (request) => {
          setSuccess(request);
          sessionRef.current = null;
        },
        onError: (readerError) => {
          if (readerError.code === 'SESSION_CANCELLED') {
            reset();
          } else {
            setError(readerError);
          }
          sessionRef.current = null;
        },
      });
    } catch (readerError) {
      setError(
        readerError instanceof NfcError
          ? readerError
          : new NfcError('NATIVE_ERROR', String(readerError))
      );
      sessionRef.current = null;
    }
  }, [beginScanning, cancel, reset, setError, setSuccess]);

  useEffect(() => {
    return () => {
      void sessionRef.current?.cancel();
    };
  }, []);

  return { status, error, lastRequest, startReading, cancel, reset };
}
