export enum NfcErrorCode {
  UNAVAILABLE = 'UNAVAILABLE',
  DISABLED = 'DISABLED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
  INTERRUPTED = 'INTERRUPTED',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
}

export const NfcErrorMessages: Record<NfcErrorCode, string> = {
  [NfcErrorCode.UNAVAILABLE]: 'NFC no es compatible en este dispositivo.',
  [NfcErrorCode.DISABLED]: 'NFC está deshabilitado. Activa NFC en ajustes para continuar.',
  [NfcErrorCode.TIMEOUT]: 'La operación NFC expiró. Acerca los dispositivos y vuelve a intentar.',
  [NfcErrorCode.CANCELLED]: 'Operación NFC cancelada.',
  [NfcErrorCode.INTERRUPTED]: 'La sesión NFC fue interrumpida por el sistema.',
  [NfcErrorCode.INVALID_PAYLOAD]: 'Solicitud NFC inválida o insegura. No se procesó la petición.',
};

export default NfcErrorCode;
