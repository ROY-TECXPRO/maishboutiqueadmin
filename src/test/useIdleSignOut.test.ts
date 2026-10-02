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

  it('keeps the session alive while the mouse keeps moving', () => {
    renderHook(() => useIdleSignOut(true));

    // A mouse movement every 4 minutes across 20 minutes.
    for (let i = 0; i < 5; i += 1) {
      act(() => { vi.advanceTimersByTime(4 * 60 * 1000); });
      act(() => { window.dispatchEvent(new Event('mousemove')); });
      runTimers();
    }

    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out when the mouse stops moving for the full timeout', () => {
    renderHook(() => useIdleSignOut(true));

    // Move the mouse once, which resets the countdown.
    act(() => { vi.advanceTimersByTime(4 * 60 * 1000); });
    act(() => { window.dispatchEvent(new Event('mousemove')); });
    runTimers();

    // The mouse now stays still: no further events at all.
    act(() => { vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 1); });
    expect(signOut).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith({ reason: 'idle' });
  });

  it('signs out immediately when F4 is pressed', () => {
    renderHook(() => useIdleSignOut(true));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F4' }));
    });

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith({ reason: 'manual' });
  });

  it('ignores other keys, which must not sign the user out', () => {
    renderHook(() => useIdleSignOut(true));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(signOut).not.toHaveBeenCalled();
  });

  it('stops the timers on unmount', () => {
    const { unmount } = renderHook(() => useIdleSignOut(true));
    unmount();
    act(() => { vi.advanceTimersByTime(IDLE_TIMEOUT_MS * 2); });
    expect(signOut).not.toHaveBeenCalled();
  });
});
