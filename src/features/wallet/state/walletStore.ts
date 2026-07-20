import { create } from 'zustand';

import type { WalletBalances } from '@/features/wallet/services/BalanceService';

export type WalletStatus = 'idle' | 'creating' | 'awaiting_funding' | 'ready' | 'error';

interface WalletState {
  status: WalletStatus;
  publicKey: string | null;
  balances: WalletBalances | null;
  error: string | null;
  hasHydrated: boolean;
  setStatus: (status: WalletStatus) => void;
  setPublicKey: (publicKey: string) => void;
  setBalances: (balances: WalletBalances) => void;
  setError: (error: string | null) => void;
  setHydrated: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  status: 'idle' as WalletStatus,
  publicKey: null as string | null,
  balances: null as WalletBalances | null,
  error: null as string | null,
  hasHydrated: false,
};

export const useWalletStore = create<WalletState>((set) => ({
  ...INITIAL_STATE,

  setStatus: (status) => set({ status }),
  setPublicKey: (publicKey) => set({ publicKey }),
  setBalances: (balances) => set({ balances }),
  setError: (error) => set({ error }),
  setHydrated: () => set({ hasHydrated: true }),
  reset: () => set({ ...INITIAL_STATE }),
}));

export const selectWalletStatus = (state: WalletState) => state.status;
export const selectWalletPublicKey = (state: WalletState) => state.publicKey;
