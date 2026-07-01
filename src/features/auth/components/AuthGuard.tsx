/**
 * CLI-019 — AuthGuard
 *
 * Route guard component that redirects users based on auth state.
 * Prevents protected tabs from rendering when auth is incomplete.
 *
 * State → redirect rules:
 * - LOADING         → render nothing (splash is shown by AnimatedSplashOverlay)
 * - UNAUTHENTICATED → redirect to onboarding welcome
 * - ONBOARDING      → redirect to create-passkey
 * - LOCKED          → redirect to locked screen (re-auth)
 * - READY           → render children
 *
 * Loop safety: uses replace semantics so the back button doesn't loop.
 */

import { Redirect } from 'expo-router';

import { useAuth } from '../hooks/useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();

  switch (state.status) {
    case 'LOADING':
      // Splash overlay is handling the loading state
      return null;

    case 'UNAUTHENTICATED':
      return <Redirect href="/(onboarding)/welcome" />;

    case 'ONBOARDING':
      return <Redirect href="/(onboarding)/create-passkey" />;

    case 'LOCKED':
      return <Redirect href="/(onboarding)/locked" />;

    case 'READY':
      return <>{children}</>;

    default:
      return <Redirect href="/(onboarding)/welcome" />;
  }
}
