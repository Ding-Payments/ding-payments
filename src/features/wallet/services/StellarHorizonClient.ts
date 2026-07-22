import { Horizon } from '@stellar/stellar-sdk';
import type { Transaction } from '@stellar/stellar-sdk';

import { env } from '@/lib/env';
import { ensureStellarPolyfills } from './stellarPolyfills';

export type SubmitTransactionResponse = Horizon.HorizonApi.SubmitTransactionResponse;

/**
 * Typed wrapper around a single Horizon.Server instance for wallet services.
 * Centralizes URL configuration and keeps SDK construction mock-friendly in tests.
 */
export class StellarHorizonClient {
  readonly horizonUrl: string;
  private readonly server: Horizon.Server;

  constructor(horizonUrl: string) {
    ensureStellarPolyfills();
    this.horizonUrl = horizonUrl;
    this.server = new Horizon.Server(horizonUrl);
  }

  loadAccount(publicKey: string): Promise<Horizon.AccountResponse> {
    return this.server.loadAccount(publicKey);
  }

  submitTransaction(transaction: Transaction): Promise<SubmitTransactionResponse> {
    return this.server.submitTransaction(transaction);
  }

  fundWithFriendbot(publicKey: string): Promise<unknown> {
    return this.server.friendbot(publicKey).call();
  }
}

export function createStellarHorizonClient(
  horizonUrl: string = env.horizonUrl
): StellarHorizonClient {
  return new StellarHorizonClient(horizonUrl);
}

/** Shared Horizon client configured from typed env (testnet/mainnet). */
export const stellarHorizonClient = createStellarHorizonClient();
