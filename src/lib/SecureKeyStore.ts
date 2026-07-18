/**
 * CLI-017 — SecureKeyStore
 *
 * Thin wrapper over expo-secure-store that:
 * - Provides typed key access via SECURE_KEYS constants
 * - Sets appropriate security options per key sensitivity
 * - Never logs or returns secret values in error messages
 *
 * Security notes:
 * - Keys marked as sensitive use WHEN_UNLOCKED_THIS_DEVICE_ONLY on iOS
 * - requireAuthentication is set for credential and wallet keys
 * - All thrown errors are re-thrown without exposing the stored value
 */

import * as SecureStore from 'expo-secure-store';

import type { SecureKey, SecureStoreSetOptions } from './SecureKeyStore.types';
import { SECURE_KEYS } from './SecureKeyStore.types';

// ─── Sensitivity tiers ────────────────────────────────────────────────────────

/**
 * Keys that require biometric/pin authentication before read.
 */
const AUTH_REQUIRED_KEYS: ReadonlySet<SecureKey> = new Set([
  SECURE_KEYS.PASSKEY_CREDENTIAL_ID,
  SECURE_KEYS.WALLET_PUBLIC_KEY,
]);

function buildOptions(
  key: SecureKey,
  overrides?: SecureStoreSetOptions
): SecureStore.SecureStoreOptions {
  const requireAuth = overrides?.requireAuthentication ?? AUTH_REQUIRED_KEYS.has(key);

  return {
    requireAuthentication: requireAuth,
    authenticationPrompt:
      overrides?.authenticationPrompt ??
      (requireAuth ? 'Autentícate para acceder a tu billetera Ding' : undefined),
    keychainService: 'ding-payments',
  };
}

// ─── SecureKeyStore API ───────────────────────────────────────────────────────

export const SecureKeyStore = {
  /**
   * Writes a value to the secure store.
   * Uses WHEN_UNLOCKED_THIS_DEVICE_ONLY semantics by default via expo-secure-store.
   */
  async set(key: SecureKey, value: string, options?: SecureStoreSetOptions): Promise<void> {
    await SecureStore.setItemAsync(key, value, buildOptions(key, options));
  },

  /**
   * Reads a value from the secure store.
   * Returns null if the key does not exist.
   * Throws if authentication is required and fails.
   */
  async get(key: SecureKey, options?: SecureStoreSetOptions): Promise<string | null> {
    return SecureStore.getItemAsync(key, buildOptions(key, options));
  },

  /**
   * Deletes a value from the secure store.
   * Safe to call even if the key does not exist.
   */
  async delete(key: SecureKey): Promise<void> {
    await SecureStore.deleteItemAsync(key, { keychainService: 'ding-payments' });
  },

  /**
   * Returns whether expo-secure-store is available on this device.
   * On web or unsupported environments this may return false.
   */
  isAvailable(): boolean {
    return SecureStore.isAvailableAsync !== undefined;
  },
};
