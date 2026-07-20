import { SendHomeView } from '@/features/send/views/SendHomeView';
import { NfcAvailabilityBanner } from '@/features/nfc/components/NfcAvailabilityBanner';

export default function SendScreen() {
  return (
    <>
      <NfcAvailabilityBanner />
      <SendHomeView />
    </>
  );
}
