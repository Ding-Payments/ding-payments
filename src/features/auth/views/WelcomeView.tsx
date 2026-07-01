/**
 * CLI-015 — WelcomeView
 *
 * First-run onboarding entry point. Shown when no passkey is registered.
 * No seed phrases, no passwords — passkey-only UX.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function WelcomeView() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen scrollable>
      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.logoMark, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.logoText}>D</ThemedText>
          </View>
          <ThemedText type="title" style={styles.title}>
            Ding Payments
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Pagos seguros y rápidos con tecnología de llave de acceso.{'\n'}
            Sin contraseñas. Sin semillas. Solo tú.
          </ThemedText>
        </View>

        {/* Feature points */}
        <View style={styles.features}>
          <FeatureRow
            icon="🔑"
            title="Autenticación biométrica"
            description="Usa Face ID o huella digital para proteger tu billetera."
          />
          <FeatureRow
            icon="⚡"
            title="Pagos instantáneos"
            description="Envía y recibe pagos en la red Stellar en segundos."
          />
          <FeatureRow
            icon="🛡️"
            title="Sin contraseñas"
            description="Tu dispositivo es tu llave. Nada que recordar ni perder."
          />
        </View>

        {/* CTA */}
        <View style={styles.actions}>
          <Button
            label="Crear llave de acceso"
            onPress={() => router.push('/(onboarding)/create-passkey')}
            accessibilityLabel="Comenzar la configuración creando tu llave de acceso"
            accessibilityHint="Abre la pantalla para registrar tu llave de acceso biométrica"
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
            Al continuar, aceptas los términos de uso de Ding Payments.
          </ThemedText>
        </View>
      </View>
    </Screen>
  );
}

// ─── Sub-component ─────────────────────────────────────────────────────────────

interface FeatureRowProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <View style={styles.featureRow} accessibilityRole="text">
      <ThemedText style={styles.featureIcon} accessible={false}>
        {icon}
      </ThemedText>
      <View style={styles.featureText}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 40,
    paddingTop: 24,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    gap: 16,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIcon: {
    fontSize: 28,
    lineHeight: 32,
    width: 36,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  actions: {
    gap: 12,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
  },
});
