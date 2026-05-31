import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { FlowStatusCard } from '@/components/flow-status-card';
import { PrimaryActionButton } from '@/components/primary-action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { MOCK_PAYMENT_REQUEST } from '@/mocks/payment';

export default function ConfirmationScreen() {
  const req = MOCK_PAYMENT_REQUEST;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <FlowStatusCard
          status="success"
          title="Payment Sent!"
          description={`${req.amount} ${req.asset} sent to ${req.recipient}`}
        />

        <ThemedView type="backgroundElement" style={styles.summary}>
          <ThemedText type="small" themeColor="textSecondary">
            Transaction ID
          </ThemedText>
          <ThemedText type="small" style={styles.txId}>
            {req.id}
          </ThemedText>
        </ThemedView>

        <View style={styles.actions}>
          <PrimaryActionButton label="Done" onPress={() => router.replace('/')} />
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
  summary: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
    alignItems: 'center',
  },
  txId: { fontWeight: '600' },
  actions: { gap: Spacing.two },
});
