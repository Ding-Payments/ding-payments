import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { SecureKeyStore } from '@/lib/SecureKeyStore';
import { AccountService } from '@/features/wallet/services/AccountService';
import { fetchBalances } from '@/features/wallet/services/BalanceService';
import { ensureUsdcTrustline } from '@/features/wallet/services/TrustlineService';
import { useWalletStore } from '@/features/wallet/state/walletStore';
import { useWallet, type UseWalletResult } from './useWallet';

jest.mock('@/features/wallet/services/AccountService', () => ({
  AccountService: {
    getOrCreateKeypair: jest.fn(),
    accountExistsOnNetwork: jest.fn(),
    fundTestnetAccount: jest.fn(),
  },
}));

jest.mock('@/features/wallet/services/BalanceService', () => ({
  fetchBalances: jest.fn(),
}));

jest.mock('@/features/wallet/services/TrustlineService', () => ({
  ensureUsdcTrustline: jest.fn(),
}));

jest.mock('@/lib/SecureKeyStore', () => ({
  SecureKeyStore: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockGetOrCreateKeypair = AccountService.getOrCreateKeypair as jest.Mock;
const mockAccountExistsOnNetwork = AccountService.accountExistsOnNetwork as jest.Mock;
const mockFundTestnetAccount = AccountService.fundTestnetAccount as jest.Mock;
const mockFetchBalances = fetchBalances as jest.Mock;
const mockEnsureUsdcTrustline = ensureUsdcTrustline as jest.Mock;
const mockSecureGet = SecureKeyStore.get as jest.Mock;

async function renderUseWallet() {
  const captured: { value?: UseWalletResult } = {};

  function TestComponent() {
    captured.value = useWallet();
    return null;
  }

  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(React.createElement(TestComponent));
  });

  return {
    get result(): UseWalletResult {
      return captured.value!;
    },
    unmount: () => act(() => renderer.unmount()),
  };
}

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureGet.mockResolvedValue(null);
    useWalletStore.getState().reset();
  });

  it('creates and funds a testnet wallet end to end', async () => {
    mockGetOrCreateKeypair.mockResolvedValue({ publicKey: 'GPUB', isNew: true });
    mockFundTestnetAccount.mockResolvedValue({ outcome: 'funded' });
    mockEnsureUsdcTrustline.mockResolvedValue({ status: 'created' });
    mockFetchBalances.mockResolvedValue({ xlm: '10000', usdc: '0', hasUsdcTrustline: true });

    const hook = await renderUseWallet();

    await act(async () => {
      await hook.result.createWallet();
    });

    expect(hook.result.status).toBe('ready');
    expect(hook.result.publicKey).toBe('GPUB');
    expect(hook.result.balances).toEqual({ xlm: '10000', usdc: '0', hasUsdcTrustline: true });
    expect(hook.result.isReady).toBe(true);

    hook.unmount();
  });

  it('surfaces a funding error without reaching ready', async () => {
    mockGetOrCreateKeypair.mockResolvedValue({ publicKey: 'GPUB', isNew: true });
    mockFundTestnetAccount.mockResolvedValue({ outcome: 'error', message: 'friendbot down' });

    const hook = await renderUseWallet();

    await act(async () => {
      await hook.result.createWallet();
    });

    expect(hook.result.status).toBe('error');
    expect(hook.result.error).toBe('friendbot down');
    expect(mockFetchBalances).not.toHaveBeenCalled();

    hook.unmount();
  });

  it('does nothing when checkFunding is called with no known public key', async () => {
    const hook = await renderUseWallet();

    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await hook.result.checkFunding();
    });

    expect(outcome).toBe(false);
    expect(mockAccountExistsOnNetwork).not.toHaveBeenCalled();
    expect(hook.result.status).toBe('idle');

    hook.unmount();
  });

  it('completes setup once checkFunding detects the account is funded', async () => {
    useWalletStore.getState().setPublicKey('GPUB');
    useWalletStore.getState().setStatus('awaiting_funding');

    mockAccountExistsOnNetwork.mockResolvedValue(true);
    mockEnsureUsdcTrustline.mockResolvedValue({ status: 'already_trusted' });
    mockFetchBalances.mockResolvedValue({ xlm: '5', usdc: null, hasUsdcTrustline: false });

    const hook = await renderUseWallet();

    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await hook.result.checkFunding();
    });

    expect(outcome).toBe(true);
    expect(hook.result.status).toBe('ready');
    expect(hook.result.balances).toEqual({ xlm: '5', usdc: null, hasUsdcTrustline: false });

    hook.unmount();
  });
});
