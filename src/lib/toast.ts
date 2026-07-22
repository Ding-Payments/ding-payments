/**
 * Placeholder toast facade for MVP feedback.
 * Replace with a native toast/snackbar library when UI hardening lands.
 *
 * Policy: never pass private keys, seeds, full NFC payloads, or other secrets in messages.
 */
import {
  getWalletErrorMessage,
  type WalletErrorCodeValue,
} from '@/features/wallet/services/walletErrors';

function showSuccess(message: string) {
  console.log(`[toast.success] ${message}`);
}

function showError(message: string) {
  console.error(`[toast.error] ${message}`);
}

function showWalletError(code: WalletErrorCodeValue) {
  showError(getWalletErrorMessage(code));
}

export const toast = {
  success: showSuccess,
  error: showError,
  walletError: showWalletError,
};
