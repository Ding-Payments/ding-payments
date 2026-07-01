/**
 * CLI-025 — authApi schemas
 *
 * Runtime validation helpers for auth API responses.
 * Uses manual validation (no Zod dependency) to keep the bundle lean.
 * Replace with Zod schemas if/when that dependency is added.
 */

import type {
  AuthChallengeResponse,
  AuthVerifyResponse,
  RegisterChallengeResponse,
  RegisterVerifyResponse,
} from '../services/AuthApiClient';

// ─── Type guards ──────────────────────────────────────────────────────────────

function isString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function hasStringKeys(obj: unknown, keys: string[]): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return keys.every((k) => isString((obj as Record<string, unknown>)[k]));
}

// ─── Validators ───────────────────────────────────────────────────────────────

export function validateRegisterChallengeResponse(
  data: unknown
): data is RegisterChallengeResponse {
  return hasStringKeys(data, ['challenge', 'rpId', 'userId', 'expiresAt']);
}

export function validateRegisterVerifyResponse(
  data: unknown
): data is RegisterVerifyResponse {
  return hasStringKeys(data, ['publicKey', 'sessionToken', 'expiresAt']);
}

export function validateAuthChallengeResponse(
  data: unknown
): data is AuthChallengeResponse {
  return hasStringKeys(data, ['challenge', 'rpId', 'expiresAt']);
}

export function validateAuthVerifyResponse(
  data: unknown
): data is AuthVerifyResponse {
  return hasStringKeys(data, ['sessionToken', 'publicKey', 'expiresAt']);
}
