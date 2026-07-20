/**
 * NFC broadcast screen (CLI-064) — starts writing the payment request on
 * mount and shows a countdown until the request expires.
 *
 * @see docs/receive-flow.md
 */
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useReceivePaymentContext } from '@/features/receive/hooks/useReceivePayment';

const NFC_STATUS_LABELS: Record<string, string> = {
  idle: 'Preparing…',
  writing: 'Hold your phone near the payer…',
  success: 'Request delivered',
  error: 'NFC connection lost',
  scanning: 'Preparing…',
};

function formatCountdown(secondsRemaining: number): string {
  const clamped = Math.max(0, secondsRemaining);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const ReceiveListeningView = () => {
  const router = useRouter();
  const { state, paymentRequest, nfcStatus, startBroadcast, cancel, confirmFailure } =
    useReceivePaymentContext();

  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    void startBroadcast();
  }, [startBroadcast]);

  useEffect(() => {
    if (!paymentRequest) {
      return;
    }

    const tick = () => {
      setSecondsRemaining(Math.max(0, paymentRequest.expiresAt - Math.floor(Date.now() / 1000)));
    };

    tick();
    const interval = setInterval(tick, 1_000);
    return () => clearInterval(interval);
  }, [paymentRequest]);

  useEffect(() => {
    if (state === 'waiting') {
      router.replace('/receive/waiting');
    }
  }, [state, router]);

  useEffect(() => {
    if (nfcStatus === 'error') {
      confirmFailure('nfc_error');
    }
  }, [nfcStatus, confirmFailure]);

  useEffect(() => {
    if (state === 'failed') {
      router.replace('/receive/failed');
    }
  }, [state, router]);

  const handleCancel = async () => {
    await cancel();
    router.replace('/(tabs)/receive');
  };

  return (
    <Screen>
      <ThemedText type="subtitle">Waiting to connect</ThemedText>

      <View style={styles.body}>
        <ThemedText type="title">{formatCountdown(secondsRemaining)}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {NFC_STATUS_LABELS[nfcStatus] ?? 'Preparing…'}
        </ThemedText>
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
    gap: Spacing.two,
  },
  cancel: {
    marginBottom: Spacing.four,
  },
});
