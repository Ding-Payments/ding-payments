import * as SecureStore from 'expo-secure-store';

export interface SecureKeyStoreOptions {
  authenticationPrompt?: string;
}

export class SecureKeyStore {
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async get(key: string, options?: SecureKeyStoreOptions): Promise<string | null> {
    return SecureStore.getItemAsync(key, {
      authenticationPrompt: options?.authenticationPrompt ?? 'Authenticate to access wallet key',
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async delete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}
