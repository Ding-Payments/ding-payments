/// <reference types="expo/types" />

// Committed counterpart to the auto-generated (and git-ignored) `expo-env.d.ts`.
// Pulls in Expo's ambient type declarations — notably the `*.css` / `*.module.css`
// module shims — so `tsc --noEmit` resolves web CSS imports in CI, where the
// generated file is not present. See https://docs.expo.dev/guides/typescript/.

// The `process` polyfill package ships no type declarations and there is no
// `@types/process` (the Node types live in `@types/node`, which we don't want in
// a React Native project). Declare it as a shim so the Stellar SDK's Node-style
// global polyfill type-checks.
declare module 'process';
