import { Horizon } from '@stellar/stellar-sdk';

import { env } from '@/lib/env';
import {
  createStellarHorizonClient,
  stellarHorizonClient,
} from './StellarHorizonClient';

jest.mock('@stellar/stellar-sdk', () => {
  const horizonServerInstance = {
    loadAccount: jest.fn(),
    submitTransaction: jest.fn(),
    friendbot: jest.fn(() => ({ call: jest.fn() })),
  };

  return {
    Horizon: {
      Server: jest.fn(() => horizonServerInstance),
    },
    Networks: {
      PUBLIC: 'Public Global Stellar Network ; September 2015',
      TESTNET: 'Test SDF Network ; September 2015',
    },
  };
});

const server = new Horizon.Server('https://horizon-testnet.stellar.org') as unknown as {
  loadAccount: jest.Mock;
  submitTransaction: jest.Mock;
  friendbot: jest.Mock;
};

describe('StellarHorizonClient', () => {
  beforeEach(() => {
    server.loadAccount.mockReset();
    server.submitTransaction.mockReset();
    server.friendbot.mockReset();
  });

  it('stores the configured Horizon URL', () => {
    const client = createStellarHorizonClient('https://horizon-testnet.stellar.org');
    expect(client.horizonUrl).toBe('https://horizon-testnet.stellar.org');
  });

  it('delegates loadAccount to the underlying Horizon server', async () => {
    server.loadAccount.mockResolvedValueOnce({ id: 'GPUB' });

    const client = createStellarHorizonClient('https://horizon-testnet.stellar.org');
    const account = await client.loadAccount('GPUB');

    expect(server.loadAccount).toHaveBeenCalledWith('GPUB');
    expect(account).toEqual({ id: 'GPUB' });
  });

  it('delegates submitTransaction to the underlying Horizon server', async () => {
    server.submitTransaction.mockResolvedValueOnce({ hash: 'abc' });

    const client = createStellarHorizonClient('https://horizon-testnet.stellar.org');
    const tx = { signed: true } as never;
    const response = await client.submitTransaction(tx);

    expect(server.submitTransaction).toHaveBeenCalledWith(tx);
    expect(response).toEqual({ hash: 'abc' });
  });

  it('delegates fundWithFriendbot to the underlying Horizon server', async () => {
    const friendbotCall = jest.fn().mockResolvedValueOnce({});
    server.friendbot.mockReturnValueOnce({ call: friendbotCall });

    const client = createStellarHorizonClient('https://horizon-testnet.stellar.org');
    await client.fundWithFriendbot('GPUB');

    expect(server.friendbot).toHaveBeenCalledWith('GPUB');
    expect(friendbotCall).toHaveBeenCalled();
  });

  it('exposes a shared singleton configured from env', () => {
    expect(stellarHorizonClient.horizonUrl).toBe(env.horizonUrl);
  });
});
