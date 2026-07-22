import React from 'react';
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { useWalletStore } from '@/features/wallet/state/walletStore';
import { AuthGuard } from '../AuthGuard';
import { useAuth } from '../../hooks/useAuth';
import type { AuthState } from '../../state/authStore';

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Redirect: ({ href }: { href: string }) =>
      React.createElement(Text, { testID: 'redirect' }, href),
  };
});

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

function setAuthState(status: AuthState['status']) {
  mockUseAuth.mockReturnValue({
    state: { status } as AuthState,
  });
}

function resetWalletStore() {
  useWalletStore.getState().reset();
}

async function renderGuard() {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(
      <AuthGuard>
        <Text testID="protected-content">Tabs</Text>
      </AuthGuard>
    );
  });
  return renderer;
}

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetWalletStore();
  });

  it('returns null while auth is LOADING', async () => {
    setAuthState('LOADING');

    const renderer = await renderGuard();

    expect(renderer.root.findAllByProps({ testID: 'protected-content' })).toHaveLength(0);
    expect(renderer.root.findAllByProps({ testID: 'redirect' })).toHaveLength(0);
  });

  it('redirects UNAUTHENTICATED users to welcome', async () => {
    setAuthState('UNAUTHENTICATED');

    const renderer = await renderGuard();

    expect(renderer.root.findByProps({ testID: 'redirect' }).props.children).toBe(
      '/(onboarding)/welcome'
    );
  });

  it('redirects ONBOARDING users to create-passkey', async () => {
    setAuthState('ONBOARDING');

    const renderer = await renderGuard();

    expect(renderer.root.findByProps({ testID: 'redirect' }).props.children).toBe(
      '/(onboarding)/create-passkey'
    );
  });

  it('redirects LOCKED users to locked', async () => {
    setAuthState('LOCKED');

    const renderer = await renderGuard();

    expect(renderer.root.findByProps({ testID: 'redirect' }).props.children).toBe(
      '/(onboarding)/locked'
    );
  });

  it('returns null for READY auth while wallet is not hydrated', async () => {
    setAuthState('READY');
    useWalletStore.setState({ hasHydrated: false, status: 'idle', publicKey: null });

    const renderer = await renderGuard();

    expect(renderer.root.findAllByProps({ testID: 'protected-content' })).toHaveLength(0);
    expect(renderer.root.findAllByProps({ testID: 'redirect' })).toHaveLength(0);
  });

  it('redirects READY auth to wallet-setup when wallet status is not ready', async () => {
    setAuthState('READY');
    useWalletStore.setState({
      hasHydrated: true,
      status: 'creating',
      publicKey: 'GBRHKTZK42KXDGWYQLO3XWE4CCO76LNJV3HY33XWXX6BAHEHS5LADKKO',
    });

    const renderer = await renderGuard();

    expect(renderer.root.findByProps({ testID: 'redirect' }).props.children).toBe(
      '/(onboarding)/wallet-setup'
    );
  });

  it('redirects READY auth to wallet-setup when wallet publicKey is missing', async () => {
    setAuthState('READY');
    useWalletStore.setState({
      hasHydrated: true,
      status: 'ready',
      publicKey: null,
    });

    const renderer = await renderGuard();

    expect(renderer.root.findByProps({ testID: 'redirect' }).props.children).toBe(
      '/(onboarding)/wallet-setup'
    );
  });

  it('renders children when auth is READY and wallet is ready with a publicKey', async () => {
    setAuthState('READY');
    useWalletStore.setState({
      hasHydrated: true,
      status: 'ready',
      publicKey: 'GBRHKTZK42KXDGWYQLO3XWE4CCO76LNJV3HY33XWXX6BAHEHS5LADKKO',
    });

    const renderer = await renderGuard();

    expect(renderer.root.findByProps({ testID: 'protected-content' }).props.children).toBe('Tabs');
    expect(renderer.root.findAllByProps({ testID: 'redirect' })).toHaveLength(0);
  });

  it('does not apply wallet checks outside READY auth', async () => {
    setAuthState('LOCKED');
    useWalletStore.setState({
      hasHydrated: false,
      status: 'idle',
      publicKey: null,
    });

    const renderer = await renderGuard();

    expect(renderer.root.findByProps({ testID: 'redirect' }).props.children).toBe(
      '/(onboarding)/locked'
    );
  });
});
