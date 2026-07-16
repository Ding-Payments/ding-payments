# ADR: Passkey library selection for Expo mobile

- Status: Accepted
- Date: 2026-06-19
- Related: C05, CLI-013

## Context

The Ding Payments mobile MVP requires device-backed passkey registration and authentication on iOS and Android devices. Expo Go cannot support native passkey flows, so the solution must be validated in a development build or custom native runtime.

## Decision

We will adopt `react-native-passkey` as the primary passkey research library for the Ding Payments Expo app.

### Why this library?

- It targets native mobile passkey workflows rather than browser-only WebAuthn fallbacks.
- It supports native credential creation and authentication with biometric/user-verifier prompts on device.
- It is compatible with Expo dev-client / prebuild flows, which is required for this spike.

### Alternatives considered

- `@passkey/react-native`: a second candidate with similar native binding goals, but less community adoption at the time of research.
- Custom native module wrapper around platform WebAuthn/passkey APIs: higher development cost and risk compared to reusing an existing library.
- Local biometric-protected secret flow: only as a fallback if native passkey integration proves infeasible.

## Version pinning

- `react-native-passkey@^0.0.7`

## Compatibility matrix

- iOS: expected support on iOS 16+ devices with passkey capability.
- Android: expected support on Android 12+ devices with a device-backed keystore.
- Expo Go: unsupported for passkey verification and must use a dev-client or custom build.

## Implementation notes

- The spike is isolated under `src/features/auth/services/passkey-spike.ts` to avoid polluting production service interfaces.
- The ADR is validated through the PoC page at `/c05` after running the Expo dev-client.
- The library must be validated on at least one physical iOS and one physical Android device before moving to C06.
- The app configuration will preserve Expo plugin compatibility and require native rebuilds after install.

## Validation matrix

- iOS physical device: passkey init, credential creation, authenticate success.
- Android physical device: passkey init, credential creation, authenticate success.
- Expo Go: unsupported, explicit dev-client build required.

## Manual validation note

Use the `/c05` test page in the dev-client to execute the passkey flows and capture results for the ADR appendix.

## Rollback plan

If `react-native-passkey` fails to meet compatibility or runtime requirements:

1. Evaluate a second candidate such as `@passkey/react-native` or a custom native module wrapper.
2. If native passkeys remain blocked, fall back to a biometric-protected local secret flow while preserving the ADR's passkey decision path.

## Known limitations

- Passkey support is not available in Expo Go.
- The selected library may require native build configuration changes and extra plugin wiring.
- Wider OS/version coverage must be confirmed beyond the initial device tests.
- Rollout may require separate logic for unsupported devices or biometric-only fallback paths.
