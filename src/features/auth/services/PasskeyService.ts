/**
 * CLI-014 — PasskeyService
 *
 * Core service for passkey registration, authentication, and revocation.
 * Wraps react-native-passkey (v3.5.x) and decouples native API details
 * from the rest of the application.
 *
 * Security notes:
 * - Never store private keys in passkey payloads.
 * - Challenge values should be server-generated in production; this MVP
 *   generates them locally as a placeholder until S06 endpoints are live.
 * - All errors are sanitized before leaving this layer.
 */

import { Platform } from 'react-native';
import { Passkey } from 'react-native-passkey';

import { AuthErrorCode, createAuthError, mapNativePasskeyError } from './authErrors';
import { SecureKeyStore } from '@/lib/SecureKeyStore';
import { SECURE_KEYS } from '@/lib/SecureKeyStore.types';
import type {
  AuthenticateResult,
  PasskeyAuthOptions,
  PasskeyCredentialInfo,
  PasskeyRegistrationOptions,
  PasskeySupportInfo,
  RegisterResult,
  RevokeResult,
} from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

/** COSE algorithm: ES256 */
const COSE_ES256 = -7;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a random base64url challenge for offline/MVP use.
 * In production, challenges MUST come from the server to prevent replay attacks.
 */
function generateChallenge(): string {
  const bytes = new Uint8Array(32);
  // react-native-get-random-values polyfills crypto.getRandomValues
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('base64url');
}

// ─── PasskeyService ───────────────────────────────────────────────────────────

export const PasskeyService = {
  /**
   * Checks whether passkeys are supported on the current device/runtime.
   */
  getSupportInfo(): PasskeySupportInfo {
    return {
      isSupported: Passkey.isSupported(),
      platform: Platform.OS,
    };
  },

  /**
   * Registers a new passkey for the given user.
   *
   * Stores the resulting credential ID in SecureKeyStore so authenticate()
   * can retrieve it for subsequent assertion requests.
   */
  async register(options: PasskeyRegistrationOptions): Promise<RegisterResult> {
    if (!Passkey.isSupported()) {
      return {
        success: false,
        error: createAuthError(AuthErrorCode.NOT_SUPPORTED),
      };
    }

    const challenge = options.challenge || generateChallenge();

    try {
      const result = await Passkey.create({
        challenge,
        rp: {
          id: options.rpId,
          name: options.rpName,
        },
        user: {
          id: options.userId,
          name: options.displayName,
          displayName: options.displayName,
        },
        pubKeyCredParams: [{ type: 'public-key', alg: COSE_ES256 }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          requireResidentKey: true,
          residentKey: 'required',
          userVerification: 'required',
        },
        attestation: 'none',
      });

      const credential: PasskeyCredentialInfo = {
        credentialId: result.id,
        clientDataJSON: result.response.clientDataJSON,
        attestationObject: result.response.attestationObject,
        transports: result.response.transports ?? [],
        registeredAt: new Date().toISOString(),
      };

      // Persist credential ID for future authentication flows
      await SecureKeyStore.set(SECURE_KEYS.PASSKEY_CREDENTIAL_ID, result.id);

      return { success: true, credential };
    } catch (err: unknown) {
      return { success: false, error: mapNativePasskeyError(err) };
    }
  },

  /**
   * Authenticates the user using their registered passkey.
   *
   * @param options - Auth options including rpId, challenge, and optional reason
   */
  async authenticate(options: PasskeyAuthOptions): Promise<AuthenticateResult> {
    if (!Passkey.isSupported()) {
      return {
        success: false,
        error: createAuthError(AuthErrorCode.NOT_SUPPORTED),
      };
    }

    const challenge = options.challenge || generateChallenge();

    // Retrieve stored credential ID to narrow the assertion to this device
    let allowCredentials = undefined;
    try {
      const credentialId = await SecureKeyStore.get(SECURE_KEYS.PASSKEY_CREDENTIAL_ID);
      if (credentialId) {
        allowCredentials = [{ type: 'public-key' as const, id: credentialId }];
      }
    } catch {
      // Proceed without allowCredentials — user will pick from available keys
    }

    try {
      const result = await Passkey.get({
        challenge,
        rpId: options.rpId,
        userVerification: 'required',
        ...(allowCredentials ? { allowCredentials } : {}),
      });

      return {
        success: true,
        result: {
          credentialId: result.id,
          authenticatorData: result.response.authenticatorData,
          clientDataJSON: result.response.clientDataJSON,
          signature: result.response.signature,
          userHandle: result.response.userHandle,
        },
      };
    } catch (err: unknown) {
      return { success: false, error: mapNativePasskeyError(err) };
    }
  },

  /**
   * Revokes the passkey by clearing all locally stored auth artifacts.
   *
   * Note: This does NOT revoke the credential on the platform authenticator
   * or the server — it only clears the local record. Full revocation requires
   * a server-side call (coordinated via S06 when live).
   */
  async revoke(): Promise<RevokeResult> {
    try {
      await SecureKeyStore.delete(SECURE_KEYS.PASSKEY_CREDENTIAL_ID);
      await SecureKeyStore.delete(SECURE_KEYS.WALLET_PUBLIC_KEY);
      await SecureKeyStore.delete(SECURE_KEYS.AUTH_STATE);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: createAuthError(AuthErrorCode.STORE_ERROR, err),
      };
    }
  },
};
