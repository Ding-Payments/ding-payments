/**
 * CLI-026 — useSessionPolicy
 *
 * Monitors AppState transitions and activity timestamps to enforce
 * session lock policy:
 *
 * - Background lock: app backgrounded > BACKGROUND_LOCK_MS → lock
 * - Idle lock: no user activity for > IDLE_LOCK_MS → lock
 *
 * NFC-active lock exemption: when nfcActive is true, background lock
 * is skipped. This is the hook point for future NFC coordination.
 *
 * Usage:
 *   Mount once at the root layout inside <AuthProvider>.
 *   Pass nfcActive from NFC feature state when available.
 */

import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { SESSION } from '@/constants/session';
import { useAuth } from './useAuth';

interface UseSessionPolicyOptions {
  /**
   * NFC-active exemption: when true, background lock is suppressed.
   * Hook point for future NFC coordination — wire via nfcActive state.
   */
  nfcActive?: boolean;
}

export function useSessionPolicy({ nfcActive = false }: UseSessionPolicyOptions = {}) {
  const { state, lock } = useAuth();
  const backgroundedAt = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Idle lock timer ─────────────────────────────────────────────────────────
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (state.status !== 'READY') return;

    idleTimerRef.current = setTimeout(() => {
      lock();
    }, SESSION.IDLE_LOCK_MS);
  };

  // ── AppState background/foreground transitions ──────────────────────────────
  useEffect(() => {
    if (state.status !== 'READY') return;

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'background' || nextState === 'inactive') {
          backgroundedAt.current = Date.now();
        } else if (nextState === 'active') {
          const elapsed = backgroundedAt.current
            ? Date.now() - backgroundedAt.current
            : 0;
          backgroundedAt.current = null;

          // Skip lock if NFC is active (exemption hook point)
          if (nfcActive) return;

          // Grace period: very short background (e.g. notification tray) → skip
          if (elapsed > SESSION.BACKGROUND_GRACE_MS && elapsed > SESSION.BACKGROUND_LOCK_MS) {
            lock();
          }
        }
      }
    );

    return () => subscription.remove();
  }, [state.status, nfcActive, lock]);

  // ── Start/reset idle timer whenever auth status changes ──────────────────────
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.lastAuthAt]);
}
