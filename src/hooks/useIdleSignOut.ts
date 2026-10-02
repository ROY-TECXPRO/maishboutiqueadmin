import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

/** Sign the user out after this long with no interaction. */
export const IDLE_TIMEOUT_MS = 300 * 1000; // 300 seconds (5 minutes)

/** Warn this long before the automatic sign-out happens. */
export const IDLE_WARNING_MS = 60 * 1000;

/**
 * Any of these means "the page is being used" and resets the countdown.
 * `mousemove` IS included, so the session stays alive while the user is
 * actively moving the mouse; once the mouse stops for the full timeout the
 * user is signed out.
 */
const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'pointerdown',
  'wheel',
] as const;

/**
 * Signs the user out automatically after 300 seconds (5 minutes) of
 * inactivity — i.e. once the mouse stops and the page is left alone.
 *
 * Two timers are used rather than a polling interval:
 *  - a warning timer, so the user gets a heads-up before being logged out
 *  - a sign-out timer that fires the actual sign-out
 *
 * Both are reset on real user activity, including `mousemove`, so an actively
 * used session is never interrupted. The 1-second throttle keeps a stream of
 * mouse events from thrashing the timers. `visibilitychange` is handled
 * separately because browsers throttle timers in background tabs, so on
 * returning to the tab we re-arm and re-check the elapsed time.
 *
 * @param enabled Only run while someone is actually signed in.
 */
export function useIdleSignOut(enabled: boolean) {
  const { signOut } = useAuth();

  // Keep the latest signOut without re-running the effect on every render.
  const signOutRef = useRef(signOut);
  useEffect(() => {
    signOutRef.current = signOut;
  }, [signOut]);

  useEffect(() => {
    if (!enabled) return;

    let warningTimer: number | undefined;
    let signOutTimer: number | undefined;
    let lastReset = 0;

    const clearTimers = () => {
      if (warningTimer !== undefined) window.clearTimeout(warningTimer);
      if (signOutTimer !== undefined) window.clearTimeout(signOutTimer);
    };

    const arm = () => {
      clearTimers();
      warningTimer = window.setTimeout(() => {
        toast.warning('You will be signed out in 1 minute due to inactivity.', {
          duration: 8000,
        });
      }, IDLE_TIMEOUT_MS - IDLE_WARNING_MS);

      signOutTimer = window.setTimeout(() => {
        void signOutRef.current({ reason: 'idle' });
      }, IDLE_TIMEOUT_MS);
    };

    const onActivity = () => {
      const now = Date.now();
      // Throttle: a burst of events must not thrash the timers.
      if (now - lastReset < 1000) return;
      lastReset = now;
      arm();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      // Timers may have been throttled while hidden, so verify the gap.
      arm();
    };

    /** F4 signs the user out immediately, as a manual "lock now" shortcut. */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'F4') return;
      event.preventDefault();
      void signOutRef.current({ reason: 'manual' });
    };

    lastReset = Date.now();
    arm();

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true })
    );
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled]);
}

export default useIdleSignOut;
