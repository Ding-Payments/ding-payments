import { Platform } from 'react-native';
import NfcManager, { NfcEvents, NfcTech, Ndef, type TagEvent } from 'react-native-nfc-manager';

import { NFC_PAYMENT_MIME_TYPE } from '@/features/nfc/constants/nfcConstants';
import {
  NfcError,
  type NfcReaderSessionOptions,
  type NfcService,
  type NfcWriterSessionOptions,
  toNfcError,
} from '@/features/nfc/services/NfcService.types';

type AndroidNfcManager = typeof NfcManager & {
  setNdefPushMessage?: (bytes: number[] | null) => Promise<void>;
};

const nfcManager = NfcManager as AndroidNfcManager;

let sessionKind: 'reader' | 'writer' | null = null;

function payloadFromTag(tag: TagEvent): Uint8Array | null {
  for (const record of tag.ndefMessage ?? []) {
    if (Ndef.isType(record, Ndef.TNF_MIME_MEDIA, NFC_PAYMENT_MIME_TYPE)) {
      return new Uint8Array(record.payload);
    }

    if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
      const text = Ndef.text.decodePayload(new Uint8Array(record.payload));
      return new TextEncoder().encode(text);
    }
  }

  return null;
}

function buildNdefMessage(payload: Uint8Array): number[] {
  const record = Ndef.record(
    Ndef.TNF_MIME_MEDIA,
    NFC_PAYMENT_MIME_TYPE,
    [],
    Array.from(payload),
  );

  return Ndef.encodeMessage([record]);
}

async function cleanupSession(): Promise<void> {
  NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
  NfcManager.setEventListener(NfcEvents.SessionClosed, null);

  await NfcManager.unregisterTagEvent().catch(() => undefined);
  await NfcManager.cancelTechnologyRequest({ throwOnError: false }).catch(() => undefined);

  if (Platform.OS === 'android') {
    await nfcManager.setNdefPushMessage?.(null).catch(() => undefined);
  }

  sessionKind = null;
}

export const nfcService: NfcService = {
  async isSupported() {
    try {
      return await NfcManager.isSupported();
    } catch {
      return false;
    }
  },

  async isEnabled() {
    try {
      return await NfcManager.isEnabled();
    } catch {
      return false;
    }
  },

  async start() {
    await NfcManager.start();
  },

  async stop() {
    await cleanupSession();
  },

  async cancelSession() {
    await cleanupSession();
  },

  async startReaderSession(options: NfcReaderSessionOptions) {
    if (sessionKind) {
      throw new NfcError('SESSION_ACTIVE', 'An NFC session is already active');
    }

    sessionKind = 'reader';
    await NfcManager.start();

    NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: TagEvent) => {
      try {
        const payload = payloadFromTag(tag);
        if (!payload) {
          options.onError?.(new NfcError('EMPTY_NDEF', 'No payment payload found in NDEF message'));
          return;
        }

        options.onPayload(payload);
      } catch (error) {
        options.onError?.(toNfcError(error));
      }
    });

    await NfcManager.registerTagEvent({
      alertMessage: options.alertMessage ?? 'Hold your phone near the receiver device',
      invalidateAfterFirstRead: true,
      isReaderModeEnabled: Platform.OS === 'android',
    });
  },

  async startWriterSession(payload: Uint8Array, options: NfcWriterSessionOptions = {}) {
    if (sessionKind) {
      throw new NfcError('SESSION_ACTIVE', 'An NFC session is already active');
    }

    sessionKind = 'writer';
    await NfcManager.start();

    const bytes = buildNdefMessage(payload);

    if (Platform.OS === 'android') {
      await nfcManager.setNdefPushMessage?.(bytes);
      options.onSuccess?.();
      return;
    }

    NfcManager.setEventListener(NfcEvents.DiscoverTag, async () => {
      try {
        await NfcManager.requestTechnology(NfcTech.Ndef, {
          alertMessage: options.alertMessage ?? 'Hold your phone near the payer device',
        });
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        options.onSuccess?.();
      } catch (error) {
        options.onError?.(toNfcError(error));
      } finally {
        await NfcManager.cancelTechnologyRequest({ throwOnError: false }).catch(() => undefined);
      }
    });

    await NfcManager.registerTagEvent({
      alertMessage: options.alertMessage ?? 'Ready to share payment request',
      invalidateAfterFirstRead: false,
    });
  },
};

export default nfcService;
