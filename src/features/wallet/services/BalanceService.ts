import { Horizon } from '@stellar/stellar-sdk';

import { env } from '@/lib/env';
import { STELLAR_ASSETS } from '@/features/wallet/constants/assets';
import { ensureStellarPolyfills } from './stellarPolyfills';

ensureStellarPolyfills();

const server = new Horizon.Server(env.horizonUrl);

export interface WalletBalances {
  xlm: string;
  usdc: string | null;
  hasUsdcTrustline: boolean;
}

type AccountBalances = Pick<Horizon.AccountResponse, 'balances'>;

export function parseBalances(account: AccountBalances): WalletBalances {
  let xlm = '0';
  let usdc: string | null = null;
  let hasUsdcTrustline = false;

  for (const line of account.balances) {
    if (line.asset_type === 'native') {
      xlm = line.balance;
      continue;
    }

    if (
      'asset_code' in line &&
      line.asset_code === STELLAR_ASSETS.USDC.code &&
      line.asset_issuer === STELLAR_ASSETS.USDC.issuer
    ) {
      usdc = line.balance;
      hasUsdcTrustline = true;
    }
  }

  return { xlm, usdc, hasUsdcTrustline };
}

export async function fetchBalances(publicKey: string): Promise<WalletBalances> {
  const account = await server.loadAccount(publicKey);
  return parseBalances(account);
}

export const BalanceService = {
  parseBalances,
  fetchBalances,
};
