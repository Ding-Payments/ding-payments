import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface FundWalletViewProps {
  publicKey: string;
  onCheckFunding: () => void;
  isChecking: boolean;
}

export function FundWalletView({ publicKey, onCheckFunding, isChecking }: FundWalletViewProps) {
  const theme = useTheme();

  return (
    <Screen scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Agrega fondos para activar tu billetera</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            Tu billetera fue creada pero todavía no existe en la red. Envía XLM a esta dirección
            para activarla.
          </ThemedText>
        </View>

        <View style={[styles.addressCard, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Dirección de tu billetera
          </ThemedText>
          <ThemedText type="code" selectable style={styles.addressValue}>
            {publicKey}
          </ThemedText>
        </View>

        <Button
          label={isChecking ? 'Verificando…' : 'Ya envié fondos, verificar'}
          onPress={onCheckFunding}
          loading={isChecking}
          accessibilityLabel="Verificar si la billetera ya recibió fondos"
          accessibilityHint="Consulta la red Stellar para confirmar si la cuenta ya está activa"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    gap: 12,
  },
  description: {
    lineHeight: 24,
  },
  addressCard: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  addressValue: {
    lineHeight: 20,
  },
});
