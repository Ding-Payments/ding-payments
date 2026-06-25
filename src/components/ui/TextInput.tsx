import {
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextInputProps = RNTextInputProps;

const MIN_TOUCH_TARGET = 44;

export const TextInput = ({ style, placeholderTextColor, ...props }: TextInputProps) => {
  const theme = useTheme();

  return (
    <RNTextInput
      accessibilityRole="text"
      placeholderTextColor={placeholderTextColor ?? theme.textSecondary}
      style={[
        styles.input,
        {
          backgroundColor: theme.surface,
          borderColor: theme.backgroundSelected,
          color: theme.text,
        },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    fontSize: 16,
    fontFamily: Fonts?.sans,
  },
});
