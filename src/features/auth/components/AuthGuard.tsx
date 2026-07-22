/**
 * CLI-019 / CLI-042 — AuthGuard
 *
 * Route guard for protected tabs: auth state first, then local wallet readiness.
 *
 * State → redirect rules:
 * - LOADING         → render nothing (splash is shown by AnimatedSplashOverlay)
 * - UNAUTHENTICATED → redirect to onboarding welcome
 * - ONBOARDING      → redirect to create-passkey
 * - LOCKED          → redirect to locked screen (re-auth)
 * - READY           → require walletStore hydrated + status ready + publicKey
 *
 * Loop safety: uses replace semantics; wallet-setup lives outside (tabs) guard.
 */

import { Redirect } from 'expo-router';

import { useWalletStore } from '@/features/wallet/state/walletStore';
import { useAuth } from '../hooks/useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const hasHydrated = useWalletStore((walletState) => walletState.hasHydrated);
  const walletStatus = useWalletStore((walletState) => walletState.status);
  const walletPublicKey = useWalletStore((walletState) => walletState.publicKey);

  switch (state.status) {
    case 'LOADING':
      return null;

    case 'UNAUTHENTICATED':
      return <Redirect href="/(onboarding)/welcome" />;

    case 'ONBOARDING':
      return <Redirect href="/(onboarding)/create-passkey" />;

    case 'LOCKED':
      return <Redirect href="/(onboarding)/locked" />;

    case 'READY':
      if (!hasHydrated) {
        return null;
      }

      if (walletStatus !== 'ready' || !walletPublicKey) {
        return <Redirect href="/(onboarding)/wallet-setup" />;
      }

      return <>{children}</>;

    default:
      return <Redirect href="/(onboarding)/welcome" />;
  }
}
