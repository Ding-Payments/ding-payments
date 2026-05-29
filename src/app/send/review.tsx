import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { PrimaryActionButton } from '@/components/primary-action-button';
import { SecondaryActionButton } from '@/components/secondary-action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { MOCK_BALANCE, MOCK_PAYMENT_REQUEST } from '@/mocks/payment';

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.rowValue}>
        {value}
      </ThemedText>
    </View>
  );
}

export default function SendReviewScreen() {
  const req = MOCK_PAYMENT_REQUEST;
  const balance = MOCK_BALANCE[req.asset];
  const hasBalance = parseFloat(balance) >= parseFloat(req.amount);

  function handleConfirm() {
    if (!hasBalance) {
      router.replace({ pathname: '/error', params: { type: 'insufficient_balance' } });
    } else {
      router.replace('/send/confirm');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ThemedText type="subtitle" style={styles.heading}>
          Review Payment
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText style={styles.amount}>
            {req.amount} {req.asset}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            to {req.recipient}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.details}>
          <ReviewRow label="Recipient" value={req.recipient} />
          <ReviewRow label="Address" value={req.recipientAddress} />
          <ReviewRow label="Asset" value={req.asset} />
          {req.memo ? <ReviewRow label="Memo" value={req.memo} /> : null}
          <ReviewRow label="Your balance" value={`${balance} ${req.asset}`} />
        </ThemedView>

        {!hasBalance && (
          <ThemedText type="small" style={styles.warning}>
            ⚠️ Insufficient balance
          </ThemedText>
        )}

        <View style={styles.actions}>
          <PrimaryActionButton
            label={hasBalance ? 'Confirm & Send' : 'Insufficient Balance'}
            onPress={handleConfirm}
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
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  amount: { fontSize: 40, fontWeight: '700' },
  details: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  rowValue: { fontWeight: '600' },
  warning: { color: '#f59e0b', textAlign: 'center' },
  actions: { gap: Spacing.two, marginTop: 'auto' },
});
