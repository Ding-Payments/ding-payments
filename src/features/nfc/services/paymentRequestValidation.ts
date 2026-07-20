import { assertNoSecrets } from '@/features/nfc/schemas/paymentRequest';

const DEDUPE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_SKEW_S = 30; // seconds tolerance

const dedupeCache: Map<string, number> = new Map();

export function validatePaymentRequest(payload: Record<string, any>, opts?: { nowMs?: number; skewS?: number }) {
  assertNoSecrets(payload);
  const nowMs = opts?.nowMs ?? Date.now();
  const skewS = opts?.skewS ?? DEFAULT_SKEW_S;

  const expiresAt = typeof payload.expiresAt === 'number' ? payload.expiresAt : undefined;
  if (typeof expiresAt === 'number') {
    const expiresMs = expiresAt * 1000;
    if (nowMs - skewS * 1000 > expiresMs) {
      throw new Error('EXPIRED');
    }
  }

  const dedupeKey = payload.id ?? JSON.stringify(payload);
  const seenAt = dedupeCache.get(dedupeKey);
  if (seenAt && nowMs - seenAt < DEDUPE_TTL_MS) {
    throw new Error('DUPLICATE');
  }

  // record
  dedupeCache.set(dedupeKey, nowMs);

  // cleanup pass
  for (const [k, v] of dedupeCache.entries()) {
    if (nowMs - v > DEDUPE_TTL_MS * 2) dedupeCache.delete(k);
  }

  return true;
}

export function clearDedupeCache() {
  dedupeCache.clear();
}

export default validatePaymentRequest;
