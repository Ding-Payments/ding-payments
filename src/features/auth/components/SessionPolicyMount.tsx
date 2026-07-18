/**
 * SessionPolicyMount
 *
 * Thin component that mounts the session policy hook inside the
 * AuthProvider tree. React hooks cannot be called in the root layout
 * directly because it renders before the provider subtree.
 */

import { useSessionPolicy } from '../hooks/useSessionPolicy';

export function SessionPolicyMount() {
  useSessionPolicy();
  return null;
}
