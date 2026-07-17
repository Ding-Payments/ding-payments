import { Tabs } from 'expo-router';

import { AuthGuard } from '@/features/auth/components/AuthGuard';

export default function TabsLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="receive" options={{ title: 'Recibir' }} />
        <Tabs.Screen name="send" options={{ title: 'Enviar' }} />
        <Tabs.Screen name="history" options={{ title: 'Historial' }} />
        <Tabs.Screen name="settings" options={{ title: 'Ajustes' }} />
      </Tabs>
    </AuthGuard>
  );
}
