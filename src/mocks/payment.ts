export type PaymentAsset = 'XLM' | 'USDC';

export type PaymentRequest = {
  id: string;
  amount: string;
  asset: PaymentAsset;
  recipient: string;
  recipientAddress: string;
  memo?: string;
  createdAt: string;
};

export type ErrorType = 'nfc_unavailable' | 'timeout' | 'insufficient_balance';

export const MOCK_PAYMENT_REQUEST: PaymentRequest = {
  id: 'pay_mock_001',
  amount: '12.50',
  asset: 'USDC',
  recipient: 'Alice',
  recipientAddress: 'GBXXX...1234',
  memo: 'Coffee ☕',
  createdAt: new Date().toISOString(),
};

export const MOCK_BALANCE = {
  XLM: '245.00',
  USDC: '8.30',
};

export const ERROR_MESSAGES: Record<ErrorType, { title: string; description: string }> = {
  nfc_unavailable: {
    title: 'NFC Unavailable',
    description: 'NFC is not available on this device. Use QR code instead.',
  },
  timeout: {
    title: 'Connection Timed Out',
    description: 'No device was detected nearby. Please try again.',
  },
  insufficient_balance: {
    title: 'Insufficient Balance',
    description: "You don't have enough funds to complete this payment.",
  },
};
