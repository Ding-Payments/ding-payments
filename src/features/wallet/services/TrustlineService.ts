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
import { STELLAR_ASSETS } from '@/features/wallet/constants/assets';
import { ensureStellarPolyfills } from './stellarPolyfills';

ensureStellarPolyfills();

const server = new Horizon.Server(env.horizonUrl);

const BASE_RESERVE_XLM = 0.5;
const FEE_BUFFER_XLM = 0.01;

export type TrustlineStatus = 'already_trusted' | 'created' | 'insufficient_reserve' | 'error';

export interface TrustlineResult {
  status: TrustlineStatus;
  message?: string;
}

type TrustlineAccount = Pick<Horizon.AccountResponse, 'balances'>;

export function hasUsdcTrustline(account: TrustlineAccount): boolean {
  return account.balances.some(
    (line) =>
      'asset_code' in line &&
      line.asset_code === STELLAR_ASSETS.USDC.code &&
      line.asset_issuer === STELLAR_ASSETS.USDC.issuer
  );
}

export function hasSufficientReserveForTrustline(
  xlmBalance: number,
  subentryCount: number
): boolean {
  const requiredMinBalance = (2 + subentryCount + 1) * BASE_RESERVE_XLM;
  return xlmBalance >= requiredMinBalance + FEE_BUFFER_XLM;
}

function usdcSdkAsset(): Asset {
  return new Asset(STELLAR_ASSETS.USDC.code, STELLAR_ASSETS.USDC.issuer);
}

export async function ensureUsdcTrustline(publicKey: string): Promise<TrustlineResult> {
  const account = await server.loadAccount(publicKey);

  if (hasUsdcTrustline(account)) {
    return { status: 'already_trusted' };
  }

  const nativeBalance = account.balances.find((line) => line.asset_type === 'native');
  const xlmBalance = nativeBalance ? Number(nativeBalance.balance) : 0;

  if (!hasSufficientReserveForTrustline(xlmBalance, account.subentry_count)) {
    return {
      status: 'insufficient_reserve',
      message:
        'No hay suficiente saldo en XLM para habilitar USDC. Agrega fondos e inténtalo de nuevo.',
    };
  }

  const secretKey = await SecureKeyStore.get(SECURE_KEYS.WALLET_STELLAR_SECRET_KEY);
  if (!secretKey) {
    return {
      status: 'error',
      message: 'No se encontró la llave de la billetera en este dispositivo.',
    };
  }

  const keypair = Keypair.fromSecret(secretKey);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: env.networkPassphrase,
  })
    .addOperation(Operation.changeTrust({ asset: usdcSdkAsset() }))
    .setTimeout(30)
    .build();

  transaction.sign(keypair);

  try {
    await server.submitTransaction(transaction);
    return { status: 'created' };
  } catch {
    return {
      status: 'error',
      message: 'No se pudo habilitar USDC en este momento. Inténtalo de nuevo más tarde.',
    };
  }
}

export const TrustlineService = {
  hasUsdcTrustline,
  hasSufficientReserveForTrustline,
  ensureUsdcTrustline,
};
