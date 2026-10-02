import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

/** Sign the user out after this long with no interaction. */
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

/** Warn this long before the automatic sign-out happens. */
export const IDLE_WARNING_MS = 60 * 1000;

/** Any of these means "the page is being used" and resets the countdown. */
const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'pointerdown',
  'wheel',
] as const;

/**
 * Signs the user out automatically after 5 minutes of inactivity.
 *
 * Two timers are used rather than a polling interval:
 *  - a warning timer, so the user gets a heads-up before being logged out
 *  - a sign-out timer that fires the actual sign-out
 *
 * Both are reset on real user activity. `mousemove` is deliberately NOT in
 * ACTIVITY_EVENTS: it fires continuously while the pointer drifts and would
 * keep a genuinely idle tab alive forever. `visibilitychange` is handled
 * separately because browsers throttle timers in background tabs, so on
 * returning to the tab we re-check the elapsed time.
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

    lastReset = Date.now();
    arm();

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true })
    );
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled]);
}

export default useIdleSignOut;
