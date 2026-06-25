import { create } from 'zustand';
import type { WalletStatus, WalletStore } from '../services/types';
import { WalletService } from '../services/WalletService';
import { StellarHorizonClient } from '../services/StellarHorizonClient';
import { HorizonAccountNotFoundError } from '../services/horizonErrors';

const walletService = new WalletService();
const horizonClient = new StellarHorizonClient();

const initialState = {
  status: 'none' as WalletStatus,
  publicKey: null as string | null,
  error: null as string | null,
};

export const useWalletStore = create<WalletStore>((set, get) => ({
  ...initialState,

  generateWallet: async () => {
    set({ status: 'generating', error: null });

    try {
      const { publicKey } = await walletService.generateAndPersistKeypair();
      await walletService.storePublicKey(publicKey);
      set({ status: 'unfunded', publicKey, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate wallet';
      set({ status: 'error', error: message });
    }
  },

  checkFunding: async () => {
    const { publicKey } = get();
    if (!publicKey) {
      set({ status: 'error', error: 'No wallet public key available' });
      return;
    }

    set({ status: 'funding', error: null });

    try {
      await horizonClient.getAccount(publicKey);
      set({ status: 'ready', error: null });
    } catch (err) {
      if (err instanceof HorizonAccountNotFoundError) {
        set({ status: 'unfunded', error: null });
      } else {
        const message =
          err instanceof Error ? err.message : 'Failed to check funding';
        set({ status: 'error', error: message });
      }
    }
  },

  reset: () => {
    const { publicKey } = get();
    if (publicKey) {
      walletService.removeWallet(publicKey);
    }
    set({ ...initialState });
  },

  setError: (error: string) => set({ status: 'error', error }),
}));
