import { WalletService } from '../WalletService';

jest.mock('@/lib/SecureKeyStore', () => ({
  SecureKeyStore: jest.fn().mockImplementation(() => ({
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('@/lib/env', () => ({
  env: {
    stellarNetwork: 'testnet',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    usdcIssuer: 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
}));

describe('WalletService', () => {
  let walletService: WalletService;

  beforeEach(() => {
    walletService = new WalletService();
  });

  describe('generateKeypair', () => {
    it('should generate a valid Stellar public key', () => {
      const result = walletService.generateKeypair();
      expect(result.publicKey).toMatch(/^G[A-Z0-9]{55}$/);
    });

    it('should not expose the secret key in the return value', () => {
      const result = walletService.generateKeypair();
      expect('secretKey' in result).toBe(false);
    });
  });

  describe('generateAndPersistKeypair', () => {
    it('should generate and persist a keypair returning only public key', async () => {
      const result = await walletService.generateAndPersistKeypair();
      expect(result.publicKey).toMatch(/^G[A-Z0-9]{55}$/);
      expect('secretKey' in result).toBe(false);
    });
  });

  describe('validatePublicKey', () => {
    it('should return true for a valid Stellar public key', () => {
      const { publicKey } = walletService.generateKeypair();
      expect(walletService.validatePublicKey(publicKey)).toBe(true);
    });

    it('should return false for an invalid public key', () => {
      expect(walletService.validatePublicKey('invalid_key')).toBe(false);
    });

    it('should return false for a secret key', () => {
      expect(walletService.validatePublicKey('SAV75E2NK7Q5JZZLBBBNS7QECW2AYYRESIS6YBJYMPB7XMOV')).toBe(false);
    });

    it('should return false for an empty string', () => {
      expect(walletService.validatePublicKey('')).toBe(false);
    });
  });
});
