# ADR: NFC Library Selection — react-native-nfc-manager

- **Status:** Accepted
- **Date:** 2026-06-19
- **Related:** C05 (CLI-045), C10 (CLI-046–052)

## Context

Ding Payments requires peer-to-peer NFC transport for payment-request payloads on iOS and Android. Expo Go does not expose native NFC APIs; a development build is mandatory.

## Decision

Use **react-native-nfc-manager** (v3.17+) with the official Expo config plugin.

### Why this library?

- Mature NDEF read/write APIs on Android and Core NFC on iOS
- Official Expo config plugin for permissions and entitlements
- Active maintenance and broad community usage
- Fits the abstraction layer (`NfcService`) without leaking native details to product code

### Alternatives considered

| Option | Rejected because |
|--------|------------------|
| `react-native-hce` or similar | Weaker NDEF support across both platforms |
| Custom native modules | Higher maintenance; slower validation |
| Expo Go only | No NFC access |
| QR-only | Out of scope for C10; planned as fallback |

## Version pinning

- `react-native-nfc-manager@^3.17.2`

## Platform constraints

| Platform | Capability | Notes |
|----------|------------|-------|
| Android | NDEF push + tag reader mode | Primary P2P path via `setNdefPushMessage` |
| iOS | Core NFC reader / NDEF write to tags | P2P limited; validate on physical hardware |
| Web | Not supported | Stub returns `isSupported: false` |
| Expo Go | Not supported | Requires dev build rebuild after native changes |

## Payload limits

- **Max NDEF payload:** 880 bytes (conservative; typical Type 2 tag usable ~888 bytes minus overhead)
- **Encoding:** UTF-8 compact JSON (`application/json` MIME NDEF record)
- **Schema:** `payment_request.v1` — see `src/features/nfc/schemas/paymentRequest.ts`

## Permissions

### iOS

- `NFCReaderUsageDescription` in Info.plist (via config plugin)
- NDEF entitlement: `com.apple.developer.nfc.readersession.formats` (via `includeNdefEntitlement: true`)

### Android

- `android.permission.NFC` in AndroidManifest (via config plugin)
- Minimum SDK enforced by plugin (API 31+)

## Session semantics (C10)

| Session | Timeout | Policy |
|---------|---------|--------|
| Writer (receiver) | 60s | Auto-cancel + resource cleanup |
| Reader (payer) | 45s | Single-read per session; ignore duplicates |

## Validation matrix

- Android physical device: NFC initialization and NDEF write/read roundtrip works
- iOS physical device: NFC read/write under Core NFC constraints
- Payload size validation: JSON payload remains below 880 bytes
- PoC page: `/c05` in dev-client for spike flows; C10 services in `src/features/nfc/`

## Rebuild requirement

Any change to `app.config.ts` NFC plugin settings requires:

```bash
npx expo prebuild --clean
npx expo run:ios   # or run:android
```

## Rollback plan

If `react-native-nfc-manager` is incompatible with the Expo dev-client:

1. Re-evaluate with explicit native module linking via `expo prebuild`
2. Isolate NFC behind `NfcService` adapter to swap library without UI changes

## References

- [react-native-nfc-manager Expo wiki](https://github.com/revtel/react-native-nfc-manager/wiki/Expo-Go)
- Product spec: `docs/ding-payments.md` — Proposed Payment Payload Structure
