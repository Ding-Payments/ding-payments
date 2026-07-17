import { createMockNfcService, type NfcService } from '@/features/nfc/services/NfcService.types';

export const nfcService: NfcService = createMockNfcService({
  isSupported: async () => false,
  isEnabled: async () => false,
});

export default nfcService;
