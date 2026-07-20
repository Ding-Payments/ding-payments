/**
 * Waiting for the payer's on-chain payment to settle (CLI-066).
 *
 * NOTE: balance-delta polling is out of scope for the MVP — this screen only
 * tracks elapsed time and times out after 60 seconds. A future iteration can
 * poll wallet balance every few seconds and resolve early via confirmSuccess()
 * once the expected delta is observed.
 *
 * @see docs/receive-flow.md
 */
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Button, LoadingSpinner, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useReceivePaymentContext } from '@/features/receive/hooks/useReceivePayment';
import { receiveSession } from '@/features/receive/services/receiveSession';

const WAIT_TIMEOUT_MS = 60_000;

export const WaitingForPaymentView = () => {
  const router = useRouter();
  const { state, cancel, confirmFailure } = useReceivePaymentContext();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timeoutStartedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeoutStartedRef.current) {
      return;
    }
    timeoutStartedRef.current = true;

    const cancelTimeout = receiveSession.startWaitTimeout(WAIT_TIMEOUT_MS, () => {
      confirmFailure('timeout');
    });

    return cancelTimeout;
  }, [confirmFailure]);

  useEffect(() => {
    if (state === 'success') {
      router.replace('/receive/success');
    } else if (state === 'failed') {
      router.replace('/receive/failed');
    } else if (state === 'cancelled') {
      router.replace('/(tabs)/receive');
    }
  }, [state, router]);

  const handleCancel = async () => {
    await cancel();
    router.replace('/(tabs)/receive');
  };

  return (
    <Screen>
      <ThemedText type="subtitle">Waiting for payment…</ThemedText>

      <View style={styles.body}>
        <LoadingSpinner />
        <ThemedText themeColor="textSecondary">{elapsedSeconds}s elapsed</ThemedText>
      </View>

      <Button label="Cancel" variant="secondary" onPress={handleCancel} style={styles.cancel} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  cancel: {
    marginBottom: Spacing.four,
  },
});
