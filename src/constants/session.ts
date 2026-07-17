/**
 * Session policy constants — CLI-026
 *
 * Controls inactivity lock and background lock windows.
 * NFC-active lock exemption is coordinated via nfcSessionStore.nfcActive (CLI-052).
 */

export const SESSION = {
  /** Lock after 15 minutes of foreground idle. */
  IDLE_LOCK_MS: 15 * 60 * 1000,

  /** Lock after 5 minutes in background. */
  BACKGROUND_LOCK_MS: 5 * 60 * 1000,

  /** Skip re-auth if background was shorter than 30 seconds. */
  BACKGROUND_GRACE_MS: 30 * 1000,

  RP_ID: 'dingpayments.app',
  RP_NAME: 'Ding Payments',
} as const;

/** @deprecated Use SESSION.BACKGROUND_LOCK_MS */
export const BACKGROUND_LOCK_MS = SESSION.BACKGROUND_LOCK_MS;

/** @deprecated Use SESSION.IDLE_LOCK_MS */
export const FOREGROUND_IDLE_LOCK_MS = SESSION.IDLE_LOCK_MS;
