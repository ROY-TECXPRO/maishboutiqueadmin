import { describe, it, expect } from 'vitest';
import {
  canViewActivityLog,
  ACTIVITY_LOG_VIEWER_EMAIL,
} from '@/lib/adminActivity';

/**
 * The activity log is owner-only. Postgres RLS is the real boundary (a second
 * admin gets zero rows from the API); these tests pin the client-side rule so
 * the tab and panel stay hidden for everyone else.
 */
describe('activity log visibility', () => {
  it('lets the main admin read the log', () => {
    expect(canViewActivityLog('roysanga127@gmail.com')).toBe(true);
  });

  it('hides the log from the second admin', () => {
    expect(canViewActivityLog('maishboutique@gmail.com')).toBe(false);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(canViewActivityLog('  RoySanga127@Gmail.com  ')).toBe(true);
  });

  it('denies signed-out and empty identities', () => {
    expect(canViewActivityLog(null)).toBe(false);
    expect(canViewActivityLog(undefined)).toBe(false);
    expect(canViewActivityLog('')).toBe(false);
  });

  it('does not treat a look-alike address as the owner', () => {
    expect(canViewActivityLog('roysanga127@gmail.com.attacker.net')).toBe(false);
    expect(canViewActivityLog('roysanga127+other@gmail.com')).toBe(false);
    expect(canViewActivityLog('roysanga127@evil.co.ke')).toBe(false);
  });

  it('anchors on the exact owner address', () => {
    expect(ACTIVITY_LOG_VIEWER_EMAIL).toBe('roysanga127@gmail.com');
  });
});