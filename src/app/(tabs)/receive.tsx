import { ReceiveHomeView } from '@/features/receive/views/ReceiveHomeView';
import { NfcAvailabilityBanner } from '@/features/nfc/components/NfcAvailabilityBanner';

export default function ReceiveScreen() {
  return (
    <>
      <NfcAvailabilityBanner />
      <ReceiveHomeView />
    </>
  );
}
