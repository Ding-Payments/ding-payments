export const AnalyticsEvents = {
  APP_OPEN: 'app_open',
  RECEIVE_OPENED: 'receive_opened',
  SEND_OPENED: 'send_opened',
  HISTORY_OPENED: 'history_opened',
  SETTINGS_OPENED: 'settings_opened',
  NFC_READ_SUCCESS: 'nfc_read_success',
  NFC_READ_FAILURE: 'nfc_read_failure',
  NFC_WRITE_SUCCESS: 'nfc_write_success',
  NFC_WRITE_FAILURE: 'nfc_write_failure',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
