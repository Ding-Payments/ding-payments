import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { SecureKeyStore } from '@/lib/SecureKeyStore';
import { SECURE_KEYS } from '@/lib/SecureKeyStore.types';
import { useWalletStore } from '@/features/wallet/state/walletStore';
import { PasskeyService } from '../../services/PasskeyService';
import { AuthProvider, useAuth } from '../useAuth';

jest.mock('../../services/PasskeyService', () => ({
  PasskeyService: {
    register: jest.fn(),
    authenticate: jest.fn(),
    revoke: jest.fn(),
  },
}));

jest.mock('@/lib/SecureKeyStore', () => ({
  SecureKeyStore: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    walletError: jest.fn(),
  },
}));

const mockRevoke = PasskeyService.revoke as jest.Mock;
const mockSecureDelete = SecureKeyStore.delete as jest.Mock;
const mockSecureGet = SecureKeyStore.get as jest.Mock;

function LogoutProbe({ onReady }: { onReady: (logout: () => Promise<void>) => void }) {
  const { logout, state } = useAuth();

  React.useEffect(() => {
    onReady(logout);
  }, [logout, onReady]);

  return <>{state.status}</>;
}

describe('useAuth logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWalletStore.getState().reset();
    mockRevoke.mockImplementation(async () => {
      await SecureKeyStore.delete(SECURE_KEYS.PASSKEY_CREDENTIAL_ID);
      await SecureKeyStore.delete(SECURE_KEYS.WALLET_PUBLIC_KEY);
      await SecureKeyStore.delete(SECURE_KEYS.AUTH_STATE);
      return { success: true };
    });
    mockSecureGet.mockResolvedValue(null);
  });

  it('clears passkey, Stellar keys, session, wallet store, and auth state', async () => {
    useWalletStore.setState({
      status: 'ready',
      publicKey: 'GBRHKTZK42KXDGWYQLO3XWE4CCO76LNJV3HY33XWXX6BAHEHS5LADKKO',
      hasHydrated: true,
    });

    let logoutFn: (() => Promise<void>) | undefined;
    let renderer!: ReactTestRenderer;

    await act(async () => {
      renderer = create(
        <AuthProvider>
          <LogoutProbe
            onReady={(logout) => {
              logoutFn = logout;
            }}
          />
        </AuthProvider>
      );
    });

    await act(async () => {
      await logoutFn?.();
    });

    expect(JSON.stringify(renderer.toJSON())).toContain('UNAUTHENTICATED');

    expect(mockRevoke).toHaveBeenCalledTimes(1);
    expect(mockSecureDelete).toHaveBeenCalledWith(SECURE_KEYS.WALLET_STELLAR_PUBLIC_KEY);
    expect(mockSecureDelete).toHaveBeenCalledWith(SECURE_KEYS.WALLET_STELLAR_SECRET_KEY);
    expect(mockSecureDelete).toHaveBeenCalledWith(SECURE_KEYS.SESSION_LAST_ACTIVE);

    const walletState = useWalletStore.getState();
    expect(walletState.status).toBe('idle');
    expect(walletState.publicKey).toBeNull();
    expect(walletState.hasHydrated).toBe(false);
    expect(mockSecureDelete).toHaveBeenCalledWith(SECURE_KEYS.PASSKEY_CREDENTIAL_ID);
    expect(mockSecureDelete).toHaveBeenCalledWith(SECURE_KEYS.WALLET_PUBLIC_KEY);
    expect(mockSecureDelete).toHaveBeenCalledWith(SECURE_KEYS.AUTH_STATE);
  });
});
