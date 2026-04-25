import React from 'react';
import { Stack } from 'expo-router';
import NFCDemo from '../components/NFCDemo';

export default function NFCResearchScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'NFC Research' }} />
      <NFCDemo />
    </>
  );
}
