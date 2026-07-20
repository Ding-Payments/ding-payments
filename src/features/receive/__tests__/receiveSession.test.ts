import { ReceiveSessionManager } from '@/features/receive/services/receiveSession';

describe('ReceiveSessionManager', () => {
  let manager: ReceiveSessionManager;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
    manager = new ReceiveSessionManager();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('startRequestExpiry fires onExpire once the expiry timestamp is reached', () => {
    const onExpire = jest.fn();

    manager.startRequestExpiry(5, onExpire);

    jest.advanceTimersByTime(4_999);
    expect(onExpire).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('the cancel function returned by startRequestExpiry prevents onExpire from firing', () => {
    const onExpire = jest.fn();

    const cancel = manager.startRequestExpiry(5, onExpire);
    cancel();

    jest.advanceTimersByTime(10_000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('cancelAll() stops every active timer', () => {
    const onExpire = jest.fn();
    const onTimeout = jest.fn();

    manager.startRequestExpiry(5, onExpire);
    manager.startWaitTimeout(3_000, onTimeout);

    manager.cancelAll();

    jest.advanceTimersByTime(60_000);
    expect(onExpire).not.toHaveBeenCalled();
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('startWaitTimeout fires onTimeout after the given delay', () => {
    const onTimeout = jest.fn();

    manager.startWaitTimeout(60_000, onTimeout);

    jest.advanceTimersByTime(59_999);
    expect(onTimeout).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
