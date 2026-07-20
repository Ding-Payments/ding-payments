import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="create-passkey" />
      <Stack.Screen name="wallet-setup" />
      <Stack.Screen name="locked" />
    </Stack>
  );
}
