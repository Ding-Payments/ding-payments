# Features Domain Slices

This directory enforces vertical feature slices. Each folder represents an isolated functional scope of the app.

### Slices
- `auth/` - Passkey registration, session tracking.
- `wallet/` - Stellar keypairs, balances, cryptographic secure storage.
- `receive/` - QR codes, payment URIs, incoming operations.
- `send/` - Transaction build pipelines, payment execution.
- `history/` - Ledger audit chains, operations lists.
