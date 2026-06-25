import { useEffect } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui';
import { AnalyticsEvents } from '@/constants/analytics-events';
import { trackEvent } from '@/lib/analytics';

export const ReceiveHomeView = () => {
  useEffect(() => {
    trackEvent(AnalyticsEvents.RECEIVE_OPENED);
  }, []);

  return (
    <Screen>
      <ThemedText type="subtitle">Receive</ThemedText>
      <ThemedText themeColor="textSecondary">Accept contactless payment requests here.</ThemedText>
    </Screen>
  );
};
