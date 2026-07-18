/** Maximum NDEF payload size in bytes (see docs/adr-nfc-library.md). */
export const MAX_NDEF_PAYLOAD_BYTES = 880;

/** MIME type for payment-request NDEF records. */
export const NFC_PAYMENT_MIME_TYPE = 'application/json';

/** Writer session timeout (receiver broadcasting request). */
export const NFC_WRITER_TIMEOUT_MS = 60_000;

/** Reader session timeout (payer scanning for request). */
export const NFC_READER_TIMEOUT_MS = 45_000;
