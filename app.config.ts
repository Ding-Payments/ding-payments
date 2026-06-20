import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ding-payments',
  slug: 'ding-payments',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'dingpayments',
  userInterfaceStyle: 'automatic',
  ios: {
    ...config.ios,
    icon: './assets/expo.icon',
    infoPlist: {
      ...(config.ios?.infoPlist ?? {}),
      NFCReaderUsageDescription: 'Use NFC to read and write payment requests securely for Ding Payments.',
      NSFaceIDUsageDescription: 'Use Face ID to authenticate passkey operations safely.',
    },
  },
  android: {
    ...config.android,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    permissions: ['NFC'],
    predictiveBackGestureEnabled: false,
  },
  web: {
    ...config.web,
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
