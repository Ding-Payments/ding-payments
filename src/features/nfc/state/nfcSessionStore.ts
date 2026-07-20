import { create } from 'zustand';

import type { PaymentRequest } from '@/features/nfc/schemas/paymentRequest';
import { NfcError } from '@/features/nfc/services/NfcService.types';

export type NfcSessionStatus = 'idle' | 'scanning' | 'writing' | 'success' | 'error';

interface NfcSessionState {
  status: NfcSessionStatus;
  error: NfcError | null;
  lastRequest: PaymentRequest | null;
  /** True while scanning or writing — suppresses auth lock (CLI-026 / CLI-052). */
  nfcActive: boolean;
  beginScanning: () => void;
  beginWriting: () => void;
  setSuccess: (request?: PaymentRequest) => void;
  setError: (error: NfcError) => void;
  reset: () => void;
}

const ACTIVE_STATUSES: NfcSessionStatus[] = ['scanning', 'writing'];

function assertCanStart(status: NfcSessionStatus): void {
  if (ACTIVE_STATUSES.includes(status)) {
    throw new NfcError('SESSION_ACTIVE', 'Only one NFC session can be active at a time');
  }
}

export const useNfcSessionStore = create<NfcSessionState>((set, get) => ({
  status: 'idle',
  error: null,
  lastRequest: null,
  nfcActive: false,

  beginScanning: () => {
    assertCanStart(get().status);
    set({ status: 'scanning', error: null, nfcActive: true });
  },

  beginWriting: () => {
    assertCanStart(get().status);
    set({ status: 'writing', error: null, nfcActive: true });
  },

  setSuccess: (request) => {
    set({
      status: 'success',
      error: null,
      lastRequest: request ?? get().lastRequest,
      nfcActive: false,
    });
  },

  setError: (error) => {
    set({ status: 'error', error, nfcActive: false });
  },

  reset: () => {
    set({ status: 'idle', error: null, nfcActive: false });
  },
}));

export const selectNfcActive = (state: NfcSessionState) => state.nfcActive;
export const selectNfcStatus = (state: NfcSessionState) => state.status;
