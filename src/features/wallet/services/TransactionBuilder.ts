/**
 * CLI-039 — Payment transaction builder (unsigned).
 *
 * Builds Stellar payment operations for XLM and USDC. Does not sign or submit.
 */
import {
  Asset,
  BASE_FEE,
  Memo,
  Operation,
  TransactionBuilder as StellarTransactionBuilder,
} from '@stellar/stellar-sdk';
import type { Transaction } from '@stellar/stellar-sdk';

import { STELLAR_ASSETS, type SupportedAssetCode } from '@/features/wallet/constants/assets';
import {
  DEFAULT_PAYMENT_TX_TIMEOUT_SECONDS,
  parsePaymentAmount,
  parsePaymentTxParams,
  type PaymentTxParams,
} from '@/features/wallet/schemas/paymentTx';
import { env } from '@/lib/env';
import {
  stellarHorizonClient,
  type StellarHorizonClient,
} from './StellarHorizonClient';

export class PaymentTxBuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentTxBuildError';
  }
}

export interface BuildPaymentTxDeps {
  horizonClient?: Pick<StellarHorizonClient, 'loadAccount'>;
  timeoutSeconds?: number;
  networkPassphrase?: string;
}

function toSdkAsset(assetCode: SupportedAssetCode): Asset {
  if (assetCode === 'XLM') {
    return Asset.native();
  }

  const usdc = STELLAR_ASSETS.USDC;
  if (!usdc.issuer) {
    throw new PaymentTxBuildError('USDC issuer is not configured.');
  }

  return new Asset(usdc.code, usdc.issuer);
}

export async function buildPaymentTx(
  input: PaymentTxParams,
  deps: BuildPaymentTxDeps = {}
): Promise<Transaction> {
  const params = parsePaymentTxParams(input);
  const assetCode = params.asset as SupportedAssetCode;
  const { stellarAmount } = parsePaymentAmount(params.amount, assetCode);

  const horizonClient = deps.horizonClient ?? stellarHorizonClient;

  let sourceAccount;
  try {
    sourceAccount = await horizonClient.loadAccount(params.source);
  } catch {
    throw new PaymentTxBuildError('No se pudo cargar la cuenta origen.');
  }

  const builder = new StellarTransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: deps.networkPassphrase ?? env.networkPassphrase,
  }).addOperation(
    Operation.payment({
      destination: params.destination,
      asset: toSdkAsset(assetCode),
      amount: stellarAmount,
    })
  );

  if (params.memo) {
    builder.addMemo(Memo.text(params.memo));
  }

  return builder.setTimeout(deps.timeoutSeconds ?? DEFAULT_PAYMENT_TX_TIMEOUT_SECONDS).build();
}
