import { router } from 'expo-router';
import * as Device from 'expo-device';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius } from '@/constants/theme';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { PrimaryActionButton } from '@/components/primary-action-button';
import { SecondaryActionButton } from '@/components/secondary-action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.brand, { color: theme.text }]}>Ding</Text>
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Total Balance</Text>
            <Text style={[styles.balanceAmount, { color: theme.text }]}>$1,240.50</Text>
          </View>
        </View>

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Ding Payments
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Tap-to-pay on Stellar
          </ThemedText>
        </ThemedView>

        <View style={styles.payActions}>
          <PrimaryActionButton
            label="Send"
            onPress={() => router.push('/send')}
            style={styles.payButton}
          />
          <SecondaryActionButton
            label="Receive"
            onPress={() => router.push('/receive')}
            style={styles.payButton}
          />
        </View>

        <ThemedText type="code" style={styles.code}>
          dev tools
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow title="Dev menu" hint={getDevMenuHint()} />
          <HintRow
            title="NFC Research"
            hint={<ThemedText type="code">src/app/nfc-research.tsx</ThemedText>}
          />
        </ThemedView>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityName, { color: theme.text }]}>Alice Smith</Text>
                <Text style={[styles.activityDate, { color: theme.textSecondary }]}>Yesterday</Text>
              </View>
              <Text style={[styles.activityAmountPositive, { color: theme.primary }]}>+$25.00</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  header: {
    marginBottom: Spacing.five,
  },
  brand: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.four,
  },
  balanceContainer: {
    marginTop: Spacing.two,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: Spacing.half,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activitySection: {
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.three,
  },
  activityCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  activityInfo: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  subtitle: {
    textAlign: 'center',
  },
  payActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  payButton: {
    flex: 1,
  },
  code: {
    textTransform: 'uppercase',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityAmountPositive: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.three,
  },
});
