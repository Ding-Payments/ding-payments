import { Horizon } from '@stellar/stellar-sdk';

import { STELLAR_ASSETS } from '@/features/wallet/constants/assets';
import {
  getMinimumBalanceStroops,
  horizonBalanceToStroops,
} from '@/features/wallet/utils/stellarReserve';
import { stellarHorizonClient } from './StellarHorizonClient';

export { getMinimumBalanceStroops };

export interface WalletBalances {
  xlm: string;
  usdc: string | null;
  hasUsdcTrustline: boolean;
}

type AccountBalances = Pick<Horizon.AccountResponse, 'balances'>;

type AccountWithNativeBalance = Pick<Horizon.AccountResponse, 'balances'>;

export function parseNativeBalanceStroops(account: AccountWithNativeBalance): bigint {
  const nativeLine = account.balances.find((balance) => balance.asset_type === 'native');
  if (!nativeLine) {
    return 0n;
  }

  return horizonBalanceToStroops(nativeLine.balance);
}

export function parseUsdcBalanceStroops(account: AccountBalances): bigint {
  for (const line of account.balances) {
    if (
      'asset_code' in line &&
      line.asset_code === STELLAR_ASSETS.USDC.code &&
      line.asset_issuer === STELLAR_ASSETS.USDC.issuer
    ) {
      return horizonBalanceToStroops(line.balance);
    }
  }

  return 0n;
}

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
  const account = await stellarHorizonClient.loadAccount(publicKey);
  return parseBalances(account);
}

export const BalanceService = {
  parseBalances,
  parseNativeBalanceStroops,
  parseUsdcBalanceStroops,
  getMinimumBalanceStroops,
  fetchBalances,
};
