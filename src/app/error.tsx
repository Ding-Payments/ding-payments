import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { FlowStatusCard } from '@/components/flow-status-card';
import { PrimaryActionButton } from '@/components/primary-action-button';
import { SecondaryActionButton } from '@/components/secondary-action-button';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { ERROR_MESSAGES, ErrorType } from '@/mocks/payment';

export default function ErrorScreen() {
  const { type } = useLocalSearchParams<{ type: ErrorType }>();
  const errorType: ErrorType = type ?? 'timeout';
  const { title, description } = ERROR_MESSAGES[errorType];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <FlowStatusCard status="error" title={title} description={description} />

        <View style={styles.actions}>
          {errorType !== 'nfc_unavailable' && (
            <PrimaryActionButton label="Try Again" onPress={() => router.back()} />
          )}
          <SecondaryActionButton label="Go Home" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    justifyContent: 'center',
  },
  actions: { gap: Spacing.two },
});
