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
    entitlements: {
      ...(config.ios?.entitlements ?? {}),
      'com.apple.developer.nfc.readersession.formats': ['NDEF', 'TAG'],
    },
    infoPlist: {
      ...(config.ios?.infoPlist ?? {}),
      NFCReaderUsageDescription:
        'Use NFC to read and write payment requests securely for Ding Payments.',
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
    'expo-dev-client',
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
    [
      'expo-secure-store',
      {
        faceIDPermission: 'Use Face ID to authenticate passkey operations safely.',
        configureAndroidBackup: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
