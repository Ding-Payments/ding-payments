/**
 * Session policy constants — CLI-026
 *
 * Controls inactivity lock and background lock windows.
 * NFC-active lock exemption hook point is present for future coordination
 * via nfcActive flag in the session policy hook.
 */

export const SESSION = {
  /**
   * Lock after this many milliseconds of inactivity (no user interaction).
   * 15 minutes.
   */
  IDLE_LOCK_MS: 15 * 60 * 1000,

  /**
   * Lock after the app has been backgrounded for this long.
   * 5 minutes.
   */
  BACKGROUND_LOCK_MS: 5 * 60 * 1000,

  /**
   * Grace period before full lock — app was backgrounded less than this,
   * so we can skip the re-auth prompt. 30 seconds.
   */
  BACKGROUND_GRACE_MS: 30 * 1000,

  /**
   * Relying party ID used for all passkey operations.
   * Must match the app's associated domain / asset links.
   * Placeholder — replace with production domain in app.config.ts.
   */
  RP_ID: 'dingpayments.app',

  /**
   * Human-readable relying party name shown in passkey dialogs.
   */
  RP_NAME: 'Ding Payments',
} as const;
