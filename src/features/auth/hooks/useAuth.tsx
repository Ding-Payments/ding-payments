/**
 * CLI-018 — useAuth hook + AuthProvider
 *
 * Provides the auth state machine via React Context.
 * Handles cold-start rehydration from SecureKeyStore.
 *
 * Usage:
 *   Wrap the app in <AuthProvider> at the root layout.
 *   Access auth state and actions via useAuth() in any component.
 */

import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

import { SecureKeyStore } from '@/lib/SecureKeyStore';
import { SECURE_KEYS } from '@/lib/SecureKeyStore.types';
import { toast } from '@/lib/toast';
import { AuthErrorCode, sanitizeAuthError } from '../services/authErrors';
import { PasskeyService } from '../services/PasskeyService';
import { INITIAL_AUTH_STATE, authReducer } from '../state/authStore';
import { SESSION } from '@/constants/session';
import type { AuthState } from '../state/authStore';

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  /** Register a new passkey during onboarding */
  registerPasskey: (displayName: string) => Promise<boolean>;
  /** Re-authenticate using an existing passkey */
  unlockWithPasskey: () => Promise<boolean>;
  /** Lock the session (called by session policy or manually) */
  lock: () => void;
  /** Log out and clear all auth artifacts */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE);

  // ── Cold-start rehydration ──────────────────────────────────────────────────
  useEffect(() => {
    async function rehydrate() {
      try {
        const [credentialId, publicKey, lastActive] = await Promise.all([
          SecureKeyStore.get(SECURE_KEYS.PASSKEY_CREDENTIAL_ID).catch(() => null),
          SecureKeyStore.get(SECURE_KEYS.WALLET_PUBLIC_KEY).catch(() => null),
          SecureKeyStore.get(SECURE_KEYS.SESSION_LAST_ACTIVE).catch(() => null),
        ]);

        dispatch({
          type: 'REHYDRATE',
          payload: {
            credentialId: credentialId ?? null,
            publicKey: publicKey ?? null,
            lastAuthAt: lastActive ?? null,
          },
        });
      } catch {
        // If rehydration fails entirely, start fresh as unauthenticated
        dispatch({
          type: 'REHYDRATE',
          payload: {},
        });
      }
    }

    void rehydrate();
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const registerPasskey = useCallback(async (displayName: string): Promise<boolean> => {
    dispatch({ type: 'SET_ERROR', error: null });

    const result = await PasskeyService.register({
      rpId: SESSION.RP_ID,
      rpName: SESSION.RP_NAME,
      userId: displayName,
      displayName,
      challenge: '',
    });

    if (!result.success) {
      const safe = sanitizeAuthError(result.error);
      dispatch({ type: 'SET_ERROR', error: safe.message });
      toast.error(result.error.message);
      return false;
    }

    // Persist public key placeholder until server-provided key is available
    // In production, the public key comes from the server after verification
    const publicKeyPlaceholder = result.credential.credentialId;
    await SecureKeyStore.set(SECURE_KEYS.WALLET_PUBLIC_KEY, publicKeyPlaceholder).catch(() => null);

    dispatch({
      type: 'PASSKEY_REGISTERED',
      credentialId: result.credential.credentialId,
      publicKey: publicKeyPlaceholder,
    });

    // Persist session timestamp
    await SecureKeyStore.set(SECURE_KEYS.SESSION_LAST_ACTIVE, new Date().toISOString(), {
      requireAuthentication: false,
    }).catch(() => null);

    return true;
  }, []);

  // ── Unlock ──────────────────────────────────────────────────────────────────
  const unlockWithPasskey = useCallback(async (): Promise<boolean> => {
    dispatch({ type: 'SET_ERROR', error: null });

    const result = await PasskeyService.authenticate({
      rpId: SESSION.RP_ID,
      challenge: '',
    });

    if (!result.success) {
      // Don't show toast for user-cancelled — silent UX
      if (result.error.code !== AuthErrorCode.USER_CANCELLED) {
        toast.error(result.error.message);
      }
      dispatch({ type: 'SET_ERROR', error: result.error.message });
      return false;
    }

    dispatch({
      type: 'AUTHENTICATED',
      credentialId: result.result.credentialId,
    });

    await SecureKeyStore.set(SECURE_KEYS.SESSION_LAST_ACTIVE, new Date().toISOString(), {
      requireAuthentication: false,
    }).catch(() => null);

    return true;
  }, []);

  // ── Lock ────────────────────────────────────────────────────────────────────
  const lock = useCallback(() => {
    dispatch({ type: 'LOCK' });
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await PasskeyService.revoke();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ state, registerPasskey, unlockWithPasskey, lock, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
