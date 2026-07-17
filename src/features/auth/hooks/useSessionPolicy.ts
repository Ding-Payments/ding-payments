/**
 * CLI-026 — useSessionPolicy
 *
 * Monitors AppState transitions and activity timestamps to enforce
 * session lock policy. Skips lock while NFC sessions are active (CLI-052).
 */

import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { SESSION } from '@/constants/session';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { selectNfcActive, useNfcSessionStore } from '@/features/nfc/state/nfcSessionStore';

interface UseSessionPolicyOptions {
  /** Override NFC-active detection (defaults to nfcSessionStore). */
  nfcActive?: boolean;
}

export function useSessionPolicy({ nfcActive: nfcActiveOverride }: UseSessionPolicyOptions = {}) {
  const nfcActiveFromStore = useNfcSessionStore(selectNfcActive);
  const nfcActive = nfcActiveOverride ?? nfcActiveFromStore;

  const { state, lock } = useAuth();
  const backgroundedAt = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (state.status !== 'READY' || nfcActive) {
      return;
    }

    idleTimerRef.current = setTimeout(() => {
      lock();
    }, SESSION.IDLE_LOCK_MS);
  };

  useEffect(() => {
    if (state.status !== 'READY') {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAt.current = Date.now();
        return;
      }

      if (nextState !== 'active') {
        return;
      }

      const elapsed = backgroundedAt.current ? Date.now() - backgroundedAt.current : 0;
      backgroundedAt.current = null;

      if (nfcActive) {
        resetIdleTimer();
        return;
      }

      if (elapsed > SESSION.BACKGROUND_GRACE_MS && elapsed > SESSION.BACKGROUND_LOCK_MS) {
        lock();
      }

      resetIdleTimer();
    });

    return () => subscription.remove();
  }, [state.status, nfcActive, lock]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.lastAuthAt, nfcActive]);
}

export function useNfcActive(): boolean {
  return useNfcSessionStore(selectNfcActive);
}
