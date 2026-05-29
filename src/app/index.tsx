import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

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

        {/* Primary CTAs */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/send')}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionText, { color: theme.primaryForeground }]}>Send Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => router.push('/receive')}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionText, { color: theme.text }]}>Receive Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          
          <View style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityName, { color: theme.text }]}>Coffee Shop</Text>
                <Text style={[styles.activityDate, { color: theme.textSecondary }]}>Today, 9:41 AM</Text>
              </View>
              <Text style={[styles.activityAmount, { color: theme.text }]}>-$4.50</Text>
            </View>

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
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 13,
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
