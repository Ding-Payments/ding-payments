# Welcome to your Expo app 👋

# Ding Payments — Mobile Client MVP

This repository contains the core React Native application built with Expo Router and the Soroban Smart Contract SDK for the Ding Payments network.

## 🛠 Prerequisites

- **Node.js**: v18 or later
- **Package Manager**: `npm`
- **Development Target**: Physical iOS or Android device (required for NFC, passkeys, and SecureStore biometrics); simulator/emulator for UI-only work

> ⚠️ Native Framework Limitation: This application leverages advanced hardware integrations including NFC capabilities and Passkey WebAuthn modules. These features cannot execute inside standard Expo Go. You must use an Expo Development Build (EAS Development Build) to validate NFC, passkeys, and SecureStore functionality on physical devices.

## 🚀 Local Development Setup

1. **Clone the Repository & Fetch Dependencies**

   ```bash
   npm install
   ```

2. **Build requirements for native features**
   - NFC and passkey research require an Expo development build or custom native runtime.
   - Run `npx expo prebuild` and `npx expo run:android` / `npx expo run:ios` for device validation.
   - Use `npm run dev-client` to launch a dev-client session after native dependencies are installed.

## EAS Development Build

1. **Install and authenticate EAS CLI**

   ```bash
   npm install -g eas-cli
   eas login
   ```

   On first setup, link the project with `eas init`. Build profiles live in `eas.json` (`development`, `preview`, `production`).

2. **Create a development build**

   ```bash
   npm run dev:build:android
   # or
   npm run dev:build:ios
   ```

   Install the resulting build on a **physical device** (`.apk` on Android; iOS via internal distribution or TestFlight).

3. **Start the dev client**

   ```bash
   npm run dev-client
   ```

   This runs `expo start --dev-client` and connects the installed development build to Metro.

4. **Native rebuild required**
   Rebuild and reinstall the development build after changes to:
   - `app.config.ts` plugins, permissions, or entitlements
   - native dependencies (for example `expo-dev-client`, `expo-secure-store`, `react-native-nfc-manager`, `react-native-passkey`)

   JavaScript-only changes do not require a native rebuild.

5. **Expo Go limitations**
   Do not use Expo Go to validate NFC, passkeys, or SecureStore with biometric authentication. These flows require a development build with `expo-dev-client`.

6. **Simulator vs physical device**

   | Feature                  | Simulator / emulator | Physical device |
   | ------------------------ | -------------------- | --------------- |
   | General UI / routing     | Yes                  | Yes             |
   | NFC                      | No                   | Yes (required)  |
   | Passkeys                 | Limited / unreliable | Yes (required)  |
   | SecureStore + biometrics | Limited              | Yes (required)  |

   Use a physical device for native capability smoke tests, including the `/c05` spike page.

## ✅ Quality checks (CI)

CI (`.github/workflows/ci-client.yml`) runs the exact same npm scripts you run locally, so a green local run means a green pipeline. Run all three before opening a PR:

```bash
npm run build   # tsc --noEmit — type-checks the project
npm run lint    # expo lint (ESLint flat config + Prettier rules)
npm run format  # prettier --write . — auto-formats the repo
```

Helper scripts:

| Script                                | Purpose                                        |
| ------------------------------------- | ---------------------------------------------- |
| `npm run build` / `npm run typecheck` | TypeScript type-check (`tsc --noEmit`)         |
| `npm run lint`                        | Report lint problems (`expo lint`)             |
| `npm run lint:fix`                    | Auto-fix lint problems                         |
| `npm run format`                      | Format all files with Prettier                 |
| `npm run format:check`                | Verify formatting without writing (used by CI) |

Tooling config lives at the repo root: [`eslint.config.mjs`](eslint.config.mjs) (Expo flat config + Prettier) and [`.prettierrc`](.prettierrc) (`singleQuote`, `trailingComma: es5`). Editors with the ESLint and Prettier extensions pick these up automatically.

## C05 Spike documentation

- Passkey ADR: [`docs/adr-passkey-library.md`](docs/adr-passkey-library.md)
- Stellar ADR: [`docs/adr-stellar-sdk.md`](docs/adr-stellar-sdk.md)
- NFC ADR: [`docs/adr-nfc-library.md`](docs/adr-nfc-library.md)
- Spike PoC page: open `/c05` in the app after starting the dev-client.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   For NFC, passkeys, and SecureStore testing, use `npm run dev-client` (`expo start --dev-client`) with an installed development build—not Expo Go.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
