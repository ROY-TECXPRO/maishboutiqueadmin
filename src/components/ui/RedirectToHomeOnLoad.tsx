import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Sends the user to the home page when the app is (re)loaded on any page
 * other than "/".
 *
 * A hard refresh (Ctrl+Shift+R) or a fresh tab open re-runs the whole SPA and
 * React Router restores whatever URL the browser had. That means refreshing
 * on /admin/products would drop the admin straight back into the dashboard
 * instead of home. This component normalises that: a page load always lands
 * on the home page.
 *
 * It deliberately fires ONLY on the first render of a page load, so ordinary
 * in-app navigation (clicking a link, using the browser back button) is never
 * hijacked. Being signed in is untouched — this only changes the URL, so the
 * Supabase session survives and the user stays logged in.
 */
/** Routes that must survive a reload — the admin login form lives here, and
 *  bouncing it to home would make it impossible to sign in. */
const PRESERVED_PATHS = ['/admin/login'];

export function RedirectToHomeOnLoad() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    if (pathname !== '/' && !PRESERVED_PATHS.includes(pathname)) {
      // `replace` so the back button does not bounce the user straight back
      // to the pre-refresh page.
      navigate('/', { replace: true });
    }
  }, [pathname, navigate]);

  return null;
}

export default RedirectToHomeOnLoad;
