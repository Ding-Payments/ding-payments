import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { BACKGROUND_LOCK_MS, FOREGROUND_IDLE_LOCK_MS } from '@/constants/session';
import { selectNfcActive, useNfcSessionStore } from '@/features/nfc/state/nfcSessionStore';

export interface UseSessionPolicyOptions {
  onLock?: () => void;
}

/**
 * Enforces background/idle lock policy while respecting active NFC sessions.
 * Integrates with nfcSessionStore.nfcActive (CLI-052).
 */
export function useSessionPolicy(options: UseSessionPolicyOptions = {}) {
  const nfcActive = useNfcSessionStore(selectNfcActive);
  const lastInteractionRef = useRef(Date.now());
  const backgroundAtRef = useRef<number | null>(null);

  const touch = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nfcActive) {
        return;
      }

      const now = Date.now();

      if (nextState === 'background' || nextState === 'inactive') {
        backgroundAtRef.current = now;
        return;
      }

      if (nextState === 'active' && backgroundAtRef.current !== null) {
        const elapsed = now - backgroundAtRef.current;
        backgroundAtRef.current = null;

        if (elapsed >= BACKGROUND_LOCK_MS) {
          options.onLock?.();
        }

        lastInteractionRef.current = now;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);

    const idleTimer = setInterval(() => {
      if (nfcActive || AppState.currentState !== 'active') {
        return;
      }

      if (Date.now() - lastInteractionRef.current >= FOREGROUND_IDLE_LOCK_MS) {
        options.onLock?.();
      }
    }, 30_000);

    return () => {
      subscription.remove();
      clearInterval(idleTimer);
    };
  }, [nfcActive, options.onLock]);

  return { nfcActive, touch };
}

export function useNfcActive(): boolean {
  return useNfcSessionStore(selectNfcActive);
}
