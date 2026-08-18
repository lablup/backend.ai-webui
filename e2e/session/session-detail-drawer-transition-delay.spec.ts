// spec: regression guard for FR-3568
//
// Bug: `SessionDetailAndContainerLogOpenerLegacy` used to read the
// `sessionDetail` URL param via nuqs `useQueryState`, which applies EXTERNAL
// URL changes (a plain history push via `useWebUINavigate`, as
// `ComputeSessionListPage` does when a row's name is clicked -- not nuqs' own
// setter) inside `startTransition`. When another transition is concurrently
// pending on the same root -- e.g. the session list's own
// `useDeferredValue`-driven refetch, suspended in flight without a fallback
// -- React entangles the drawer's param-driven mount with that other
// transition and delays it by seconds. Reading the param from
// `useLocation()` instead (the fix) is a plain render, not entangled with any
// pending transition, so the drawer opens immediately regardless.
//
// This test makes the entanglement window deterministic: it holds the
// session list's own refetch transition open by delaying the *second*
// `ComputeSessionListPageQuery` response (the one triggered by clicking
// Refresh), then opens the session detail drawer while that refetch is still
// in flight. On the unpatched build the drawer mount is entangled with the
// pending refetch and the tight visibility bound below times out; the fix
// keeps the mount independent of it.
import {
  getTableRefreshButton,
  loginAsUser,
  navigateTo,
} from '../utils/test-util';
import { sessionDetailMockResponse } from './mocking/session-detail-mock';
import { sessionListMockResponse } from './mocking/session-list-mock';
import { test, expect, type Route } from '@playwright/test';

// Fires during page load (possibly more than once) and again when Refresh
// is clicked -- the armed firing after the click is the one we hold open.
const SESSION_LIST_QUERY = 'ComputeSessionListPageQuery';
// Not expected to fire for this flow (the clicked row already carries a fresh
// fragment via router state, so SessionDetailContent reads it store-only),
// but mocked defensively so the route never falls through to a live backend.
const SESSION_DETAIL_QUERY = 'SessionDetailContentQuery';
// Deliberate latency injection (see header) -- not an arbitrary flake wait.
const HELD_TRANSITION_DELAY_MS = 4000;
// The drawer must mount well under the injected delay, proving it did not
// wait on the held refetch. A cold mount is comfortably sub-second.
const DRAWER_OPEN_BOUND_MS = 1500;

const MOCK_SESSION_NAME = 'mock-session-for-scheduling-history';

test.describe(
  'Session Detail Drawer - transition-delay regression (FR-3568)',
  { tag: ['@critical', '@session', '@regression'] },
  () => {
    test.describe.configure({ mode: 'default' });

    test('User can open the session detail drawer promptly while a session-list refetch is held in flight', async ({
      page,
      request,
    }) => {
      test.setTimeout(60000);

      // Mock the session list (and, defensively, the detail query) so the
      // test needs no live session/cluster -- only fault-injects a delay on
      // the second list refetch. Set up before login/navigation so it is in
      // place before any query fires.
      // Armed explicitly right before the Refresh click — an ordinal
      // ("2nd query") arm can be spent by an extra list query during
      // initial load, letting the spec pass without a held transition.
      let holdArmed = false;
      let heldRefetchCount = 0;
      let signalHeldRefetchStarted: () => void = () => {};
      const heldRefetchStarted = new Promise<void>((resolve) => {
        signalHeldRefetchStarted = resolve;
      });
      await page.route('**/admin/gql', async (route: Route) => {
        const req = route.request();
        if (req.method() !== 'POST') {
          return route.continue();
        }
        const body = req.postData() ?? '';

        if (body.includes(SESSION_LIST_QUERY)) {
          if (holdArmed) {
            holdArmed = false;
            heldRefetchCount += 1;
            signalHeldRefetchStarted();
            await new Promise((resolve) =>
              setTimeout(resolve, HELD_TRANSITION_DELAY_MS),
            );
          }
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: sessionListMockResponse() }),
          });
        }

        if (body.includes(SESSION_DETAIL_QUERY)) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: sessionDetailMockResponse({}) }),
          });
        }

        return route.continue();
      });

      await loginAsUser(page, request);
      await navigateTo(page, 'session');

      const sessionNameButton = page.getByRole('button', {
        name: MOCK_SESSION_NAME,
        exact: true,
      });
      await expect(sessionNameButton).toBeVisible({ timeout: 15000 });

      // Arm the hold only now, then click Refresh to start the held (delayed)
      // refetch -- the concurrently pending transition the drawer mount must
      // not entangle with.
      holdArmed = true;
      await getTableRefreshButton(page).click();

      // The refresh click only schedules the deferred refetch; wait until the
      // delayed request has actually STARTED so the held transition is
      // guaranteed to be in flight when the drawer opens.
      await heldRefetchStarted;

      // Without waiting for that refetch to resolve, open the drawer via an
      // in-app click (the path that triggers `webUINavigate`, i.e. the
      // "external" URL change nuqs used to pick up).
      await sessionNameButton.click();

      // The URL updates immediately regardless of the bug -- `webUINavigate`
      // pushes the param synchronously.
      await expect(page).toHaveURL(/[?&]sessionDetail=/, { timeout: 2000 });

      // The drawer must actually mount, and quickly -- well under
      // HELD_TRANSITION_DELAY_MS. On the unpatched build the param read was
      // entangled with the still-pending refetch transition, so this timed
      // out instead.
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      await expect(drawer).toBeVisible({ timeout: DRAWER_OPEN_BOUND_MS });

      // Guard against a false green: if the held refetch never fired we never
      // exercised the entanglement window, so a passing drawer would prove
      // nothing.
      expect(
        heldRefetchCount,
        `${SESSION_LIST_QUERY} should have been held exactly once (armed refresh)`,
      ).toBe(1);

      // Close clears the param; the drawer must not be left poisoned for a
      // re-open.
      await drawer.getByRole('button', { name: 'Close' }).click();
      await expect(page).not.toHaveURL(/[?&]sessionDetail=/, {
        timeout: 5000,
      });
    });
  },
);
