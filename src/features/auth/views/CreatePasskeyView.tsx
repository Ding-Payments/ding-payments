/**
 * CLI-016 — CreatePasskeyView
 *
 * Passkey registration screen shown during onboarding.
 * Handles loading, success, and cancellation states cleanly.
 * No seed phrases or private keys involved.
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '../hooks/useAuth';
import { PasskeyService } from '../services/PasskeyService';

type ViewState = 'idle' | 'loading' | 'success' | 'error';

export function CreatePasskeyView() {
  const router = useRouter();
  const theme = useTheme();
  const { registerPasskey, state } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supportInfo = PasskeyService.getSupportInfo();

  const handleCreatePasskey = useCallback(async () => {
    setViewState('loading');
    setErrorMessage(null);

    const displayName = 'Usuario Ding';
    const success = await registerPasskey(displayName);

    if (success) {
      setViewState('success');
      setTimeout(() => {
        router.replace('/(onboarding)/wallet-setup');
      }, 1200);
    } else {
      setErrorMessage(
        state.lastError ?? 'No se pudo crear la llave de acceso. Inténtalo de nuevo.'
      );
      setViewState('error');
    }
  }, [registerPasskey, router, state.lastError]);

  const handleRetry = useCallback(() => {
    setViewState('idle');
    setErrorMessage(null);
  }, []);

  return (
    <Screen scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle">Crear llave de acceso</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            Tu llave de acceso se almacena de forma segura en este dispositivo. Se usará para
            proteger tu billetera y confirmar pagos.
          </ThemedText>
        </View>

        {/* Info rows */}
        <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement }]}>
          <InfoRow icon="🔒" text="Cifrada en el chip de seguridad de tu dispositivo" />
          <InfoRow icon="👆" text="Autenticada con Face ID o huella digital" />
          <InfoRow icon="🚫" text="Sin contraseñas que recordar o perder" />
          <InfoRow icon="📵" text="No se conecta a servidores externos durante el registro" />
        </View>

        {/* Unsupported device warning */}
        {!supportInfo.isSupported && (
          <View style={[styles.warningCard, { backgroundColor: theme.error + '20' }]}>
            <ThemedText type="small" style={{ color: theme.error }}>
              Las llaves de acceso no están disponibles en este entorno. Usa un dispositivo físico
              con una compilación de desarrollo para completar el registro.
            </ThemedText>
          </View>
        )}

        {/* Success state */}
        {viewState === 'success' && (
          <View style={[styles.successCard, { backgroundColor: theme.success + '20' }]}>
            <ThemedText type="smallBold" style={{ color: theme.success }}>
              ✓ Llave de acceso creada exitosamente
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Redirigiendo a tu billetera…
            </ThemedText>
          </View>
        )}

        {/* Error state */}
        {viewState === 'error' && errorMessage && (
          <View style={[styles.errorCard, { backgroundColor: theme.error + '20' }]}>
            <ThemedText type="small" style={{ color: theme.error }}>
              {errorMessage}
            </ThemedText>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {viewState !== 'success' && (
            <>
              <Button
                label={
                  viewState === 'loading'
                    ? 'Registrando llave de acceso…'
                    : viewState === 'error'
                      ? 'Intentar de nuevo'
                      : 'Crear llave de acceso'
                }
                onPress={viewState === 'error' ? handleRetry : handleCreatePasskey}
                loading={viewState === 'loading'}
                disabled={!supportInfo.isSupported || viewState === 'loading'}
                accessibilityLabel="Crear llave de acceso con biometría"
                accessibilityHint="Activará Face ID o huella digital para registrar tu llave de acceso"
              />
              <Button
                label="Volver"
                variant="secondary"
                onPress={() => router.back()}
                disabled={viewState === 'loading'}
                accessibilityLabel="Volver a la pantalla anterior"
              />
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}

// ─── Sub-component ─────────────────────────────────────────────────────────────

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.infoRow} accessibilityRole="text">
      <ThemedText style={styles.infoIcon} accessible={false}>
        {icon}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.infoText}>
        {text}
      </ThemedText>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

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
  infoCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    fontSize: 18,
    lineHeight: 22,
    width: 24,
    textAlign: 'center',
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  warningCard: {
    borderRadius: 12,
    padding: 14,
  },
  successCard: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  errorCard: {
    borderRadius: 12,
    padding: 14,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
