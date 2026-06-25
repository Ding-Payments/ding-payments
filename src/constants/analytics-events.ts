export const AnalyticsEvents = {
  APP_OPEN: 'app_open',
  RECEIVE_OPENED: 'receive_opened',
  SEND_OPENED: 'send_opened',
  HISTORY_OPENED: 'history_opened',
  SETTINGS_OPENED: 'settings_opened',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
