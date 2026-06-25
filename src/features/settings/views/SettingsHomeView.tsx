import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui';

export const SettingsHomeView = () => (
  <Screen>
    <ThemedText type="subtitle">Settings</ThemedText>
    <ThemedText themeColor="textSecondary">Manage app preferences and account options.</ThemedText>
  </Screen>
);
