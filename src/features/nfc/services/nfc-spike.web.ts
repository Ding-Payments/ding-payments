export type NfcSpikeResult =
  | { success: true; message: string }
  | { success: false; reason: string };

export async function initializeNfcSpike(): Promise<{ supported: boolean; details: string }> {
  return {
    supported: false,
    details: 'Web runtime does not support native NFC. Use a native dev-client for NFC validation.',
  };
}

export async function writeNdefJsonPayload(): Promise<NfcSpikeResult> {
  return {
    success: false,
    reason: 'NFC write is not supported on web.',
  };
}

export async function readNdefJsonPayload(): Promise<NfcSpikeResult> {
  return {
    success: false,
    reason: 'NFC read is not supported on web.',
  };
}
