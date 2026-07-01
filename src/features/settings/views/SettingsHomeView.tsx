import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui';
import { SettingsAuthSection } from '@/features/auth/components/SettingsAuthSection';

export const SettingsHomeView = () => (
  <Screen scrollable>
    <View style={styles.container}>
      <ThemedText type="subtitle">Ajustes</ThemedText>
      <ThemedText themeColor="textSecondary">
        Administra las preferencias de la app y las opciones de cuenta.
      </ThemedText>
      <SettingsAuthSection />
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
