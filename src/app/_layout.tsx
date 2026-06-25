import { Buffer } from 'buffer';
import process from 'process';
import 'react-native-get-random-values';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

globalThis.Buffer = globalThis.Buffer || (Buffer as unknown as typeof globalThis.Buffer);
globalThis.process = globalThis.process || process;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
