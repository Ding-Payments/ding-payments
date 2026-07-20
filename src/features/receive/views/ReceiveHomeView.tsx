/**
 * Receive amount entry (CLI-061).
 *
 * @see docs/receive-flow.md
 */
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Button, Screen, TextInput } from '@/components/ui';
import { AnalyticsEvents } from '@/constants/analytics-events';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { receiveAmountSchema } from '@/features/receive/schemas/receiveAmount';
import { useReceivePaymentContext } from '@/features/receive/hooks/useReceivePayment';
import {
  isSupportedAssetCode,
  SUPPORTED_ASSET_CODES,
  type SupportedAssetCode,
} from '@/features/wallet/constants/assets';
import { useTheme } from '@/hooks/use-theme';
import { trackEvent } from '@/lib/analytics';

export const ReceiveHomeView = () => {
  const theme = useTheme();
  const router = useRouter();
  const { state: authState } = useAuth();
  const { prepare } = useReceivePaymentContext();

  // "Try Again" (CLI-068) forwards the previous amount/asset via route params
  // so the receiver doesn't have to retype them after a failure.
  const params = useLocalSearchParams<{ amount?: string; asset?: string }>();
  const initialAsset: SupportedAssetCode =
    typeof params.asset === 'string' && isSupportedAssetCode(params.asset) ? params.asset : 'XLM';

  const [amount, setAmount] = useState(typeof params.amount === 'string' ? params.amount : '');
  const [asset, setAsset] = useState<SupportedAssetCode>(initialAsset);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackEvent(AnalyticsEvents.RECEIVE_OPENED);
  }, []);

  const validation = useMemo(
    () => receiveAmountSchema.safeParse({ amount, asset }),
    [amount, asset]
  );

  const inlineError =
    amount.length > 0 && !validation.success ? validation.error.issues[0]?.message : undefined;

  const canSubmit = validation.success && !submitting && Boolean(authState.publicKey);

  const handleSubmit = async () => {
    if (!validation.success || !authState.publicKey) {
      return;
    }

    setSubmitting(true);
    try {
      await prepare(validation.data.amount, validation.data.asset, authState.publicKey);
      router.push('/receive/listening');
    } catch {
      router.push('/receive/failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scrollable>
      <ThemedText type="subtitle">Receive</ThemedText>
      <ThemedText themeColor="textSecondary">
        Enter an amount and hold your phone near the payer to broadcast a request.
      </ThemedText>

      <View style={styles.field}>
        <ThemedText type="smallBold">Amount</ThemedText>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          accessibilityLabel="Amount to receive"
        />
        {inlineError ? (
          <ThemedText themeColor="error" type="small">
            {inlineError}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Asset</ThemedText>
        <View style={styles.assetRow}>
          {SUPPORTED_ASSET_CODES.map((code) => {
            const selected = code === asset;
            return (
              <Pressable
                key={code}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setAsset(code)}
                style={[
                  styles.assetPill,
                  {
                    backgroundColor: selected ? theme.primary : theme.backgroundElement,
                    borderColor: selected ? theme.primary : theme.backgroundSelected,
                  },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={selected ? styles.assetPillLabelSelected : undefined}
                >
                  {code}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        label="Start Receiving"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={submitting}
        style={styles.submit}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  field: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  assetRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  assetPill: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  assetPillLabelSelected: {
    color: '#FFFFFF',
  },
  submit: {
    marginTop: Spacing.five,
  },
});
