import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';

type Props = PressableProps & { label: string };

export function PrimaryActionButton({ label, style, ...props }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style as object]}
      accessibilityRole="button"
      {...props}>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
  label: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
