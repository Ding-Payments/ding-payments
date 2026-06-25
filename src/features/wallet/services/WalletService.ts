import * as StellarSdk from '@stellar/stellar-sdk';
import { WalletKeyStore } from './WalletKeyStore';

const STELLAR_PUBKEY_REGEX = /^G[A-Z0-9]{55}$/;

export interface GeneratedKeypair {
  publicKey: string;
}

export class WalletService {
  private keyStore: WalletKeyStore;

  constructor() {
    this.keyStore = new WalletKeyStore();
  }

  generateKeypair(): GeneratedKeypair {
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    if (!STELLAR_PUBKEY_REGEX.test(publicKey)) {
      throw new Error('Generated invalid Stellar public key');
    }

    return { publicKey };
  }

  async generateAndPersistKeypair(): Promise<GeneratedKeypair> {
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    if (!STELLAR_PUBKEY_REGEX.test(publicKey)) {
      throw new Error('Generated invalid Stellar public key');
    }

    await this.keyStore.saveSecret(publicKey, secretKey);

    return { publicKey };
  }

  async hasStoredWallet(): Promise<boolean> {
    return this.keyStore.hasSecret('stored');
  }

  async getStoredPublicKey(): Promise<string | null> {
    const stored = await this.keyStore.loadSecret('stored');
    return stored;
  }

  async storePublicKey(publicKey: string): Promise<void> {
    await this.keyStore.saveSecret('stored', publicKey);
  }

  async getSecretKey(publicKey: string): Promise<string | null> {
    return this.keyStore.loadSecret(publicKey);
  }

  async removeWallet(publicKey: string): Promise<void> {
    await this.keyStore.removeSecret(publicKey);
    await this.keyStore.removeSecret('stored');
  }

  validatePublicKey(publicKey: string): boolean {
    return STELLAR_PUBKEY_REGEX.test(publicKey);
  }
}
