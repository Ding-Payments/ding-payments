/**
 * MVP analytics facade. No-op in production; console output in development only.
 *
 * Security policy — never log:
 * - private keys
 * - passkeys
 * - NFC payloads
 * - sensitive payment information
 */

export function trackEvent(eventName: string, payload?: Record<string, unknown>) {
  if (!__DEV__) {
    return;
  }

  if (payload) {
    console.log(`[analytics] ${eventName}`, payload);
    return;
  }

  console.log(`[analytics] ${eventName}`);
}

export function logError(category: string, error: unknown) {
  if (!__DEV__) {
    return;
  }

  console.error(`[analytics.error] ${category}`, error);
}
