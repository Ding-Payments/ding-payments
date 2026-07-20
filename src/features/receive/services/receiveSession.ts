/**
 * Timer coordination for the receive flow (CLI-069).
 *
 * Owns the two timers the receive FSM depends on: request expiry (how long a
 * broadcast payment request stays valid) and wait timeout (how long we wait
 * for the payer's transaction after broadcasting). All timers are tracked so
 * `cancelAll()` can guarantee no ghost timers outlive a cancelled/reset session.
 *
 * @see docs/receive-flow.md — timeout model
 */

type CancelFn = () => void;

export class ReceiveSessionManager {
  private timers = new Set<ReturnType<typeof setTimeout>>();

  /**
   * Starts a timer that fires `onExpire` when `expiresAtSeconds` (unix seconds,
   * matching PaymentRequest.expiresAt) is reached. Returns a cancel function.
   */
  startRequestExpiry(expiresAtSeconds: number, onExpire: () => void): CancelFn {
    const delayMs = Math.max(0, expiresAtSeconds * 1000 - Date.now());
    return this.schedule(delayMs, onExpire);
  }

  /** Starts a timer that fires `onTimeout` after `ms` milliseconds. */
  startWaitTimeout(ms: number, onTimeout: () => void): CancelFn {
    return this.schedule(ms, onTimeout);
  }

  /** Cancels every timer currently tracked by this manager. */
  cancelAll(): void {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  private schedule(delayMs: number, callback: () => void): CancelFn {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delayMs);

    this.timers.add(timer);

    return () => {
      clearTimeout(timer);
      this.timers.delete(timer);
    };
  }
}

export const receiveSession = new ReceiveSessionManager();
