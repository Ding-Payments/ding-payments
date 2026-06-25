export type WalletStatus = 'none' | 'generating' | 'unfunded' | 'funding' | 'ready' | 'error';

export interface WalletState {
  status: WalletStatus;
  publicKey: string | null;
  error: string | null;
}

export interface WalletActions {
  generateWallet: () => Promise<void>;
  checkFunding: () => Promise<void>;
  reset: () => void;
  setError: (error: string) => void;
}

export type WalletStore = WalletState & WalletActions;

export interface HorizonAccountResponse {
  id: string;
  account_id: string;
  sequence: string;
  balances: Array<{
    balance: string;
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
  }>;
  signers: Array<{ key: string; type: string; weight: number }>;
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
}

export interface HorizonPaymentRecord {
  id: string;
  type: string;
  amount: string;
  asset_type: string;
  from: string;
  to: string;
  created_at: string;
}

export interface HorizonPaymentsResponse {
  records: HorizonPaymentRecord[];
}

export interface HorizonTransactionResponse {
  hash: string;
  ledger: number;
  created_at: string;
  envelope_xdr: string;
  result_xdr: string;
}
