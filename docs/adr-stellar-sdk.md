# ADR: Stellar SDK selection for Expo mobile

- Status: Accepted
- Date: 2026-06-19
- Related: C05, CLI-027

## Context

The mobile wallet requires Stellar keypair generation and Horizon network connectivity in an Expo development client. The SDK must run in a React Native bundle that does not provide Node.js built-ins by default.

## Decision

We will use `@stellar/stellar-sdk` with explicit runtime polyfills for React Native.

### Why this library?

- It is the official Stellar JavaScript SDK with direct Horizon client support.
- It supports keypair generation, transaction building, and account queries.
- It is already part of the project stack in the design plan and is the best aligned SDK for Stellar network integration.

### Alternatives considered

- A smaller custom wrapper around Horizon REST APIs using `fetch` and separate Ed25519 key management.
- A lighter Stellar-compatible library with fewer Node.js dependencies, but which lacked official maintenance or full keypair support.
- Offloading Stellar operations to a backend service, which would violate the goal of client-side wallet proof-of-concept.

## Version pinning

- `@stellar/stellar-sdk@^9.6.0`
- `react-native-get-random-values@^1.0.2`
- `buffer@^6.0.3`
- `process@^0.11.10`
- `stream-browserify@^3.0.0`
- `crypto-browserify@^3.19.2`

## Compatibility notes

- Expo dev-client: required for runtime validation because the normal Expo Go bundle may not include the polyfills needed by Stellar SDK.
- Node polyfills: the wallet spike must initialize `Buffer`, `process`, and browser-compatible crypto/random value shims before using the SDK.
- Bundle impact: `@stellar/stellar-sdk` increases JS payload size and requires explicit dependency management.

## Implementation notes

- The spike implementation is isolated at `src/features/wallet/services/stellar-spike.ts`.
- The proof-of-concept must perform `Keypair.random()` and a Horizon testnet `accounts().accountId(...).call()` query.
- Package-level polyfill imports should remain isolated from production wallet interfaces until the ADR is fully ratified.
- The ADR is validated through the PoC page at `/c05` after running the Expo dev-client.

## Validation matrix

- Expo dev-client: Stellar keypair generation executes without bundle crash.
- Expo dev-client: Horizon testnet account query executes and returns a valid response or clearly documented account-not-found behavior.
- Expo Go: unsupported for the full polyfill-based Stellar runtime.

## Manual validation note

Use the `/c05` test page in the dev-client to execute the Stellar spike and capture the testnet response in the ADR appendix.

## Rollback plan

If `@stellar/stellar-sdk` cannot be made stable in Expo dev-client:

1. Evaluate a lighter alternative or a custom network wrapper around Stellar Horizon REST APIs.
2. Preserve keypair generation with a minimal cryptography library and use REST-based horizon access via `fetch`.

## Known limitations

- Runtime behavior must be validated on physical devices or the Expo dev-client because the bundle relies on polyfills not present in Expo Go.
- SDK updates may change bundling requirements; pinning is essential to avoid drift.
- The `Buffer` and `process` polyfills increase bundle size and require explicit Metro config support.
