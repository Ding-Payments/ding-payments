/**
 * Receive failure screen (CLI-068).
 *
 * @see docs/receive-flow.md — error matrix
 */
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useReceivePaymentContext } from '@/features/receive/hooks/useReceivePayment';

const ERROR_MESSAGES: Record<string, string> = {
  timeout: 'Payment timed out. Please try again.',
  nfc_error: 'NFC connection was lost.',
  trustline_missing: 'USDC trustline not found. Set up your USDC account first.',
};

const DEFAULT_MESSAGE = 'Payment failed. Please try again.';

export const ReceiveFailedView = () => {
  const router = useRouter();
  const { error, paymentRequest, reset } = useReceivePaymentContext();

  const message = (error && ERROR_MESSAGES[error]) ?? DEFAULT_MESSAGE;

  const handleTryAgain = () => {
    const amount = paymentRequest?.amount;
    const asset = paymentRequest?.asset;
    reset();
    router.replace({
      pathname: '/(tabs)/receive',
      params: amount && asset ? { amount, asset } : undefined,
    });
  };

  const handleChangeAmount = () => {
    reset();
    router.replace('/(tabs)/receive');
  };

  return (
    <Screen>
      <View style={styles.body}>
        <ThemedText type="title" themeColor="error">
          ✕
        </ThemedText>
        <ThemedText type="subtitle">Payment failed</ThemedText>
        <ThemedText themeColor="textSecondary">{message}</ThemedText>
      </View>

      <View style={styles.actions}>
        <Button label="Try Again" onPress={handleTryAgain} />
        <Button label="Change Amount" variant="secondary" onPress={handleChangeAmount} />
      </View>
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
  actions: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
});
