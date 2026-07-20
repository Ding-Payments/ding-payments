import { useCallback, useEffect, useRef } from 'react';

import { env } from '@/lib/env';
import { SecureKeyStore } from '@/lib/SecureKeyStore';
import { SECURE_KEYS } from '@/lib/SecureKeyStore.types';
import { AccountService } from '@/features/wallet/services/AccountService';
import { fetchBalances, type WalletBalances } from '@/features/wallet/services/BalanceService';
import { ensureUsdcTrustline } from '@/features/wallet/services/TrustlineService';
import { useWalletStore, type WalletStatus } from '@/features/wallet/state/walletStore';

export interface UseWalletResult {
  status: WalletStatus;
  publicKey: string | null;
  balances: WalletBalances | null;
  error: string | null;
  isReady: boolean;
  createWallet: () => Promise<boolean>;
  checkFunding: () => Promise<boolean>;
  refreshBalances: () => Promise<void>;
}

async function finishSetup(publicKey: string): Promise<void> {
  const { setBalances, setStatus, setError } = useWalletStore.getState();

  const trustlineResult = await ensureUsdcTrustline(publicKey).catch(() => null);
  if (
    trustlineResult &&
    trustlineResult.status !== 'already_trusted' &&
    trustlineResult.status !== 'created'
  ) {
    setError(trustlineResult.message ?? null);
  }

  const balances = await fetchBalances(publicKey);
  setBalances(balances);
  setStatus('ready');
}

export function useWallet(): UseWalletResult {
  const status = useWalletStore((state) => state.status);
  const publicKey = useWalletStore((state) => state.publicKey);
  const balances = useWalletStore((state) => state.balances);
  const error = useWalletStore((state) => state.error);
  const hasHydrated = useWalletStore((state) => state.hasHydrated);

  const hydrating = useRef(false);

  useEffect(() => {
    if (hasHydrated || hydrating.current) return;
    hydrating.current = true;

    SecureKeyStore.get(SECURE_KEYS.WALLET_STELLAR_PUBLIC_KEY)
      .then((storedPublicKey) => {
        const { setPublicKey, setStatus, setHydrated } = useWalletStore.getState();
        setHydrated();

        if (storedPublicKey) {
          setPublicKey(storedPublicKey);
          setStatus('ready');
        }
      })
      .catch(() => {
        useWalletStore.getState().setHydrated();
      });
  }, [hasHydrated]);

  const refreshBalances = useCallback(async () => {
    const currentPublicKey = useWalletStore.getState().publicKey;
    if (!currentPublicKey) return;

    try {
      const next = await fetchBalances(currentPublicKey);
      useWalletStore.getState().setBalances(next);
    } catch {
      useWalletStore
        .getState()
        .setError('No se pudieron actualizar los saldos. Verifica tu conexión.');
    }
  }, []);

  useEffect(() => {
    if (status === 'ready' && publicKey && !balances) {
      void refreshBalances();
    }
  }, [status, publicKey, balances, refreshBalances]);

  const createWallet = useCallback(async (): Promise<boolean> => {
    const { setStatus, setPublicKey, setError } = useWalletStore.getState();
    setStatus('creating');
    setError(null);

    try {
      const { publicKey: newPublicKey } = await AccountService.getOrCreateKeypair();
      setPublicKey(newPublicKey);

      if (env.stellarNetwork === 'testnet') {
        const fundingResult = await AccountService.fundTestnetAccount(newPublicKey);
        if (fundingResult.outcome === 'error') {
          setStatus('error');
          setError(fundingResult.message ?? null);
          return false;
        }
      } else {
        const exists = await AccountService.accountExistsOnNetwork(newPublicKey);
        if (!exists) {
          setStatus('awaiting_funding');
          return false;
        }
      }

      await finishSetup(newPublicKey);
      return true;
    } catch {
      setStatus('error');
      setError('No se pudo crear la billetera. Inténtalo de nuevo.');
      return false;
    }
  }, []);

  const checkFunding = useCallback(async (): Promise<boolean> => {
    const currentPublicKey = useWalletStore.getState().publicKey;
    if (!currentPublicKey) return false;

    try {
      const exists = await AccountService.accountExistsOnNetwork(currentPublicKey);
      if (!exists) return false;

      await finishSetup(currentPublicKey);
      return true;
    } catch {
      useWalletStore
        .getState()
        .setError('No se pudo verificar el estado de la cuenta. Inténtalo de nuevo.');
      return false;
    }
  }, []);

  return {
    status,
    publicKey,
    balances,
    error,
    isReady: status === 'ready',
    createWallet,
    checkFunding,
    refreshBalances,
  };
}
