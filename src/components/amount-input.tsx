import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';
import { PaymentAsset } from '@/mocks/payment';

type Props = TextInputProps & {
  asset: PaymentAsset;
  onAssetPress?: () => void;
};

export function AmountInput({ asset, style, ...props }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <TextInput
        style={[styles.input, { color: theme.text }]}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel="Payment amount"
        {...props}
      />
      <ThemedText style={styles.asset}>{asset}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 36,
    fontWeight: '600',
    minHeight: 52,
  },
  asset: {
    fontSize: 20,
    fontWeight: '600',
  },
});
