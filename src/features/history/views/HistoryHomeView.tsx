import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui';

export const HistoryHomeView = () => (
  <Screen>
    <ThemedText type="subtitle">History</ThemedText>
    <ThemedText themeColor="textSecondary">Review past transactions and payment activity.</ThemedText>
  </Screen>
);
