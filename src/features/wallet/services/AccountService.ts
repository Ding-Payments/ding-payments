import { Horizon, Keypair, NotFoundError } from '@stellar/stellar-sdk';

import { env } from '@/lib/env';
import { SecureKeyStore } from '@/lib/SecureKeyStore';
import { SECURE_KEYS } from '@/lib/SecureKeyStore.types';
import { ensureStellarPolyfills } from './stellarPolyfills';

ensureStellarPolyfills();

const server = new Horizon.Server(env.horizonUrl);

export interface WalletKeypair {
  publicKey: string;
  isNew: boolean;
}

export type FundingOutcome = 'funded' | 'already_funded' | 'error';

export interface FundingResult {
  outcome: FundingOutcome;
  message?: string;
}

function isAccountAlreadyFundedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const data = (error as { response?: { data?: Record<string, unknown> } }).response?.data;
  if (!data) return false;

  const detail = typeof data.detail === 'string' ? data.detail : '';
  const operations = (data.extras as { result_codes?: { operations?: string[] } } | undefined)
    ?.result_codes?.operations;

  return (
    detail.includes('createAccountAlreadyExist') ||
    Boolean(operations?.includes('op_already_exists'))
  );
}

export const AccountService = {
  async getOrCreateKeypair(): Promise<WalletKeypair> {
    const existingPublicKey = await SecureKeyStore.get(SECURE_KEYS.WALLET_STELLAR_PUBLIC_KEY);
    if (existingPublicKey) {
      return { publicKey: existingPublicKey, isNew: false };
    }

    const keypair = Keypair.random();
    await SecureKeyStore.set(SECURE_KEYS.WALLET_STELLAR_SECRET_KEY, keypair.secret());
    await SecureKeyStore.set(SECURE_KEYS.WALLET_STELLAR_PUBLIC_KEY, keypair.publicKey());

    return { publicKey: keypair.publicKey(), isNew: true };
  },

  async accountExistsOnNetwork(publicKey: string): Promise<boolean> {
    try {
      await server.loadAccount(publicKey);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return false;
      }
      throw error;
    }
  },

  async fundTestnetAccount(publicKey: string): Promise<FundingResult> {
    if (env.stellarNetwork !== 'testnet') {
      return {
        outcome: 'error',
        message: 'La financiación automática solo está disponible en testnet.',
      };
    }

    try {
      await server.friendbot(publicKey).call();
      return { outcome: 'funded' };
    } catch (error) {
      if (isAccountAlreadyFundedError(error)) {
        return { outcome: 'already_funded' };
      }

      return {
        outcome: 'error',
        message: 'No se pudo financiar la cuenta de prueba en testnet. Inténtalo de nuevo.',
      };
    }
  },
};
