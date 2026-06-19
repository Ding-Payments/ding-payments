export interface AppEnv {
  stellarNetwork: 'testnet' | 'mainnet';
  horizonUrl: string;
  rpcUrl: string;
  usdcIssuer: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Configuration Error: Missing environment variable [${key}]`);
  }
  return value;
};

const network = getEnvVar('EXPO_PUBLIC_STELLAR_NETWORK', 'testnet') as 'testnet' | 'mainnet';
if (network !== 'testnet' && network !== 'mainnet') {
  throw new Error(`Configuration Error: Invalid network profile "${network}". Must be testnet or mainnet.`);
}

const horizonUrl = getEnvVar('EXPO_PUBLIC_HORIZON_URL');
const rpcUrl = getEnvVar('EXPO_PUBLIC_RPC_URL');
const usdcIssuer = getEnvVar('EXPO_PUBLIC_USDC_ISSUER');

// Security Guardrail: Mainnet shouldn't accidentally leak defaults
if (network === 'mainnet') {
  if (horizonUrl.includes('testnet') || rpcUrl.includes('testnet')) {
    throw new Error('Security Guardrail: Mainnet network configuration cannot utilize Testnet node endpoints.');
  }
}

export const env: AppEnv = {
  stellarNetwork: network,
  horizonUrl,
  rpcUrl,
  usdcIssuer,
};
