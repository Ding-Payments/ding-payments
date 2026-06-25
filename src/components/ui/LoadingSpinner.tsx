import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type LoadingSpinnerProps = {
  size?: 'small' | 'large';
  style?: StyleProp<ViewStyle>;
};

const MIN_TOUCH_TARGET = 44;

export const LoadingSpinner = ({ size = 'large', style }: LoadingSpinnerProps) => {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[styles.container, style]}>
      <ActivityIndicator color={theme.primary} size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
  },
});
