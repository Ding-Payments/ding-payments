export const AnalyticsEvents = {
  APP_OPEN: 'app_open',
  RECEIVE_OPENED: 'receive_opened',
  SEND_OPENED: 'send_opened',
  HISTORY_OPENED: 'history_opened',
  SETTINGS_OPENED: 'settings_opened',

  // Receive funnel (CLI-071) — see docs/receive-flow.md
  RECEIVE_STARTED: 'receive_started',
  RECEIVE_BROADCAST: 'receive_broadcast',
  RECEIVE_WAITING: 'receive_waiting',
  RECEIVE_COMPLETED: 'receive_completed',
  RECEIVE_FAILED: 'receive_failed',
  RECEIVE_CANCELLED: 'receive_cancelled',
  NFC_READ_SUCCESS: 'nfc_read_success',
  NFC_READ_FAILURE: 'nfc_read_failure',
  NFC_WRITE_SUCCESS: 'nfc_write_success',
  NFC_WRITE_FAILURE: 'nfc_write_failure',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/**
 * Amount bucket used in receive funnel events instead of raw amounts.
 * Never log a raw amount, public key, or other PII in an analytics payload.
 */
export type AmountBucket = '<1' | '1-10' | '10-100' | '>100';

/** Allowed properties for receive funnel events. No pubkeys, no raw amounts, no PII. */
export interface ReceiveEventProperties {
  amount_bucket: AmountBucket;
  asset: string;
  reason?: string;
  duration_ms?: number;
}
