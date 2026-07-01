/**
 * LockedView
 *
 * Shown when the session is locked due to inactivity or backgrounding.
 * Prompts the user to re-authenticate with their passkey.
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '../hooks/useAuth';

export function LockedView() {
  const router = useRouter();
  const theme = useTheme();
  const { unlockWithPasskey, logout, state } = useAuth();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = useCallback(async () => {
    setIsUnlocking(true);
    const success = await unlockWithPasskey();
    setIsUnlocking(false);

    if (success) {
      router.replace('/(tabs)/receive');
    }
  }, [unlockWithPasskey, router]);

  return (
    <Screen>
      <View style={styles.container}>
        {/* Lock icon */}
        <View style={[styles.lockIcon, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText style={styles.lockEmoji} accessible={false}>
            🔒
          </ThemedText>
        </View>

        <View style={styles.textGroup}>
          <ThemedText type="subtitle" style={styles.title}>
            Sesión bloqueada
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Tu sesión fue bloqueada por seguridad. Verifica tu identidad para continuar.
          </ThemedText>
        </View>

        {/* Error feedback */}
        {state.lastError && (
          <View style={[styles.errorCard, { backgroundColor: theme.error + '20' }]}>
            <ThemedText type="small" style={{ color: theme.error }}>
              {state.lastError}
            </ThemedText>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            label={isUnlocking ? 'Verificando…' : 'Desbloquear con llave de acceso'}
            onPress={handleUnlock}
            loading={isUnlocking}
            accessibilityLabel="Desbloquear sesión con llave de acceso biométrica"
          />
          <Button
            label="Cerrar sesión"
            variant="secondary"
            onPress={logout}
            disabled={isUnlocking}
            accessibilityLabel="Cerrar sesión y volver al inicio"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 8,
  },
  lockIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockEmoji: {
    fontSize: 48,
  },
  textGroup: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  errorCard: {
    borderRadius: 12,
    padding: 14,
    alignSelf: 'stretch',
  },
  actions: {
    gap: 12,
    alignSelf: 'stretch',
  },
});
