import { NativeModules, Platform } from 'react-native';

const passkeyModule = (NativeModules as any).PasskeyModule;

export type PasskeyCredential = {
  id: string;
  publicKey: string;
  transport: string[];
  createdAt: string;
};

export type PasskeySpikeResult =
  | { success: true; credential: PasskeyCredential }
  | { success: false; reason: string };

export async function initializePasskeySpike(): Promise<{ supported: boolean; details: string }> {
  const isSupported = Boolean(passkeyModule?.isSupported);
  const runtime = Platform.OS;

  return {
    supported: isSupported,
    details: isSupported
      ? `Passkey native module detected on ${runtime}. Run a device-backed credential flow in the dev-client.`
      : `Passkey native module not detected on ${runtime}. Install the native passkey library and rebuild with a dev-client.`,
  };
}

export async function createPasskeyCredential(): Promise<PasskeySpikeResult> {
  if (!passkeyModule?.createCredential) {
    return {
      success: false,
      reason: 'Passkey native module is not available in this runtime. Use a dev-client with the passkey library installed.',
    };
  }

  try {
    const credential = await passkeyModule.createCredential();

    return {
      success: true,
      credential: {
        id: credential.id,
        publicKey: credential.publicKey,
        transport: credential.transport ?? [],
        createdAt: credential.createdAt ?? new Date().toISOString(),
      },
    };
  } catch (error: any) {
    return { success: false, reason: error?.message ?? 'Unknown passkey creation error.' };
  }
}

export async function authenticateWithPasskey(): Promise<{ success: boolean; reason?: string }> {
  if (!passkeyModule?.authenticate) {
    return {
      success: false,
      reason: 'Passkey native module is not available in this runtime. Use a dev-client with the passkey library installed.',
    };
  }

  try {
    await passkeyModule.authenticate();
    return { success: true };
  } catch (error: any) {
    return { success: false, reason: error?.message ?? 'Unknown passkey authentication error.' };
  }
}

export async function clearPasskeySpike(): Promise<void> {
  if (passkeyModule?.clear) {
    await passkeyModule.clear();
  }
}
