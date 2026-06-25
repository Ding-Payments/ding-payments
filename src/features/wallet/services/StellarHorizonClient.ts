import * as StellarSdk from '@stellar/stellar-sdk';
import { env } from '@/lib/env';
import type { HorizonAccountResponse, HorizonPaymentsResponse, HorizonTransactionResponse } from './types';
import { mapHorizonError } from './horizonErrors';

export class StellarHorizonClient {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;

  constructor() {
    this.server = new StellarSdk.Horizon.Server(env.horizonUrl);
    this.networkPassphrase =
      env.stellarNetwork === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC;
  }

  getNetworkPassphrase(): string {
    return this.networkPassphrase;
  }

  async getAccount(publicKey: string): Promise<HorizonAccountResponse> {
    try {
      const account = await this.server.accounts().accountId(publicKey).call();
      return {
        id: account.id,
        account_id: account.account_id,
        sequence: account.sequence,
        balances: account.balances.map((b) => ({
          balance: b.balance,
          asset_type: b.asset_type,
          asset_code: 'asset_code' in b ? b.asset_code : undefined,
          asset_issuer: 'asset_issuer' in b ? b.asset_issuer : undefined,
        })),
        signers: (account.signers || []).map((s) => ({
          key: s.key,
          type: s.type,
          weight: s.weight,
        })),
        thresholds: account.thresholds,
      };
    } catch (error) {
      throw mapHorizonError(error);
    }
  }

  async submitTransaction(
    transaction: StellarSdk.Transaction,
  ): Promise<HorizonTransactionResponse> {
    try {
      const result = await this.server.submitTransaction(transaction);
      return {
        hash: result.hash,
        ledger: result.ledger,
        created_at: '',
        envelope_xdr: result.envelope_xdr,
        result_xdr: result.result_xdr,
      };
    } catch (error) {
      throw mapHorizonError(error);
    }
  }

  async getPayments(
    publicKey: string,
    limit = 10,
  ): Promise<HorizonPaymentsResponse> {
    try {
      const collection = await this.server
        .payments()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .call();

      const records = collection.records.map((op) => {
        const rec = {
          id: op.id,
          type: op.type,
          amount: '0',
          asset_type: 'native' as string,
          from: '',
          to: '',
          created_at: op.created_at,
        };

        const paymentFields = op as unknown as Record<string, unknown>;
        if (typeof paymentFields.amount === 'string') rec.amount = paymentFields.amount;
        if (typeof paymentFields.asset_type === 'string') rec.asset_type = paymentFields.asset_type;
        if (typeof paymentFields.from === 'string') rec.from = paymentFields.from;
        if (typeof paymentFields.to === 'string') rec.to = paymentFields.to;
        if (typeof paymentFields.funder === 'string') rec.from = paymentFields.funder;
        if (typeof paymentFields.account === 'string') rec.to = paymentFields.account;
        if (typeof paymentFields.starting_balance === 'string') rec.amount = paymentFields.starting_balance;

        return rec;
      });

      return { records };
    } catch (error) {
      throw mapHorizonError(error);
    }
  }
}
