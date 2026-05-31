import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

type Props = PressableProps & { label: string };

export function SecondaryActionButton({ label, style, ...props }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.backgroundSelected },
        pressed && styles.pressed,
        style as object,
      ]}
      accessibilityRole="button"
      {...props}>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  label: { fontWeight: '600', fontSize: 16 },
});
