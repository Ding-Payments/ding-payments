/**
 * CLI-023 — Mock: react-native-passkey
 *
 * Jest manual mock for the native passkey module.
 * Allows PasskeyService tests to run without native bindings.
 *
 * Default behavior:
 * - isSupported() → true
 * - create() → resolved success result
 * - get() → resolved success result
 *
 * Override in individual tests:
 *   (Passkey.create as jest.Mock).mockRejectedValueOnce(...)
 */

export const Passkey = {
  isSupported: jest.fn().mockReturnValue(true),

  create: jest.fn().mockResolvedValue({
    id: 'mock-credential-id-abc123',
    rawId: 'mock-credential-id-abc123',
    type: 'public-key',
    response: {
      clientDataJSON: 'bW9ja0NsaWVudERhdGE=',
      attestationObject: 'bW9ja0F0dGVzdGF0aW9u',
      transports: ['internal'],
      publicKey: 'mockPublicKey',
    },
    clientExtensionResults: {},
  }),

  get: jest.fn().mockResolvedValue({
    id: 'mock-credential-id-abc123',
    rawId: 'mock-credential-id-abc123',
    type: 'public-key',
    response: {
      authenticatorData: 'bW9ja0F1dGhEYXRh',
      clientDataJSON: 'bW9ja0NsaWVudERhdGE=',
      signature: 'bW9ja1NpZ25hdHVyZQ==',
      userHandle: 'bW9ja1VzZXJIYW5kbGU=',
    },
    clientExtensionResults: {},
  }),

  createPlatformKey: jest.fn(),
  createSecurityKey: jest.fn(),
  getPlatformKey: jest.fn(),
  getSecurityKey: jest.fn(),
  getImmediate: jest.fn(),
};

// Named exports to match the library's index.d.ts
export const PasskeyError = {};
export type PasskeyCreateRequest = object;
export type PasskeyCreateResult = object;
export type PasskeyGetRequest = object;
export type PasskeyGetResult = object;
