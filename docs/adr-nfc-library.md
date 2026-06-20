# ADR: NFC library selection for Expo mobile

- Status: Accepted
- Date: 2026-06-19
- Related: C05, CLI-045

## Context

The app needs NFC NDEF read/write support for payment request payloads on physical devices. Expo Go cannot be used for this verification, so the runtime must be validated in a dev-client or custom native build.

## Decision

We will use `react-native-nfc-manager` for NFC integration.

### Why this library?

- It is the most mature React Native NFC library with both Android and iOS support.
- It supports NDEF scanning and writing flows needed for payment request roundtrips.
- It is compatible with Expo native builds and supports the required native permissions.

### Alternatives considered

- `react-native-hce` or similar NFC libraries: considered weaker in NDEF support for both platforms.
- Custom native Objective-C/Java modules: higher maintenance risk and slower validation.
- NFC-only web alternatives: rejected because the client must validate native NFC behavior on devices.

## Version pinning

- `react-native-nfc-manager@^3.4.0`

## Compatibility matrix

- iOS: Core NFC supported on devices with NFC hardware and iOS 13+; iOS only supports NDEF tag discovery for this spike.
- Android: NFC requires `android.permission.NFC`; supported devices must have NFC hardware enabled.
- Expo Go: unsupported for NFC runtime validation.

## Implementation notes

- App configuration is updated in `app.config.ts` to declare Android NFC permission and iOS NFC usage description.
- The spike implementation is isolated at `src/features/nfc/services/nfc-spike.ts`.
- The roundtrip payload for JSON NDEF should be capped to a safe practical limit, typically under 880 bytes.
- The ADR is validated through the PoC page at `/c05` after running the Expo dev-client.

## Validation matrix

- Android physical device: NFC initialization and NDEF write/read roundtrip works.
- iOS physical device: NFC initialization and NDEF read/write behave as expected under Core NFC constraints.
- Payload size validation: JSON payload remains below 880 bytes and roundtrip is successful on both test devices.

## Manual validation note

Use the `/c05` test page in the dev-client to execute NFC write/read flows and capture the exact read/write behavior in the ADR appendix.

## Rollback plan

If `react-native-nfc-manager` is incompatible with the Expo dev-client:

1. Re-evaluate with a custom `expo prebuild` workflow and explicit native module linking.
2. If the library cannot be used, isolate NFC support behind a modular adapter and retain the ability to switch to a different NFC package or a pure native module.

## Known limitations

- Payload size: JSON roundtrip payloads must be kept small to avoid tag write/read failures.
- Platform differences: iOS and Android may behave differently, so the ADR must capture exact device compatibility notes.
- Native build required: NFC validation is only reliable on an Expo dev-client or prebuilt binary.
- iOS Core NFC only supports certain tag types and cannot run on simulator hardware.
