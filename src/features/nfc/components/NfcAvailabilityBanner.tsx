import React from 'react';
import { View, Text, Pressable, Linking, Platform } from 'react-native';

import { isNfcAvailable } from '@/features/nfc/services/NfcReader';

export function NfcAvailabilityBanner() {
  const available = isNfcAvailable();
  if (available) return null;

  const openSettings = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      // no-op on web
    }
  };

  return (
    <View style={{ backgroundColor: '#FFF4E5', padding: 12 }}>
      <Text style={{ color: '#663C00', marginBottom: 8 }}>
        NFC no está disponible o está deshabilitado en este dispositivo. Para usar
        pagos por NFC, habilítalo en ajustes.
      </Text>
      <Pressable onPress={openSettings} style={{ alignSelf: 'flex-start' }}>
        <Text style={{ color: '#0B66FF' }}>Abrir ajustes</Text>
      </Pressable>
    </View>
  );
}

export default NfcAvailabilityBanner;
