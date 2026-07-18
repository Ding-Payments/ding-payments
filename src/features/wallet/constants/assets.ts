import { env } from '@/lib/env';

export interface StellarAsset {
  code: string;
  issuer?: string;
  displayName: string;
  decimals: number;
}

export const STELLAR_ASSETS = {
  XLM: {
    code: 'XLM',
    displayName: 'Stellar Lumens',
    decimals: 7,
  },
  USDC: {
    code: 'USDC',
    issuer: env.usdcIssuer,
    displayName: 'USDC',
    decimals: 7,
  },
} as const satisfies Record<string, StellarAsset>;

export type SupportedAssetCode = keyof typeof STELLAR_ASSETS;

export const SUPPORTED_ASSET_CODES = Object.keys(STELLAR_ASSETS) as SupportedAssetCode[];

export function isSupportedAssetCode(value: string): value is SupportedAssetCode {
  return SUPPORTED_ASSET_CODES.includes(value as SupportedAssetCode);
}
