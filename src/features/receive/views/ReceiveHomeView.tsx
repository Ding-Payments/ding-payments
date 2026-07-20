import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui';
import { AnalyticsEvents } from '@/constants/analytics-events';
import { trackEvent } from '@/lib/analytics';
import { AssetSelector } from '@/features/wallet/components/AssetSelector';
import type { SupportedAssetCode } from '@/features/wallet/constants/assets';

export const ReceiveHomeView = () => {
  const [asset, setAsset] = useState<SupportedAssetCode>('XLM');

  useEffect(() => {
    trackEvent(AnalyticsEvents.RECEIVE_OPENED);
  }, []);

  return (
    <Screen>
      <ThemedText type="subtitle">Receive</ThemedText>
      <ThemedText themeColor="textSecondary">Accept contactless payment requests here.</ThemedText>
      <AssetSelector value={asset} onChange={setAsset} style={styles.selector} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  selector: {
    marginTop: 16,
  },
});
