/**
 * CLI-025 — AuthApiClient stub
 *
 * Server-facing auth interfaces and stub implementation.
 * These types mirror anticipated S06/S10 server DTOs.
 *
 * All methods are STUBBED — they return mock success responses
 * until the real server endpoints are live. Wire live endpoints
 * by replacing stub bodies with real fetch/axios calls.
 *
 * Coordination: S06/S07 (user/auth domain), S10/S11 (WebAuthn semantics),
 * S19 (observability/telemetry conventions).
 */

import type {
  PasskeyAuthResult,
  PasskeyCredentialInfo,
} from './types';

// ─── Request / Response DTOs ──────────────────────────────────────────────────

export interface RegisterChallengeRequest {
  /** Client-provided user display name */
  displayName: string;
}

export interface RegisterChallengeResponse {
  /** Base64url challenge to use in Passkey.create() */
  challenge: string;
  /** Relying party ID from the server */
  rpId: string;
  /** User ID assigned by server */
  userId: string;
  /** Challenge expiry (ISO timestamp) */
  expiresAt: string;
}

export interface RegisterVerifyRequest {
  credential: PasskeyCredentialInfo;
  /** Challenge used during registration */
  challenge: string;
}

export interface RegisterVerifyResponse {
  /** Server-assigned wallet public key (Stellar address) */
  publicKey: string;
  /** Server-issued session token (for future use) */
  sessionToken: string;
  /** Token expiry (ISO timestamp) */
  expiresAt: string;
}

export interface AuthChallengeRequest {
  /** Credential ID used to hint the server which key to expect */
  credentialId?: string;
}

export interface AuthChallengeResponse {
  challenge: string;
  rpId: string;
  expiresAt: string;
}

export interface AuthVerifyRequest {
  result: PasskeyAuthResult;
  challenge: string;
}

export interface AuthVerifyResponse {
  sessionToken: string;
  publicKey: string;
  expiresAt: string;
}

export interface RevokeTokenRequest {
  sessionToken: string;
}

export interface RevokeTokenResponse {
  revoked: boolean;
}

// ─── AuthApiClient (stub) ─────────────────────────────────────────────────────

export const AuthApiClient = {
  /**
   * [STUB] Request a registration challenge from the server.
   * Replace with: POST /v1/auth/register/challenge
   */
  async getRegisterChallenge(
    _request: RegisterChallengeRequest
  ): Promise<RegisterChallengeResponse> {
    // Stub: generate a local challenge — replace with real server call
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const challenge = Buffer.from(bytes).toString('base64url');
    return {
      challenge,
      rpId: 'dingpayments.app',
      userId: `user_${Date.now()}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  },

  /**
   * [STUB] Verify the registration credential with the server.
   * Replace with: POST /v1/auth/register/verify
   */
  async verifyRegistration(
    request: RegisterVerifyRequest
  ): Promise<RegisterVerifyResponse> {
    // Stub: return credential ID as placeholder public key
    return {
      publicKey: request.credential.credentialId,
      sessionToken: `stub_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  /**
   * [STUB] Request an authentication challenge from the server.
   * Replace with: POST /v1/auth/challenge
   */
  async getAuthChallenge(
    _request: AuthChallengeRequest
  ): Promise<AuthChallengeResponse> {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const challenge = Buffer.from(bytes).toString('base64url');
    return {
      challenge,
      rpId: 'dingpayments.app',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  },

  /**
   * [STUB] Verify the authentication assertion with the server.
   * Replace with: POST /v1/auth/verify
   */
  async verifyAuthentication(
    request: AuthVerifyRequest
  ): Promise<AuthVerifyResponse> {
    return {
      sessionToken: `stub_token_${Date.now()}`,
      publicKey: request.result.credentialId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  /**
   * [STUB] Revoke a session token on the server.
   * Replace with: POST /v1/auth/revoke
   */
  async revokeToken(_request: RevokeTokenRequest): Promise<RevokeTokenResponse> {
    return { revoked: true };
  },
};
