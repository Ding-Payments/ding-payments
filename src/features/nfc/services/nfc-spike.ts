import { Buffer } from 'buffer';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

export type NfcSpikeResult =
  | { success: true; message: string }
  | { success: false; reason: string };

const JSON_TAG_TYPE = 'application/vnd.ding-payments.v1+json';

export async function initializeNfcSpike(): Promise<{ supported: boolean; details: string }> {
  const supported = await NfcManager.isSupported();
  return {
    supported,
    details: supported
      ? 'NFC is supported in this runtime. Use a dev-client build with native NFC permission configured.'
      : 'NFC is not supported in this runtime. Ensure the runtime is a native dev-client with NFC support.',
  };
}

export async function writeNdefJsonPayload(
  payload: Record<string, unknown>
): Promise<NfcSpikeResult> {
  try {
    await NfcManager.start();
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const jsonString = JSON.stringify(payload);
    const record = Ndef.record(
      Ndef.TNF_MIME_MEDIA,
      JSON_TAG_TYPE,
      [],
      Array.from(Buffer.from(jsonString, 'utf8'))
    );

    // nfc-manager v3 writes an encoded NDEF byte message through the Ndef tech
    // handler (the top-level NfcManager.writeNdefMessage was removed).
    const bytes = Ndef.encodeMessage([record]);
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
    await NfcManager.cancelTechnologyRequest();

    return { success: true, message: `Wrote ${jsonString.length} bytes payload` };
  } catch (error: any) {
    return { success: false, reason: error?.message ?? 'NFC write failed.' };
  }
}

export async function readNdefJsonPayload(): Promise<NfcSpikeResult> {
  try {
    await NfcManager.start();
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const tag = await NfcManager.getTag();
    await NfcManager.cancelTechnologyRequest();

    const ndefMessage = tag?.ndefMessage;
    if (!ndefMessage || !ndefMessage.length) {
      return { success: false, reason: 'No NDEF message found on tag.' };
    }

    const record = ndefMessage[0];
    const payload = record.payload;
    const text = Buffer.from(payload).toString('utf8');
    JSON.parse(text);

    return { success: true, message: `Read JSON payload (${text.length} bytes)` };
  } catch (error: any) {
    return { success: false, reason: error?.message ?? 'NFC read failed.' };
  }
}
