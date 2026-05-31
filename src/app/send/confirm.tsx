import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { FlowStatusCard } from '@/components/flow-status-card';
import { PrimaryActionButton } from '@/components/primary-action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

type Stage = 'passkey' | 'submitting';

export default function SendConfirmScreen() {
  const [stage, setStage] = useState<Stage>('passkey');

  function handlePasskey() {
    setStage('submitting');
  }

  useEffect(() => {
    if (stage !== 'submitting') return;
    const timer = setTimeout(() => {
      router.replace('/confirmation');
    }, 1800);
    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ThemedText type="subtitle" style={styles.heading}>
          Authorize Payment
        </ThemedText>

        {stage === 'passkey' ? (
          <>
            <FlowStatusCard
              status="ready"
              title="Authenticate to send"
              description="Use Face ID / Touch ID to sign and broadcast the transaction."
            />
            <PrimaryActionButton label="Authenticate with Passkey" onPress={handlePasskey} />
          </>
        ) : (
          <FlowStatusCard
            status="waiting"
            title="Submitting…"
            description="Broadcasting transaction to the Stellar network."
          />
        )}
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
