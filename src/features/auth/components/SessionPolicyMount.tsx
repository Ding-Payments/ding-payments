/**
 * SessionPolicyMount
 *
 * Thin component that mounts the session policy hook inside the
 * AuthProvider tree. React hooks cannot be called in the root layout
 * directly because it renders before the provider subtree.
 *
 * Mount this as a sibling of the navigation stack, inside <AuthProvider>.
 */

import { useSessionPolicy } from '../hooks/useSessionPolicy';

export function SessionPolicyMount() {
  // nfcActive: wire from NFC feature state when available
  useSessionPolicy({ nfcActive: false });
  return null;
}
