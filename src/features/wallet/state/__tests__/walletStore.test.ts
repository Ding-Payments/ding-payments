import { useWalletStore } from '../walletStore';
import { HorizonAccountNotFoundError } from '@/features/wallet/services/horizonErrors';

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

jest.mock('@/features/wallet/services/StellarHorizonClient', () => {
  const mockGetAccount = jest.fn();
  return {
    StellarHorizonClient: Object.assign(
      jest.fn().mockImplementation(() => ({
        getNetworkPassphrase: () => 'Test SDF Network ; September 2015',
        getAccount: mockGetAccount,
        submitTransaction: jest.fn(),
        getPayments: jest.fn(),
      })),
      { __mockGetAccount: mockGetAccount },
    ),
  };
});

jest.mock('@/features/wallet/services/WalletService', () => {
  const mockGenerate = jest.fn();
  return {
    WalletService: Object.assign(
      jest.fn().mockImplementation(() => ({
        generateKeypair: jest.fn(),
        generateAndPersistKeypair: mockGenerate,
        storePublicKey: jest.fn().mockResolvedValue(undefined),
        removeWallet: jest.fn().mockResolvedValue(undefined),
        validatePublicKey: jest.fn(),
        getSecretKey: jest.fn(),
        hasStoredWallet: jest.fn(),
        getStoredPublicKey: jest.fn(),
      })),
      { __mockGenerate: mockGenerate },
    ),
  };
});

function getStellarHorizonMock() {
  return jest.requireMock('@/features/wallet/services/StellarHorizonClient').StellarHorizonClient;
}

function getWalletServiceMock() {
  return jest.requireMock('@/features/wallet/services/WalletService').WalletService;
}

describe('walletStore', () => {
  beforeEach(() => {
    useWalletStore.setState({
      status: 'none',
      publicKey: null,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start with none status', () => {
    const state = useWalletStore.getState();
    expect(state.status).toBe('none');
    expect(state.publicKey).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should transition to generating then unfunded on generateWallet', async () => {
    const validPubKey = 'GA7OPG4E2ELB3U6SP3MGOHMF4OGK5JY2GMLXSTYTAELBDFJKOFPNXJUD';
    getWalletServiceMock().__mockGenerate.mockResolvedValue({ publicKey: validPubKey });

    const store = useWalletStore.getState();
    const generatePromise = store.generateWallet();

    const generatingState = useWalletStore.getState();
    expect(generatingState.status).toBe('generating');

    await generatePromise;

    const finalState = useWalletStore.getState();
    expect(finalState.status).toBe('unfunded');
    expect(finalState.publicKey).toBe(validPubKey);
    expect(finalState.error).toBeNull();
  });

  it('should transition to error when generateWallet fails', async () => {
    getWalletServiceMock().__mockGenerate.mockRejectedValue(
      new Error('Generation failed'),
    );

    const store = useWalletStore.getState();
    await store.generateWallet();

    const finalState = useWalletStore.getState();
    expect(finalState.status).toBe('error');
    expect(finalState.error).toBe('Generation failed');
  });

  it('should reset to none', () => {
    useWalletStore.setState({
      status: 'unfunded',
      publicKey: 'GABCDEF123',
      error: null,
    });
    useWalletStore.getState().reset();
    const state = useWalletStore.getState();
    expect(state.status).toBe('none');
    expect(state.publicKey).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should set error state', () => {
    useWalletStore.getState().setError('Something went wrong');
    const state = useWalletStore.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBe('Something went wrong');
  });

  it('should transition to ready when account is found', async () => {
    const validPubKey = 'GA7OPG4E2ELB3U6SP3MGOHMF4OGK5JY2GMLXSTYTAELBDFJKOFPNXJUD';
    getWalletServiceMock().__mockGenerate.mockResolvedValue({ publicKey: validPubKey });
    getStellarHorizonMock().__mockGetAccount.mockResolvedValue({
      id: validPubKey,
      account_id: validPubKey,
      sequence: '123',
      balances: [],
      signers: [],
      thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
    });

    const store = useWalletStore.getState();
    await store.generateWallet();

    await store.checkFunding();

    const finalState = useWalletStore.getState();
    expect(finalState.status).toBe('ready');
  });

  it('should stay unfunded when account not found on checkFunding', async () => {
    const validPubKey = 'GA7OPG4E2ELB3U6SP3MGOHMF4OGK5JY2GMLXSTYTAELBDFJKOFPNXJUD';
    getWalletServiceMock().__mockGenerate.mockResolvedValue({ publicKey: validPubKey });

    const notFoundError = new HorizonAccountNotFoundError('GABCDEF123');
    getStellarHorizonMock().__mockGetAccount.mockRejectedValue(notFoundError);

    const store = useWalletStore.getState();
    await store.generateWallet();
    expect(useWalletStore.getState().status).toBe('unfunded');

    await store.checkFunding();
    const finalState = useWalletStore.getState();
    expect(finalState.status).toBe('unfunded');
  });

  it('should transition to error on checkFunding failure', async () => {
    const validPubKey = 'GA7OPG4E2ELB3U6SP3MGOHMF4OGK5JY2GMLXSTYTAELBDFJKOFPNXJUD';
    getWalletServiceMock().__mockGenerate.mockResolvedValue({ publicKey: validPubKey });
    getStellarHorizonMock().__mockGetAccount.mockRejectedValue(
      new Error('Network error'),
    );

    const store = useWalletStore.getState();
    await store.generateWallet();

    await store.checkFunding();

    const finalState = useWalletStore.getState();
    expect(finalState.status).toBe('error');
    expect(finalState.error).toBe('Network error');
  });

  it('should error on checkFunding with no public key', async () => {
    const store = useWalletStore.getState();
    await store.checkFunding();
    const state = useWalletStore.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBe('No wallet public key available');
  });
});
