import { Buffer } from 'buffer';
import process from 'process';
import 'react-native-get-random-values';

let applied = false;

export function ensureStellarPolyfills(): void {
  if (applied) return;

  const globalScope = globalThis as typeof globalThis & {
    Buffer?: typeof Buffer;
    process?: typeof process;
  };

  globalScope.Buffer = globalScope.Buffer ?? Buffer;
  globalScope.process = globalScope.process ?? process;
  applied = true;
}
