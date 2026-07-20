# NFC flow and troubleshooting

This document describes the NFC handshake, security constraints, and common troubleshooting steps for developers and beta testers.

Overview
- Roles: Writer (sender) and Reader (receiver).
- Format: `payment-request.v1` JSON payload with non-sensitive fields only.

Handshake
1. Writer prepares `payment-request.v1` payload with `id` and optional `expiresAt` (epoch seconds).
2. Reader calls `useNfc().startReading()` and waits for inbound payload.
3. On read, the app validates payload using `validatePaymentRequest()` which enforces expiry and replay dedupe.
4. If valid, proceed to presentation/confirm UI. If invalid, surface mapped Spanish error copy.

Security rules
- Forbidden fields: secret, private, seed, token, passphrase, password, privKey, keyPair.
- Replay protection: 5-minute TTL dedupe window; duplicate requests rejected deterministically.
- Clock skew tolerance: 30s default; configurable in validator.

Platform notes
- iOS: Core NFC requires entitlement `com.apple.developer.nfc.readersession.formats` and `NFCReaderUsageDescription` in Info.plist. Only physical devices supported.
- Android: Add `android.permission.NFC` and handle foreground dispatch. Test on Pixel and Samsung-class devices.

Troubleshooting
- NFC Unavailable: ensure device supports NFC and app has permissions.
- NFC Disabled: ask user to enable in OS settings.
- Timeout: ask users to bring devices closer and retry.
