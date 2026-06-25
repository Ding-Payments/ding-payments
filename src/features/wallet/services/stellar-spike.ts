import { Buffer } from 'buffer';
import process from 'process';
import 'react-native-get-random-values';
import * as StellarSdk from '@stellar/stellar-sdk';

export type StellarSpikeResult =
  | { success: true; publicKey: string; secretKey: string; accountData: unknown }
  | { success: false; reason: string };

export async function runStellarSpike(horizonUrl = 'https://horizon-testnet.stellar.org'): Promise<StellarSpikeResult> {
  try {
    globalThis.Buffer = globalThis.Buffer || (Buffer as any);
    globalThis.process = globalThis.process || process;

    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    const server = new StellarSdk.Horizon.Server(horizonUrl);
    const accountData = await server.accounts().accountId(publicKey).call();

    return {
      success: true,
      publicKey,
      secretKey,
      accountData,
    };
  } catch (error: any) {
    return {
      success: false,
      reason: error?.message ?? 'Unknown Stellar spike error.',
    };
  }
}
