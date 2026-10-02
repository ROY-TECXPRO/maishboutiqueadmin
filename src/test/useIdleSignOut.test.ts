import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdleSignOut, IDLE_TIMEOUT_MS, IDLE_WARNING_MS } from '@/hooks/useIdleSignOut';
import { useAuth } from '@/context/AuthContext';

const signOut = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ signOut }),
}));

vi.mock('sonner', () => ({
  toast: { warning: vi.fn(), info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

/** Runs all pending timers, e.g. every setTimeout created by the hook. */
const runTimers = () => act(() => { vi.advanceTimersByTime(0); });

describe('useIdleSignOut', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    signOut.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing when disabled (nobody signed in)', () => {
    renderHook(() => useIdleSignOut(false));
    act(() => { vi.advanceTimersByTime(IDLE_TIMEOUT_MS * 2); });
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out after 5 minutes of inactivity', () => {
    renderHook(() => useIdleSignOut(true));
    act(() => { vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 1); });
    expect(signOut).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith({ reason: 'idle' });
  });

  it('warns one minute before signing out', () => {
    renderHook(() => useIdleSignOut(true));
    act(() => { vi.advanceTimersByTime(IDLE_TIMEOUT_MS - IDLE_WARNING_MS); });
    // The warning toast fires here; sign-out has not happened yet.
    expect(signOut).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(IDLE_WARNING_MS); });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('resets the countdown on activity, so an active user is never signed out', () => {
    renderHook(() => useIdleSignOut(true));

    // Activity every 4 minutes for 20 minutes total.
    for (let i = 0; i < 5; i += 1) {
      act(() => { vi.advanceTimersByTime(4 * 60 * 1000); });
      act(() => { window.dispatchEvent(new Event('keydown')); });
      runTimers();
    }

    expect(signOut).not.toHaveBeenCalled();
  });

  it('ignores mousemove so a drifting mouse cannot keep an idle session alive', () => {
    renderHook(() => useIdleSignOut(true));

    act(() => { vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 1000); });
    // Mousemove is intentionally not an activity event.
    act(() => { window.dispatchEvent(new Event('mousemove')); });
    act(() => { vi.advanceTimersByTime(1000); });

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('stops the timers on unmount', () => {
    const { unmount } = renderHook(() => useIdleSignOut(true));
    unmount();
    act(() => { vi.advanceTimersByTime(IDLE_TIMEOUT_MS * 2); });
    expect(signOut).not.toHaveBeenCalled();
  });
});
