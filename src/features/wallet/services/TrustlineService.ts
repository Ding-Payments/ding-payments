/**
 * USDC trustline checks (CLI-070).
 *
 * The receive flow must confirm the receiver already has a USDC trustline
 * before broadcasting a USDC payment request over NFC — a payer cannot send
 * an asset the receiver has no line for.
 *
 * @see docs/receive-flow.md — error matrix (trustline_missing)
 */
import { Horizon } from '@stellar/stellar-sdk';

import { env } from '@/lib/env';

export interface TrustlineCheckResult {
  hasLine: boolean;
  sufficientReserve: boolean;
}

export class TrustlineService {
  async checkUsdcTrustline(publicKey: string): Promise<TrustlineCheckResult> {
    try {
      const server = new Horizon.Server(env.horizonUrl);
      const account = await server.loadAccount(publicKey);

      const hasLine = account.balances.some(
        (balance) =>
          'asset_code' in balance &&
          balance.asset_code === 'USDC' &&
          'asset_issuer' in balance &&
          balance.asset_issuer === env.usdcIssuer
      );

      return {
        hasLine,
        // Reserve sizing (base reserve + subentry count) is a future concern — MVP
        // assumes a trustline that exists has sufficient reserve backing it.
        sufficientReserve: true,
      };
    } catch {
      return { hasLine: false, sufficientReserve: false };
    }
  }
}

export const trustlineService = new TrustlineService();
