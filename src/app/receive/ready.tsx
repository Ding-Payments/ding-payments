import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { FlowStatusCard } from '@/components/flow-status-card';
import { SecondaryActionButton } from '@/components/secondary-action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function ReceiveReadyScreen() {
  // Simulate sender tapping after 3s
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/confirmation');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ThemedText type="subtitle" style={styles.heading}>
          Ready to Receive
        </ThemedText>

        <FlowStatusCard
          status="ready"
          title="Hold near sender's phone"
          description="Keep your device close until the payment is confirmed."
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
