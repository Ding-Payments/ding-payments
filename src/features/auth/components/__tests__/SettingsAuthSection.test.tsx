import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { useWalletStore } from '@/features/wallet/state/walletStore';
import { SettingsAuthSection } from '../SettingsAuthSection';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/wallet/hooks/useWallet', () => ({
  useWallet: jest.fn(),
}));

jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    textSecondary: '#666',
    backgroundElement: '#eee',
  }),
}));

jest.mock('@/components/themed-text', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    ThemedText: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      accessibilityLabel?: string;
    }) => React.createElement(Text, props, children),
  };
});

jest.mock('@/components/ui/Button', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    Button: ({ label, onPress }: { label: string; onPress: () => void }) =>
      React.createElement(
        Pressable,
        { onPress, accessibilityLabel: label },
        React.createElement(Text, null, label)
      ),
  };
});

import { useWallet } from '@/features/wallet/hooks/useWallet';

const mockUseAuth = useAuth as jest.Mock;
const mockUseWallet = useWallet as jest.Mock;

const STELLAR_PUBLIC_KEY = 'GBRHKTZK42KXDGWYQLO3XWE4CCO76LNJV3HY33XWXX6BAHEHS5LADKKO';
const PASSKEY_CREDENTIAL_ID = 'credential-id-not-a-stellar-address';

async function renderSettings() {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<SettingsAuthSection />);
  });
  return renderer;
}

describe('SettingsAuthSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWalletStore.getState().reset();
    mockUseAuth.mockReturnValue({
      logout: jest.fn(),
      state: {
        publicKey: PASSKEY_CREDENTIAL_ID,
      },
    });
  });

  it('displays the Stellar wallet public key from useWallet', async () => {
    mockUseWallet.mockReturnValue({
      publicKey: STELLAR_PUBLIC_KEY,
      status: 'ready',
      balances: null,
      error: null,
      isReady: true,
      createWallet: jest.fn(),
      checkFunding: jest.fn(),
      refreshBalances: jest.fn(),
    });

    const renderer = await renderSettings();
    const tree = renderer.toJSON();

    expect(JSON.stringify(tree)).toContain(STELLAR_PUBLIC_KEY);
    expect(JSON.stringify(tree)).not.toContain(PASSKEY_CREDENTIAL_ID);
  });

  it('shows an empty wallet state when no Stellar public key exists', async () => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      status: 'idle',
      balances: null,
      error: null,
      isReady: false,
      createWallet: jest.fn(),
      checkFunding: jest.fn(),
      refreshBalances: jest.fn(),
    });

    const renderer = await renderSettings();

    expect(JSON.stringify(renderer.toJSON())).toContain('Billetera no configurada');
    expect(JSON.stringify(renderer.toJSON())).not.toContain(PASSKEY_CREDENTIAL_ID);
  });

  it('supports copying feedback when a wallet public key is present', async () => {
    jest.useFakeTimers();
    mockUseWallet.mockReturnValue({
      publicKey: STELLAR_PUBLIC_KEY,
      status: 'ready',
      balances: null,
      error: null,
      isReady: true,
      createWallet: jest.fn(),
      checkFunding: jest.fn(),
      refreshBalances: jest.fn(),
    });

    const renderer = await renderSettings();
    const pubkeyTouchable = renderer.root.findByProps({
      accessibilityLabel: 'Copiar clave pública',
    });

    await act(async () => {
      pubkeyTouchable.props.onPress();
    });

    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Clave pública copiada' })
    ).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    jest.useRealTimers();
  });
});
