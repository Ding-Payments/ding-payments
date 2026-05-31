import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { AmountInput } from '@/components/amount-input';
import { PrimaryActionButton } from '@/components/primary-action-button';
import { SecondaryActionButton } from '@/components/secondary-action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { PaymentAsset } from '@/mocks/payment';

export default function ReceiveScreen() {
  const [amount, setAmount] = useState('');
  const [asset] = useState<PaymentAsset>('USDC');

  function handleNext() {
    if (!amount || parseFloat(amount) <= 0) return;
    router.push('/receive/ready');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ThemedText type="subtitle" style={styles.heading}>
          Request Payment
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
          Enter the amount you want to receive
        </ThemedText>

        <AmountInput
          asset={asset}
          value={amount}
          onChangeText={setAmount}
          autoFocus
        />

        <View style={styles.actions}>
          <PrimaryActionButton
            label="Next"
            onPress={handleNext}
            disabled={!amount || parseFloat(amount) <= 0}
          />
          <SecondaryActionButton label="Cancel" onPress={() => router.back()} />
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
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  heading: { textAlign: 'center', marginTop: Spacing.three },
  label: { textAlign: 'center' },
  actions: { gap: Spacing.two, marginTop: 'auto' },
});
