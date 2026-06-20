import { Link } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { initializeNfcSpike, readNdefJsonPayload, writeNdefJsonPayload } from '@/features/nfc/services/nfc-spike';
import { authenticateWithPasskey, createPasskeyCredential, initializePasskeySpike } from '@/features/auth/services/passkey-spike';
import { runStellarSpike } from '@/features/wallet/services/stellar-spike';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

function ActionButton({ label, onPress }: { label: string; onPress: () => Promise<void> }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

export default function C05Screen() {
  const [logs, setLogs] = useState<string[]>([]);

  const appendLog = (message: string) => {
    setLogs((current) => [message, ...current].slice(0, 12));
  };

  const runPasskeyInit = async () => {
    const result = await initializePasskeySpike();
    appendLog(`Passkey init: ${result.details}`);
  };

  const runPasskeyCreate = async () => {
    const result = await createPasskeyCredential();
    appendLog(result.success ? `Passkey created: ${result.credential.id}` : `Passkey create failed: ${result.reason}`);
  };

  const runPasskeyAuth = async () => {
    const result = await authenticateWithPasskey();
    appendLog(result.success ? 'Passkey authenticate: success' : `Passkey authenticate failed: ${result.reason}`);
  };

  const runStellar = async () => {
    const result = await runStellarSpike();
    appendLog(result.success ? `Stellar OK: ${result.publicKey}` : `Stellar failed: ${result.reason}`);
  };

  const runNfcInit = async () => {
    const result = await initializeNfcSpike();
    appendLog(`NFC init: ${result.details}`);
  };

  const runNfcWrite = async () => {
    const result = await writeNdefJsonPayload({ type: 'payment-request.v1', timestamp: new Date().toISOString(), amount: '0.01', asset: 'XLM' });
    appendLog(result.success ? result.message : `NFC write failed: ${result.reason}`);
  };

  const runNfcRead = async () => {
    const result = await readNdefJsonPayload();
    appendLog(result.success ? result.message : `NFC read failed: ${result.reason}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">C05 Spike PoC</ThemedText>
        <ThemedText type="small" style={styles.description}>
          Use this page to exercise passkey, Stellar, and NFC spike flows during development build validation.
        </ThemedText>

        <View style={styles.group}>
          <ThemedText type="subtitle">Passkey spike</ThemedText>
          <ActionButton label="Init Passkey" onPress={runPasskeyInit} />
          <ActionButton label="Create Credential" onPress={runPasskeyCreate} />
          <ActionButton label="Authenticate" onPress={runPasskeyAuth} />
        </View>

        <View style={styles.group}>
          <ThemedText type="subtitle">Stellar spike</ThemedText>
          <ActionButton label="Run Stellar test" onPress={runStellar} />
        </View>

        <View style={styles.group}>
          <ThemedText type="subtitle">NFC spike</ThemedText>
          <ActionButton label="Init NFC" onPress={runNfcInit} />
          <ActionButton label="Write NDEF JSON" onPress={runNfcWrite} />
          <ActionButton label="Read NDEF JSON" onPress={runNfcRead} />
          {Platform.OS === 'web' && <ThemedText type="small">NFC requires native dev client and is not supported on web.</ThemedText>}
        </View>

        <ThemedView type="backgroundElement" style={styles.logPanel}>
          <ThemedText type="subtitle">Recent logs</ThemedText>
          {logs.length ? (
            logs.map((entry, index) => (
              <ThemedText key={`${index}-${entry}`} type="small" style={styles.logEntry}>
                {entry}
              </ThemedText>
            ))
          ) : (
            <ThemedText type="small">No actions executed yet.</ThemedText>
          )}
        </ThemedView>

        <Link href="/" style={styles.linkButton}>
          <ThemedText type="smallBold">Back to Home</ThemedText>
        </Link>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  description: {
    marginBottom: Spacing.four,
  },
  group: {
    gap: Spacing.two,
  },
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.four,
    backgroundColor: '#EAF4FF',
  },
  logPanel: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  logEntry: {
    marginTop: Spacing.one,
  },
  linkButton: {
    marginTop: Spacing.four,
    alignSelf: 'flex-start',
  },
});
