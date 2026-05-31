import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { FlowStatusCard } from '@/components/flow-status-card';
import { SecondaryActionButton } from '@/components/secondary-action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function SendWaitingScreen() {
  // Simulate receiving a payment request after 2.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/send/review');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ThemedText type="subtitle" style={styles.heading}>
          Send Payment
        </ThemedText>

        <FlowStatusCard
          status="waiting"
          title="Waiting for request…"
          description="Hold your device near the recipient's phone to receive their payment request."
        />

        <SecondaryActionButton label="Cancel" onPress={() => router.back()} />
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
  },
  heading: { textAlign: 'center', marginTop: Spacing.three },
});
