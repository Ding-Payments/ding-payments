import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui';
import { AssetSelector } from '@/features/wallet/components/AssetSelector';
import type { SupportedAssetCode } from '@/features/wallet/constants/assets';

export const SendHomeView = () => {
  const [asset, setAsset] = useState<SupportedAssetCode>('XLM');

  return (
    <Screen>
      <ThemedText type="subtitle">Send</ThemedText>
      <ThemedText themeColor="textSecondary">Send payments to contacts and merchants.</ThemedText>
      <AssetSelector value={asset} onChange={setAsset} style={styles.selector} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  selector: {
    marginTop: 16,
  },
});
