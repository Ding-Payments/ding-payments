/**
 * CLI-020 — ReAuthModal
 *
 * Reusable bottom-sheet style modal that gates sensitive actions
 * behind passkey re-authentication.
 *
 * Props:
 * - visible: controls modal visibility
 * - onSuccess: called after successful authentication
 * - onCancel: called when user dismisses without authenticating
 * - reason: optional Spanish message explaining why auth is needed
 */

import React, { useCallback } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useReAuth } from '../hooks/useReAuth';

export interface ReAuthModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  reason?: string;
  /** Title shown in the modal header */
  title?: string;
}

export function ReAuthModal({
  visible,
  onSuccess,
  onCancel,
  reason = 'Esta acción requiere verificar tu identidad.',
  title = 'Verificación requerida',
}: ReAuthModalProps) {
  const theme = useTheme();
  const { withReAuth, isAuthenticating } = useReAuth();

  const handleAuthenticate = useCallback(async () => {
    const result = await withReAuth(async () => true);
    if (result) {
      onSuccess();
    }
  }, [withReAuth, onSuccess]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onCancel}
        accessible={false}
      />
      <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
        <View style={styles.handle} />

        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>

        <ThemedText themeColor="textSecondary" style={styles.reason}>
          {reason}
        </ThemedText>

        <Button
          label={isAuthenticating ? 'Verificando…' : 'Verificar con llave de acceso'}
          onPress={handleAuthenticate}
          loading={isAuthenticating}
          style={styles.button}
          accessibilityLabel="Verificar identidad con llave de acceso"
        />

        <Button
          label="Cancelar"
          variant="secondary"
          onPress={onCancel}
          style={styles.button}
          accessibilityLabel="Cancelar verificación"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7C7CC',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
  },
  reason: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: 4,
  },
});
