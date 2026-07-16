# Ding Payments — Mobile Client MVP

Peer-to-peer contactless (NFC) payments on Stellar with a self-custodial wallet and passkey authentication.

## Prerequisites

- **Node.js** v20+
- **npm**
- **Xcode** (iOS) or **Android Studio** (Android)
- Physical NFC devices for end-to-end NFC validation

> **Expo Go is not supported.** NFC and passkeys require a **development build** (`npx expo run:ios` or `npx expo run:android`).

## Setup

1. Clone and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start Metro:

   ```bash
   npx expo start
   ```

## NFC development (C10)

The NFC core stack lives under `src/features/nfc/`:

| Module | Purpose |
|--------|---------|
| `services/NfcService.*` | Native abstraction (support checks, sessions) |
| `schemas/paymentRequest.ts` | Zod schema for `payment_request.v1` payloads |
| `services/NfcPayloadCodec.ts` | Compact JSON encode/decode with size guard |
| `services/NfcWriter.ts` / `NfcReader.ts` | Writer (receiver) and reader (payer) sessions |
| `state/nfcSessionStore.ts` | Session state machine + `nfcActive` lock coordination |
| `services/nfc-spike.ts` | Manual PoC helpers for device verification |

### Rebuild after native changes

Any change to `app.config.ts` NFC plugin settings requires a native rebuild:

```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

### Smoke test on device

```typescript
import { nfcSpikeCheckSupport } from '@/features/nfc/services/nfc-spike';

const { supported, enabled } = await nfcSpikeCheckSupport();
```

See [docs/adr-nfc-library.md](docs/adr-nfc-library.md) for platform constraints and payload limits (880 bytes max).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Open iOS simulator / device |
| `npm run android` | Open Android emulator / device |
| `npm test` | Run unit tests (schema, codec, session store) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint via Expo |

## Documentation

- [Product flows & system definition](docs/ding-payments.md)
- [Client MVP build plan](docs/build-plan-client-mvp.md)
- [NFC library ADR](docs/adr-nfc-library.md)

## License

MIT
