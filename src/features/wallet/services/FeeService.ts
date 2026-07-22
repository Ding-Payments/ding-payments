/**
 * CLI-040 — Fee estimation and payment affordability checks.
 *
 * Uses stroops/bigint for monetary math. Does not submit transactions.
 */
import { BASE_FEE, NotFoundError } from '@stellar/stellar-sdk';

import type { SupportedAssetCode } from '@/features/wallet/constants/assets';
import { parsePaymentAmount, stroopsToStellarAmount } from '@/features/wallet/schemas/paymentTx';
import {
  getMinimumBalanceStroops,
  parseNativeBalanceStroops,
  parseUsdcBalanceStroops,
} from './BalanceService';
import { hasUsdcTrustline } from './TrustlineService';
import {
  stellarHorizonClient,
  type StellarHorizonClient,
} from './StellarHorizonClient';

export interface FeeEstimate {
  feeStroops: bigint;
  feeXlm: string;
}

export type AffordabilityReason =
  | 'insufficient_balance'
  | 'insufficient_xlm_for_fee_and_reserve'
  | 'no_usdc_trustline'
  | 'account_not_found'
  | 'network_error';

export interface AffordabilityResult {
  canAfford: boolean;
  reason?: AffordabilityReason;
  estimatedFee?: FeeEstimate;
}

export interface CanAffordPaymentDeps {
  horizonClient?: Pick<StellarHorizonClient, 'loadAccount'>;
}

/** MVP: single-operation payment fee from Stellar SDK base fee (100 stroops). */
export function estimateFee(): FeeEstimate {
  const feeStroops = BigInt(BASE_FEE);
  return {
    feeStroops,
    feeXlm: stroopsToStellarAmount(feeStroops),
  };
}

/**
 * Determines whether an account can afford a payment including fee and minimum reserve.
 *
 * USDC payments require an existing USDC trustline on the payer account — a payer cannot
 * send an asset for which they hold no trustline (same policy as receive/trustline flows).
 */
export async function canAffordPayment(
  publicKey: string,
  amount: string,
  asset: SupportedAssetCode,
  deps: CanAffordPaymentDeps = {}
): Promise<AffordabilityResult> {
  const { stroops: amountStroops } = parsePaymentAmount(amount, asset);
  const estimatedFee = estimateFee();
  const horizonClient = deps.horizonClient ?? stellarHorizonClient;

  let account;
  try {
    account = await horizonClient.loadAccount(publicKey);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        canAfford: false,
        reason: 'account_not_found',
        estimatedFee,
      };
    }

    return {
      canAfford: false,
      reason: 'network_error',
      estimatedFee,
    };
  }

  const nativeStroops = parseNativeBalanceStroops(account);
  const subentryCount = account.subentry_count ?? 0;
  const minBalanceStroops = getMinimumBalanceStroops(subentryCount);
  const xlmRequiredAfterPayment = estimatedFee.feeStroops + minBalanceStroops;

  if (asset === 'XLM') {
    const totalRequired = amountStroops + xlmRequiredAfterPayment;

    if (nativeStroops < totalRequired) {
      if (nativeStroops >= amountStroops) {
        return {
          canAfford: false,
          reason: 'insufficient_xlm_for_fee_and_reserve',
          estimatedFee,
        };
      }

      return {
        canAfford: false,
        reason: 'insufficient_balance',
        estimatedFee,
      };
    }

    return { canAfford: true, estimatedFee };
  }

  // USDC — payer must hold a USDC trustline to send USDC.
  if (!hasUsdcTrustline(account)) {
    return {
      canAfford: false,
      reason: 'no_usdc_trustline',
      estimatedFee,
    };
  }

  const usdcStroops = parseUsdcBalanceStroops(account);

  if (usdcStroops < amountStroops) {
    return {
      canAfford: false,
      reason: 'insufficient_balance',
      estimatedFee,
    };
  }

  if (nativeStroops < xlmRequiredAfterPayment) {
    return {
      canAfford: false,
      reason: 'insufficient_xlm_for_fee_and_reserve',
      estimatedFee,
    };
  }

  return { canAfford: true, estimatedFee };
}

export const FeeService = {
  estimateFee,
  canAffordPayment,
};
