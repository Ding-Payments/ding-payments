/** Stellar base reserve per ledger entry — MVP constant (0.5 XLM). */
export const STELLAR_BASE_RESERVE_XLM = 0.5;

/** Buffer applied only when adding a new trustline subentry (changeTrust flow). */
export const TRUSTLINE_RESERVE_BUFFER_XLM = 0.01;

export const STROOP_FACTOR = 10n ** 7n;

/** 0.5 XLM expressed in stroops. */
export const STELLAR_BASE_RESERVE_STROOPS = 5_000_000n;

/** 0.01 XLM buffer expressed in stroops — trustline creation only. */
export const TRUSTLINE_RESERVE_BUFFER_STROOPS = 100_000n;

const HORIZON_BALANCE_REGEX = /^(\d+)(?:\.(\d+))?$/;

/**
 * Converts a Horizon decimal balance string to stroops without floating-point math.
 */
export function horizonBalanceToStroops(balance: string): bigint {
  const trimmed = balance.trim();
  const match = trimmed.match(HORIZON_BALANCE_REGEX);

  if (!match) {
    return 0n;
  }

  const wholePart = match[1];
  const fractionPart = (match[2] ?? '').padEnd(7, '0').slice(0, 7);
  return BigInt(`${wholePart}${fractionPart}`);
}

/**
 * Minimum account balance for an existing account (payment affordability).
 * Formula: (2 + subentryCount) * baseReserve — no extra subentry.
 */
export function getMinimumBalanceStroops(subentryCount: number): bigint {
  const ledgerEntries = 2n + BigInt(subentryCount);
  return ledgerEntries * STELLAR_BASE_RESERVE_STROOPS;
}

/**
 * Minimum native balance required before adding one trustline subentry.
 * Formula: (2 + subentryCount + 1) * baseReserve + buffer.
 */
export function getMinimumBalanceStroopsForNewTrustline(subentryCount: number): bigint {
  const ledgerEntries = 2n + BigInt(subentryCount) + 1n;
  return ledgerEntries * STELLAR_BASE_RESERVE_STROOPS + TRUSTLINE_RESERVE_BUFFER_STROOPS;
}

/** Decimal XLM minimum for trustline creation — used by legacy Number-based checks. */
export function getMinimumBalanceXlmForNewTrustline(subentryCount: number): number {
  return (
    (2 + subentryCount + 1) * STELLAR_BASE_RESERVE_XLM + TRUSTLINE_RESERVE_BUFFER_XLM
  );
}
