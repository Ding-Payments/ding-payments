import { SecureKeyStore } from '@/lib/SecureKeyStore';

const WALLET_SECRET_KEY_PREFIX = 'ding_wallet_secret_';

export class WalletKeyStore {
  private secureKeyStore: SecureKeyStore;

  constructor() {
    this.secureKeyStore = new SecureKeyStore();
  }

  private secretKeyFor(publicKey: string): string {
    return `${WALLET_SECRET_KEY_PREFIX}${publicKey}`;
  }

  async saveSecret(publicKey: string, secretKey: string): Promise<void> {
    await this.secureKeyStore.set(
      this.secretKeyFor(publicKey),
      secretKey,
    );
  }

  async loadSecret(publicKey: string): Promise<string | null> {
    return this.secureKeyStore.get(this.secretKeyFor(publicKey));
  }

  async removeSecret(publicKey: string): Promise<void> {
    await this.secureKeyStore.delete(this.secretKeyFor(publicKey));
  }

  async hasSecret(publicKey: string): Promise<boolean> {
    const secret = await this.secureKeyStore.get(
      this.secretKeyFor(publicKey),
    );
    return secret !== null;
  }
}
