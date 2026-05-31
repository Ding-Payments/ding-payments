import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Status = 'waiting' | 'success' | 'error' | 'ready';

type Props = {
  status: Status;
  title: string;
  description?: string;
};

const STATUS_ICON: Record<Status, string> = {
  waiting: '📡',
  ready: '📲',
  success: '✅',
  error: '❌',
};

export function FlowStatusCard({ status, title, description }: Props) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSelected }]}>
        {status === 'waiting' ? (
          <ActivityIndicator size="large" color="#3c87f7" />
        ) : (
          <ThemedText style={styles.icon}>{STATUS_ICON[status]}</ThemedText>
        )}
      </View>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
          {description}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 36 },
  title: { textAlign: 'center' },
  description: { textAlign: 'center' },
});
