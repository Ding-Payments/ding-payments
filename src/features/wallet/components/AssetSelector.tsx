import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  STELLAR_ASSETS,
  SUPPORTED_ASSET_CODES,
  type SupportedAssetCode,
} from '@/features/wallet/constants/assets';

const MIN_TOUCH_TARGET = 44;

export interface AssetSelectorProps {
  value: SupportedAssetCode;
  onChange: (code: SupportedAssetCode) => void;
  options?: readonly SupportedAssetCode[];
  style?: StyleProp<ViewStyle>;
}

export function AssetSelector({
  value,
  onChange,
  options = SUPPORTED_ASSET_CODES,
  style,
}: AssetSelectorProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.container, { backgroundColor: theme.backgroundElement }, style]}
    >
      {options.map((code) => {
        const asset = STELLAR_ASSETS[code];
        const selected = code === value;

        return (
          <Pressable
            key={code}
            onPress={() => onChange(code)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={asset.displayName}
            style={[styles.option, selected && { backgroundColor: theme.background }]}
          >
            <ThemedText type="smallBold" style={selected ? { color: theme.primary } : undefined}>
              {asset.code}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  option: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
  },
});
