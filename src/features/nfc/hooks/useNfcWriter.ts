import { useCallback, useEffect, useRef } from 'react';

import type { PaymentRequest } from '@/features/nfc/schemas/paymentRequest';
import { startWriterSession, type NfcWriterSession } from '@/features/nfc/services/NfcWriter';
import { NfcError } from '@/features/nfc/services/NfcService.types';
import { useNfcSessionStore } from '@/features/nfc/state/nfcSessionStore';

export interface UseNfcWriterResult {
  status: ReturnType<typeof useNfcSessionStore.getState>['status'];
  error: NfcError | null;
  startWriting: (request: PaymentRequest) => Promise<void>;
  cancel: () => Promise<void>;
}

export function useNfcWriter(): UseNfcWriterResult {
  const status = useNfcSessionStore((state) => state.status);
  const error = useNfcSessionStore((state) => state.error);
  const beginWriting = useNfcSessionStore((state) => state.beginWriting);
  const setSuccess = useNfcSessionStore((state) => state.setSuccess);
  const setError = useNfcSessionStore((state) => state.setError);
  const reset = useNfcSessionStore((state) => state.reset);

  const sessionRef = useRef<NfcWriterSession | null>(null);

  const cancel = useCallback(async () => {
    await sessionRef.current?.cancel();
    sessionRef.current = null;
    reset();
  }, [reset]);

  const startWriting = useCallback(
    async (request: PaymentRequest) => {
      await cancel();
      beginWriting();

      try {
        sessionRef.current = await startWriterSession(request, {
          onWritten: () => {
            setSuccess(request);
            sessionRef.current = null;
          },
          onError: (writerError) => {
            if (writerError.code === 'SESSION_CANCELLED') {
              reset();
            } else {
              setError(writerError);
            }
            sessionRef.current = null;
          },
        });
      } catch (writerError) {
        setError(writerError instanceof NfcError ? writerError : new NfcError('NATIVE_ERROR', String(writerError)));
        sessionRef.current = null;
      }
    },
    [beginWriting, cancel, reset, setError, setSuccess],
  );

  useEffect(() => {
    return () => {
      void sessionRef.current?.cancel();
    };
  }, []);

  return { status, error, startWriting, cancel };
}
