import { Buffer } from 'buffer';
import process from 'process';
import 'react-native-get-random-values';
import { Horizon, Keypair } from '@stellar/stellar-sdk';

export type StellarSpikeResult =
  | { success: true; publicKey: string; secretKey: string; accountData: unknown }
  | { success: false; reason: string };

export async function runStellarSpike(horizonUrl = 'https://horizon-testnet.stellar.org'): Promise<StellarSpikeResult> {
  try {
    globalThis.Buffer = globalThis.Buffer || (Buffer as typeof globalThis.Buffer);
    globalThis.process = globalThis.process || process;

    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    const server = new Horizon.Server(horizonUrl);
    const accountData = await server.loadAccount(publicKey);

    return {
      success: true,
      publicKey,
      secretKey,
      accountData,
    };
  } catch (error: unknown) {
    return {
      success: false,
      reason: error instanceof Error ? error.message : 'Unknown Stellar spike error.',
    };
  }
}
