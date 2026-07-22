/**
 * USDC trustline setup (CLI-037) and read-only checks (CLI-070).
 *
 * - ensureUsdcTrustline: wallet setup — idempotent changeTrust when missing
 * - checkUsdcTrustline: receive flow — read-only line presence check
 *
 * @see docs/receive-flow.md — error matrix (trustline_missing)
 */
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

import { env } from '@/lib/env';
import { SecureKeyStore } from '@/lib/SecureKeyStore';
import { SECURE_KEYS } from '@/lib/SecureKeyStore.types';
import {
  getMinimumBalanceStroopsForNewTrustline,
  getMinimumBalanceXlmForNewTrustline,
} from '@/features/wallet/utils/stellarReserve';
import { parseNativeBalanceStroops } from './BalanceService';
import { createWalletError, mapHorizonError, WalletErrorCode } from './walletErrors';
import { stellarHorizonClient } from './StellarHorizonClient';
type AccountBalances = Pick<Horizon.AccountResponse, 'balances'>;

export interface TrustlineCheckResult {
  hasLine: boolean;
  sufficientReserve: boolean;
}

export type EnsureUsdcTrustlineStatus =
  | 'already_trusted'
  | 'created'
  | 'insufficient_reserve'
  | 'error';

export interface EnsureUsdcTrustlineResult {
  status: EnsureUsdcTrustlineStatus;
  message?: string;
}

export function hasUsdcTrustline(account: AccountBalances): boolean {
  return account.balances.some(
    (balance) =>
      'asset_code' in balance &&
      balance.asset_code === 'USDC' &&
      'asset_issuer' in balance &&
      balance.asset_issuer === env.usdcIssuer
  );
}

/**
 * Returns whether native XLM balance can cover the reserve for one additional trustline.
 * Uses +1 subentry for the new trustline and the trustline-only buffer (see stellarReserve.ts).
 */
export function hasSufficientReserveForTrustline(
  xlmBalance: number,
  subentryCount: number
): boolean {
  return xlmBalance >= getMinimumBalanceXlmForNewTrustline(subentryCount);
}
export async function ensureUsdcTrustline(publicKey: string): Promise<EnsureUsdcTrustlineResult> {
  try {
    const account = await stellarHorizonClient.loadAccount(publicKey);

    if (hasUsdcTrustline(account)) {
      return { status: 'already_trusted' };
    }

    const nativeStroops = parseNativeBalanceStroops(account);
    const subentryCount = account.subentry_count ?? 0;

    if (nativeStroops < getMinimumBalanceStroopsForNewTrustline(subentryCount)) {
      return {
        status: 'insufficient_reserve',
        message:
          'Saldo insuficiente para habilitar USDC. Deposita más XLM para cubrir la reserva mínima.',
      };
    }

    const secretKey = await SecureKeyStore.get(SECURE_KEYS.WALLET_STELLAR_SECRET_KEY);
    if (!secretKey) {
      return {
        status: 'error',
        message: createWalletError(WalletErrorCode.WALLET_KEY_MISSING).message,
      };
    }

    const sourceKeypair = Keypair.fromSecret(secretKey);
    const usdcAsset = new Asset('USDC', env.usdcIssuer);

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: env.networkPassphrase,
    })
      .addOperation(
        Operation.changeTrust({
          asset: usdcAsset,
        })
      )
      .setTimeout(300)
      .build();

    transaction.sign(sourceKeypair);
    await stellarHorizonClient.submitTransaction(transaction);

    return { status: 'created' };
  } catch (error) {
    return {
      status: 'error',
      message: mapHorizonError(error).message,
    };
  }
}

export class TrustlineService {
  /**
   * Read-only USDC trustline check for receive/NFC flows.
   * Does not submit transactions or read secret keys.
   */
  async checkUsdcTrustline(publicKey: string): Promise<TrustlineCheckResult> {
    try {
      const account = await stellarHorizonClient.loadAccount(publicKey);
      const hasLine = hasUsdcTrustline(account);

      return {
        hasLine,
        // MVP: when the account loads, assume reserve is sufficient for the read path.
        // ensureUsdcTrustline performs the strict reserve check before creating a line.
        sufficientReserve: true,
      };
    } catch {
      return { hasLine: false, sufficientReserve: false };
    }
  }
}

export const trustlineService = new TrustlineService();
